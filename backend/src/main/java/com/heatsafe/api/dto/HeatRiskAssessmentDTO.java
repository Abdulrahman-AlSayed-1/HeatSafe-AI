package com.heatsafe.api.dto;

import com.heatsafe.domain.risk.HeatRiskAssessment;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HeatRiskAssessmentDTO {
    private String riskLevel;
    private Double score;
    private List<CriticalWindowDTO> criticalWindows;
    private List<AffectedTaskDTO> affectedTasks;
    private List<String> reasons;
    private LocalDateTime assessedAt;
    
    public static HeatRiskAssessmentDTO fromDomain(HeatRiskAssessment assessment) {
        return HeatRiskAssessmentDTO.builder()
                .riskLevel(assessment.getRiskLevel().name())
                .score(assessment.getScore())
                .criticalWindows(assessment.getCriticalWindows().stream()
                        .map(CriticalWindowDTO::fromDomain)
                        .collect(Collectors.toList()))
                .affectedTasks(assessment.getAffectedTasks().stream()
                        .map(AffectedTaskDTO::fromDomain)
                        .collect(Collectors.toList()))
                .reasons(assessment.getReasons() != null ? assessment.getReasons() : new java.util.ArrayList<>())
                .assessedAt(assessment.getAssessedAt())
                .build();
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CriticalWindowDTO {
        private String start;
        private String end;
        private Double maxTemperature;
        
        public static CriticalWindowDTO fromDomain(HeatRiskAssessment.CriticalWindow window) {
            return CriticalWindowDTO.builder()
                    .start(window.getStart().toString())
                    .end(window.getEnd().toString())
                    .maxTemperature(window.getMaxTemperature())
                    .build();
        }
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AffectedTaskDTO {
        private Long taskId;
        private String taskName;
        private String taskStart;
        private String taskEnd;
        private Integer workerCount;
        private String forecastStatus;
        private String riskLevel;
        private Double riskScore;
        private String reason;
        
        public static AffectedTaskDTO fromDomain(HeatRiskAssessment.AffectedTask task) {
            return AffectedTaskDTO.builder()
                    .taskId(task.getTaskId())
                    .taskName(task.getTaskName())
                    .taskStart(task.getTaskStart().toString())
                    .taskEnd(task.getTaskEnd().toString())
                    .workerCount(task.getWorkerCount() != null ? task.getWorkerCount() : 1)
                    .forecastStatus(task.getForecastStatus() != null ? task.getForecastStatus().name() : "FORECASTABLE")
                    .riskLevel(task.getRiskLevel().name())
                    .riskScore(task.getRiskScore())
                    .reason(task.getReason())
                    .build();
        }
    }
}
