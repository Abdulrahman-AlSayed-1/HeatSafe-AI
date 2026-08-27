package com.heatsafe.api.dto;

import com.heatsafe.domain.risk.HeatRiskAssessment;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScenarioResponseDTO {
    private HeatRiskAssessmentDTO baselineAssessment;
    private HeatRiskAssessmentDTO proposedAssessment;
    private TaskRiskEvaluationDTO baselineTaskRisk;
    private TaskRiskEvaluationDTO proposedTaskRisk;
    private Boolean applied;
    private TaskDTO updatedTask;
    private String mitigationSummary;
    private LocalDateTime createdAt;
    
    public static ScenarioResponseDTO fromDomain(HeatRiskAssessment baseline, HeatRiskAssessment proposed) {
        return ScenarioResponseDTO.builder()
                .baselineAssessment(HeatRiskAssessmentDTO.fromDomain(baseline))
                .proposedAssessment(HeatRiskAssessmentDTO.fromDomain(proposed))
                .applied(false)
                .createdAt(LocalDateTime.now())
                .build();
    }
}
