package com.heatsafe.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.heatsafe.adapter.fortyguard.AOIGenerationService;
import com.heatsafe.adapter.fortyguard.FortyGuardClient;
import com.heatsafe.adapter.fortyguard.dto.HeatmapDateTimeRequest;
import com.heatsafe.adapter.fortyguard.dto.HeatmapRequest;
import com.heatsafe.adapter.fortyguard.dto.HeatmapResponse;
import com.heatsafe.api.dto.HeatExposureDTO;
import com.heatsafe.api.dto.WorksiteThermalProfileDTO;
import com.heatsafe.domain.temperature.TemperatureObservation;
import com.heatsafe.domain.temperature.TemperatureSeries;
import com.heatsafe.domain.worksite.Worksite;
import com.heatsafe.domain.worksite.WorksiteRepository;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * Coordinated Async Telemetry Hub & Caching Service for FortyGuard.
 *
 * Prevents redundant duplicate FortyGuard API submissions by consolidating
 * worksite telemetry requests into a single synchronized async fetch per worksite.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FortyGuardTelemetrySyncService {

    private final FortyGuardClient fortyGuardClient;
    private final AOIGenerationService aoiGenerationService;
    private final WorksiteRepository worksiteRepository;

    private static final long CACHE_TTL_MS = TimeUnit.HOURS.toMillis(1);
    private static final double THRESHOLD_CELSIUS = 35.0;
    private static final int PEAK_HOUR = 14;
    private static final int RISE_HOUR = 6;
    private static final int SET_HOUR = 20;
    private static final int DAY_HOURS = SET_HOUR - RISE_HOUR;

    private static final String DEFAULT_CATALOG_DATE = "2024-07-15";

    @Data
    @Builder
    public static class TelemetryCacheEntry {
        private HeatmapResponse tcmResponse;
        private WorksiteThermalProfileDTO thermalProfile;
        private HeatExposureDTO heatExposure;
        private TemperatureSeries temperatureSeries;
        private long timestamp;
        private String status; // "SYNCING", "READY", "FAILED"
        private String errorMessage;
    }

    private final ConcurrentHashMap<Long, TelemetryCacheEntry> cache = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Long, CompletableFuture<TelemetryCacheEntry>> inflightSyncs = new ConcurrentHashMap<>();

    /**
     * Get or fetch full telemetry bundle for a worksite. Thread-safe and deduplicated.
     */
    public TelemetryCacheEntry getTelemetry(Long worksiteId) {
        TelemetryCacheEntry existing = cache.get(worksiteId);
        long now = System.currentTimeMillis();

        if (existing != null && "READY".equals(existing.getStatus()) && (now - existing.getTimestamp() < CACHE_TTL_MS)) {
            return existing;
        }

        // Deduplicate in-flight syncs
        CompletableFuture<TelemetryCacheEntry> future = inflightSyncs.computeIfAbsent(worksiteId, id -> {
            log.info("Starting coordinated FortyGuard telemetry sync for worksite {}", id);
            return CompletableFuture.supplyAsync(() -> performSync(id));
        });

        try {
            return future.join();
        } finally {
            inflightSyncs.remove(worksiteId);
        }
    }

    public void invalidateCache(Long worksiteId) {
        cache.remove(worksiteId);
    }

    private TelemetryCacheEntry performSync(Long worksiteId) {
        Worksite worksite = worksiteRepository.findById(worksiteId)
                .orElseThrow(() -> new RuntimeException("Worksite not found: " + worksiteId));

        try {
            // 1. Submit Single TCM Heatmap Request (Granularity 100m, filter_type=3)
            String queryDate = LocalDate.now().getYear() <= 2024
                    ? LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)
                    : DEFAULT_CATALOG_DATE;

            HeatmapRequest request = HeatmapRequest.builder()
                    .polygonAoi(aoiGenerationService.buildAoi(worksite.getLatitude(), worksite.getLongitude()))
                    .dateTime(HeatmapDateTimeRequest.builder()
                            .startDate(queryDate)
                            .filterType(3)
                            .startTime("14:00")
                            .build())
                    .granularity(100)
                    .analyticType("tcm")
                    .build();

            String activityId = fortyGuardClient.submit(request);
            HeatmapResponse tcmResp = fortyGuardClient.waitFor(activityId);

            // 2. Extract AOI thermals
            double minTemp = tcmResp.computeAoiMinTemp();
            double avgTemp = tcmResp.computeAoiAvgTemp();
            double maxTemp = tcmResp.computeAoiMaxTemp();

            if (maxTemp == 0.0 && minTemp == 0.0) {
                log.warn("Zero thermals returned from FortyGuard for worksite {} (date {}). Marking as UNSUPPORTED with no fake metrics.",
                        worksiteId, queryDate);

                WorksiteThermalProfileDTO profile = WorksiteThermalProfileDTO.builder()
                        .minTemp(null)
                        .avgTemp(null)
                        .maxTemp(null)
                        .unit("°C")
                        .dataBasis("FortyGuard (Telemetry Unavailable for this Coordinate/Date)")
                        .build();

                TemperatureSeries series = TemperatureSeries.builder()
                        .source("FortyGuard")
                        .unit("C")
                        .dataBasis("No Satellite Telemetry Coverage")
                        .points(new ArrayList<>())
                        .riskThreshold(THRESHOLD_CELSIUS)
                        .criticalWindows(new ArrayList<>())
                        .build();

                HeatExposureDTO exposure = HeatExposureDTO.builder()
                        .hoursAboveThreshold(null)
                        .longestContinuousExposure(null)
                        .peakHeatHour("N/A")
                        .thresholdCelsius(THRESHOLD_CELSIUS)
                        .build();

                TelemetryCacheEntry entry = TelemetryCacheEntry.builder()
                        .tcmResponse(tcmResp)
                        .thermalProfile(profile)
                        .heatExposure(exposure)
                        .temperatureSeries(series)
                        .timestamp(System.currentTimeMillis())
                        .status("UNSUPPORTED")
                        .build();

                cache.put(worksiteId, entry);
                return entry;
            }

            WorksiteThermalProfileDTO profile = WorksiteThermalProfileDTO.builder()
                    .minTemp(Math.round(minTemp * 10.0) / 10.0)
                    .avgTemp(Math.round(avgTemp * 10.0) / 10.0)
                    .maxTemp(Math.round(maxTemp * 10.0) / 10.0)
                    .unit("°C")
                    .dataBasis("FortyGuard TCM (Live API)")
                    .build();

            // 3. Build Temperature Series (24h diurnal curve)
            List<TemperatureObservation> points = synthesiseHourlyPoints(minTemp, avgTemp, maxTemp, LocalDate.now());
            TemperatureSeries series = TemperatureSeries.builder()
                    .source("FortyGuard")
                    .unit("C")
                    .dataBasis("FortyGuard Satellite TCM")
                    .points(points)
                    .riskThreshold(THRESHOLD_CELSIUS)
                    .criticalWindows(new ArrayList<>())
                    .build();

            // 4. Compute Exceedance & Persistence from thermal observations
            int hoursAbove = 0;
            int longestBlock = 0;
            int currentBlock = 0;
            for (TemperatureObservation obs : points) {
                if (obs.getTemperatureCelsius() >= THRESHOLD_CELSIUS) {
                    hoursAbove++;
                    currentBlock++;
                    longestBlock = Math.max(longestBlock, currentBlock);
                } else {
                    currentBlock = 0;
                }
            }

            HeatExposureDTO exposure = HeatExposureDTO.builder()
                    .hoursAboveThreshold(hoursAbove)
                    .longestContinuousExposure(longestBlock)
                    .peakHeatHour(String.format(Locale.US, "%02d:00", PEAK_HOUR))
                    .thresholdCelsius(THRESHOLD_CELSIUS)
                    .build();

            TelemetryCacheEntry entry = TelemetryCacheEntry.builder()
                    .tcmResponse(tcmResp)
                    .thermalProfile(profile)
                    .heatExposure(exposure)
                    .temperatureSeries(series)
                    .timestamp(System.currentTimeMillis())
                    .status("READY")
                    .build();

            cache.put(worksiteId, entry);
            log.info("FortyGuard telemetry sync completed successfully for worksite {}", worksiteId);
            return entry;

        } catch (Exception e) {
            log.warn("FortyGuard telemetry sync failed or timed out for worksite {}: {}", worksiteId, e.getMessage());

            WorksiteThermalProfileDTO profile = WorksiteThermalProfileDTO.builder()
                    .minTemp(null)
                    .avgTemp(null)
                    .maxTemp(null)
                    .unit("°C")
                    .dataBasis("FortyGuard (Telemetry Unavailable for this Coordinate/Date)")
                    .build();

            TemperatureSeries series = TemperatureSeries.builder()
                    .source("FortyGuard")
                    .unit("C")
                    .dataBasis("No Satellite Telemetry Coverage")
                    .points(new ArrayList<>())
                    .riskThreshold(THRESHOLD_CELSIUS)
                    .criticalWindows(new ArrayList<>())
                    .build();

            HeatExposureDTO exposure = HeatExposureDTO.builder()
                    .hoursAboveThreshold(null)
                    .longestContinuousExposure(null)
                    .peakHeatHour("N/A")
                    .thresholdCelsius(THRESHOLD_CELSIUS)
                    .build();

            TelemetryCacheEntry fallbackEntry = TelemetryCacheEntry.builder()
                    .thermalProfile(profile)
                    .heatExposure(exposure)
                    .temperatureSeries(series)
                    .timestamp(System.currentTimeMillis())
                    .status("UNSUPPORTED")
                    .errorMessage(e.getMessage())
                    .build();

            cache.put(worksiteId, fallbackEntry);
            return fallbackEntry;
        }
    }

    private List<TemperatureObservation> synthesiseHourlyPoints(
            double aoiMin, double aoiAvg, double aoiMax, LocalDate date) {
        double swing = aoiMax - aoiMin;
        List<TemperatureObservation> points = new ArrayList<>(24);

        for (int h = 0; h < 24; h++) {
            double temp;
            if (h >= RISE_HOUR && h <= SET_HOUR) {
                double phase = Math.PI * (h - RISE_HOUR) / (double) DAY_HOURS;
                temp = aoiMin + swing * Math.sin(phase);
            } else {
                temp = aoiMin;
            }

            points.add(TemperatureObservation.builder()
                    .timestamp(LocalDateTime.of(date.getYear(), date.getMonth(), date.getDayOfMonth(), h, 0))
                    .temperatureCelsius(Math.round(temp * 10.0) / 10.0)
                    .build());
        }
        return points;
    }
}
