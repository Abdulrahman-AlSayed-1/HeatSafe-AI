package com.heatsafe.adapter.fortyguard.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.*;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;

/**
 * Response from GET /v1/status/{activity_id} once the job completes.
 * The full result is stored under "result": { "stats_data": {...}, "map_data": {...} }
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Slf4j
public class HeatmapResponse {

    @JsonProperty("activity_id")
    private String activityId;

    /** Raw stats_data from FortyGuard */
    @JsonProperty("stats_data")
    private JsonNode statsData;

    /** GeoJSON FeatureCollection */
    @JsonProperty("map_data")
    private JsonNode mapData;

    // ── Computed helpers ────────────────────────────────────────────────────

    private static final ObjectMapper MAPPER = new ObjectMapper();

    /**
     * Returns list of tile property objects parsed from map_data.features[*].properties.
     */
    public List<HeatmapTileProperties> getTileProperties() {
        List<HeatmapTileProperties> tiles = new ArrayList<>();
        if (mapData == null) return tiles;
        JsonNode features = mapData.get("features");
        if (features == null || !features.isArray()) return tiles;
        for (JsonNode feature : features) {
            JsonNode props = feature.get("properties");
            if (props != null) {
                try {
                    tiles.add(MAPPER.treeToValue(props, HeatmapTileProperties.class));
                } catch (Exception e) {
                    log.warn("Could not parse tile properties: {}", e.getMessage());
                }
            }
        }
        return tiles;
    }

    /** AOI-wide average of average_temperature across all tiles or stats_data. */
    public double computeAoiAvgTemp() {
        double tileAvg = getTileProperties().stream()
                .filter(t -> t.getAverageTemperature() != null)
                .mapToDouble(HeatmapTileProperties::getAverageTemperature)
                .average()
                .orElse(0.0);
        if (tileAvg > 0.0) return tileAvg;

        if (statsData != null) {
            JsonNode tempStats = statsData.has("temperature_stats") ? statsData.get("temperature_stats") : statsData.get("Temperature_stats");
            if (tempStats != null && tempStats.has("mean")) {
                return tempStats.get("mean").asDouble(0.0);
            }
            if (statsData.has("mean")) {
                return statsData.get("mean").asDouble(0.0);
            }
        }
        return 0.0;
    }

    /** AOI-wide minimum of min_temperature across all tiles or stats_data. */
    public double computeAoiMinTemp() {
        double tileMin = getTileProperties().stream()
                .filter(t -> t.getMinTemperature() != null)
                .mapToDouble(HeatmapTileProperties::getMinTemperature)
                .min()
                .orElse(0.0);
        if (tileMin > 0.0) return tileMin;

        if (statsData != null) {
            JsonNode tempStats = statsData.has("temperature_stats") ? statsData.get("temperature_stats") : statsData.get("Temperature_stats");
            if (tempStats != null && tempStats.has("minimum")) {
                return tempStats.get("minimum").asDouble(0.0);
            }
            if (statsData.has("min")) {
                return statsData.get("min").asDouble(0.0);
            }
        }
        return 0.0;
    }

    /** AOI-wide maximum of max_temperature across all tiles or stats_data. */
    public double computeAoiMaxTemp() {
        double tileMax = getTileProperties().stream()
                .filter(t -> t.getMaxTemperature() != null)
                .mapToDouble(HeatmapTileProperties::getMaxTemperature)
                .max()
                .orElse(0.0);
        if (tileMax > 0.0) return tileMax;

        if (statsData != null) {
            JsonNode tempStats = statsData.has("temperature_stats") ? statsData.get("temperature_stats") : statsData.get("Temperature_stats");
            if (tempStats != null && tempStats.has("maximum")) {
                return tempStats.get("maximum").asDouble(0.0);
            }
            if (statsData.has("max")) {
                return statsData.get("max").asDouble(0.0);
            }
        }
        return 0.0;
    }

    /** Average hours_above_threshold across tiles (exceedance analytic_type). */
    public double computeAvgHoursAboveThreshold() {
        double avg = getTileProperties().stream()
                .filter(t -> t.getHoursAboveThreshold() != null)
                .mapToDouble(HeatmapTileProperties::getHoursAboveThreshold)
                .average()
                .orElse(0.0);
        if (avg > 0.0) return avg;

        if (statsData != null && statsData.has("mean")) {
            return statsData.get("mean").asDouble(0.0);
        }
        return 0.0;
    }

    /** Average longest_continuous_hours across tiles (persistence analytic_type). */
    public double computeAvgLongestContinuous() {
        double avg = getTileProperties().stream()
                .filter(t -> t.getLongestContinuousHours() != null)
                .mapToDouble(HeatmapTileProperties::getLongestContinuousHours)
                .average()
                .orElse(0.0);
        if (avg > 0.0) return avg;

        if (statsData != null && statsData.has("mean")) {
            return statsData.get("mean").asDouble(0.0);
        }
        return 0.0;
    }
}
