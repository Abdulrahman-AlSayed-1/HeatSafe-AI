package com.heatsafe.adapter.fortyguard.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

/**
 * Represents the date_time object in the FortyGuard /v1/heatmap request.
 * filter_type values:
 *   1 = single hour      → tile has: temperature
 *   2 = range of hours   → tile has: temperature (aggregated), needs end_time
 *   3 = single day       → tile has: min_temperature, max_temperature, average_temperature
 *   4 = range of days    → tile has: aggregates, needs end_date
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class HeatmapDateTimeRequest {

    @JsonProperty("start_date")
    private String startDate;      // e.g. "2024-07-15"

    @JsonProperty("filter_type")
    private int filterType;        // 1, 2, 3, or 4

    @JsonProperty("start_time")
    private String startTime;      // e.g. "14:00"  (required for filter_type 1 & 2)

    @JsonProperty("end_time")
    private String endTime;        // required for filter_type 2

    @JsonProperty("end_date")
    private String endDate;        // required for filter_type 4
}
