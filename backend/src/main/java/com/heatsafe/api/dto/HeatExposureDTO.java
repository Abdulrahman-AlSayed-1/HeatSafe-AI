package com.heatsafe.api.dto;

import lombok.*;

/**
 * Heat exposure metrics for a worksite: hours above threshold, longest continuous block, peak hour.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HeatExposureDTO {
    private Integer hoursAboveThreshold;
    private Integer longestContinuousExposure;
    private String peakHeatHour;          // e.g. "14:00"
    private Double thresholdCelsius;       // e.g. 35.0
}
