package com.heatsafe.adapter.fortyguard.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.*;

/**
 * POST /v1/heatmap request body.
 * polygon_aoi must be a GeoJSON FeatureCollection (coordinates in [lon, lat] order).
 * analytic_type: "tcm" | "time_of_measure" | "exceedance" | "persistence"
 * granularity: 60, 80, or 100 (metres)
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HeatmapRequest {

    @JsonProperty("polygon_aoi")
    private JsonNode polygonAoi;       // GeoJSON FeatureCollection as JsonNode

    @JsonProperty("date_time")
    private HeatmapDateTimeRequest dateTime;

    @JsonProperty("granularity")
    private int granularity;           // 60, 80, or 100

    @JsonProperty("analytic_type")
    private String analyticType;       // "tcm", "exceedance", "persistence", "time_of_measure"
}
