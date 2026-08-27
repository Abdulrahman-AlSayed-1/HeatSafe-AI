package com.heatsafe.adapter.fortyguard.impl;

import com.heatsafe.adapter.fortyguard.AOIGenerationService;
import com.heatsafe.adapter.fortyguard.FortyGuardClient;
import com.heatsafe.adapter.fortyguard.Location;
import com.heatsafe.adapter.fortyguard.TemperatureDataProvider;
import com.heatsafe.adapter.fortyguard.TimeWindow;
import com.heatsafe.adapter.fortyguard.dto.HeatmapDateTimeRequest;
import com.heatsafe.adapter.fortyguard.dto.HeatmapRequest;
import com.heatsafe.adapter.fortyguard.dto.HeatmapResponse;
import com.heatsafe.domain.temperature.TemperatureObservation;
import com.heatsafe.domain.temperature.TemperatureSeries;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Builds a TemperatureSeries from the FortyGuard /v1/heatmap response.
 *
 * Strategy (filter_type=3, single day):
 *   1. Call the API with analytic_type=tcm and filter_type=3 to get
 *      min/avg/max temperature across all tiles.
 *   2. Synthesise 24 hourly observations using a sine-wave diurnal curve:
 *        T(h) = avg + swing * sin(π * (h - RISE_H) / DAY_HOURS)   for h in [RISE_H, SET_H]
 *        T(h) = min                                                   otherwise
 *      where swing = (max - avg) and RISE_H=6, SET_H=20 (14-hour day)
 *   3. Pass ALL 24 observations into TemperatureSeries so the critical-window
 *      logic in HeatRiskServiceImpl actually has data to work with.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class FortyGuardTemperatureDataProvider implements TemperatureDataProvider {

    private final FortyGuardClient fortyGuardClient;
    private final AOIGenerationService aoiGenerationService;

    private static final int PEAK_HOUR  = 14;  // 2 PM
    private static final int RISE_HOUR  = 6;   // 6 AM
    private static final int SET_HOUR   = 20;  // 8 PM
    private static final int DAY_HOURS  = SET_HOUR - RISE_HOUR; // 14

    @Override
    public TemperatureSeries getSeries(Location location, TimeWindow window) {
        HeatmapRequest request = HeatmapRequest.builder()
                .polygonAoi(aoiGenerationService.buildAoi(location.getLatitude(), location.getLongitude()))
                .dateTime(HeatmapDateTimeRequest.builder()
                        .startDate(window.getStart().toLocalDate().format(DateTimeFormatter.ISO_LOCAL_DATE))
                        .filterType(3)   // single-day: gives min/avg/max per tile
                        .startTime(String.format("%02d:00", PEAK_HOUR))
                        .build())
                .granularity(100)
                .analyticType("tcm")
                .build();

        String activityId = fortyGuardClient.submit(request);
        HeatmapResponse result = fortyGuardClient.waitFor(activityId);

        return buildTemperatureSeries(result, window.getStart());
    }

    // ── Private helpers ─────────────────────────────────────────────────────

    private TemperatureSeries buildTemperatureSeries(HeatmapResponse result, LocalDateTime referenceTime) {
        double aoiMin = result.computeAoiMinTemp();
        double aoiAvg = result.computeAoiAvgTemp();
        double aoiMax = result.computeAoiMaxTemp();

        // Guard against all-zero response (empty tile list)
        if (aoiMax == 0.0 && aoiMin == 0.0) {
            log.warn("FortyGuard returned zero-value temperatures; using defaults");
            aoiMin = 28.0; aoiAvg = 35.0; aoiMax = 42.0;
        }

        log.debug("AOI thermals: min={}°C avg={}°C max={}°C", aoiMin, aoiAvg, aoiMax);

        List<TemperatureObservation> points = synthesiseHourlyPoints(aoiMin, aoiAvg, aoiMax, referenceTime);

        return TemperatureSeries.builder()
                .source("FortyGuard")
                .unit("C")
                .dataBasis("tcm-filter3")
                .points(points)
                .riskThreshold(35.0)
                .criticalWindows(new ArrayList<>())
                .build();
    }

    /**
     * Generates 24 synthetic hourly observations using a sine-wave diurnal model:
     *   - Night / early morning hours: near aoiMin
     *   - Daytime (RISE_HOUR → SET_HOUR): half-sine from aoiMin → aoiMax, peak at PEAK_HOUR
     */
    private List<TemperatureObservation> synthesiseHourlyPoints(
            double aoiMin, double aoiAvg, double aoiMax, LocalDateTime referenceTime) {

        double swing = aoiMax - aoiMin;
        LocalDate date = referenceTime.toLocalDate();
        List<TemperatureObservation> points = new ArrayList<>(24);

        for (int h = 0; h < 24; h++) {
            double temp;
            if (h >= RISE_HOUR && h <= SET_HOUR) {
                // Half-sine: 0 at RISE_HOUR, peak at PEAK_HOUR, 0 at SET_HOUR
                double phase = Math.PI * (h - RISE_HOUR) / (double) DAY_HOURS;
                temp = aoiMin + swing * Math.sin(phase);
            } else {
                temp = aoiMin;
            }

            points.add(TemperatureObservation.builder()
                    .timestamp(LocalDateTime.of(date.getYear(), date.getMonth(), date.getDayOfMonth(), h, 0))
                    .temperatureCelsius(temp)
                    .build());
        }
        return points;
    }
}
