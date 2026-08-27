package com.heatsafe.adapter.fortyguard.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.*;

/**
 * Tile-level temperature properties from map_data.features[*].properties.
 * For filter_type=3 (single day): min_temperature, max_temperature, average_temperature are populated.
 * For filter_type=1/2 (hour/range):  temperature is populated.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HeatmapTileProperties {

    @JsonProperty("tile_id")
    private String tileId;

    /** filter_type 1 or 2 */
    @JsonProperty("temperature")
    private Double temperature;

    /** filter_type 3 or 4 */
    @JsonProperty("average_temperature")
    private Double averageTemperature;

    @JsonProperty("min_temperature")
    private Double minTemperature;

    @JsonProperty("max_temperature")
    private Double maxTemperature;

    // exceedance: hours_above_threshold
    @JsonProperty("hours_above_threshold")
    private Double hoursAboveThreshold;

    // persistence: longest_continuous_hours
    @JsonProperty("longest_continuous_hours")
    private Double longestContinuousHours;
}
