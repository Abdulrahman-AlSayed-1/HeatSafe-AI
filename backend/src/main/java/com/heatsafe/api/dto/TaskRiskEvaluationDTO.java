package com.heatsafe.api.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskRiskEvaluationDTO {
    private String riskLevel; // "SAFE", "LOW", "MODERATE", "HIGH", "EXTREME"
    private Double riskScore; // 1.0 - 10.0
    private String riskReason;
    private Double taskPeakTemp;
}
