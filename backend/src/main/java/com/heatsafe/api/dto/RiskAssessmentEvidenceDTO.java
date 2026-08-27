package com.heatsafe.api.dto;

import lombok.*;
import java.util.List;

/**
 * Rich context object aggregating risk assessment, thermal profile, and heat exposure
 * for prompting AI recommendation models.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RiskAssessmentEvidenceDTO {
    private String riskLevel;
    private Double score;
    private List<String> reasons;
    private Double thermalMinTemp;
    private Double thermalAvgTemp;
    private Double thermalMaxTemp;
    private Integer hoursAboveThreshold;
    private Integer longestContinuousExposure;
    private List<TaskEvidenceDTO> affectedTasks;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TaskEvidenceDTO {
        private String taskName;
        private String exposureType;
        private String timeRange;
        private Double riskScore;
        private Integer workerCount;
        private String reason;
    }
}
