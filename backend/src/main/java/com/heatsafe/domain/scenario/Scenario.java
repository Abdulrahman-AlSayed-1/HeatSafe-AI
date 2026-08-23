package com.heatsafe.domain.scenario;

import com.heatsafe.domain.risk.HeatRiskAssessment;
import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Scenario {
    private Long taskId;
    private LocalDateTime baselineTaskTime;
    private LocalDateTime proposedTaskTime;
    private HeatRiskAssessment baselineAssessment;
    private HeatRiskAssessment proposedAssessment;
    private LocalDateTime createdAt;
}
