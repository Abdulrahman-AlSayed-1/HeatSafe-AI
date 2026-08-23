package com.heatsafe.domain.risk;

import com.heatsafe.domain.task.Task;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HeatRiskAssessment {
    private RiskLevel riskLevel;
    private Double score;
    @Builder.Default
    private List<CriticalWindow> criticalWindows = new ArrayList<>();
    @Builder.Default
    private List<AffectedTask> affectedTasks = new ArrayList<>();
    private LocalDateTime assessedAt;
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CriticalWindow {
        private LocalDateTime start;
        private LocalDateTime end;
        private Double maxTemperature;
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AffectedTask {
        private Long taskId;
        private String taskName;
        private LocalDateTime taskStart;
        private LocalDateTime taskEnd;
        private RiskLevel riskLevel;
        private String reason;
    }
    
    public enum RiskLevel {
        LOW,
        MODERATE,
        HIGH,
        EXTREME
    }
}
