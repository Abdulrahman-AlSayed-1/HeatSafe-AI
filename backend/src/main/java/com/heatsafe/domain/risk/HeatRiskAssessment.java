package com.heatsafe.domain.risk;

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
    @Builder.Default
    private List<String> reasons = new ArrayList<>();
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
        private Integer workerCount;
        private ForecastStatus forecastStatus;
        private RiskLevel riskLevel;
        private Double riskScore;
        private String reason;
    }
    
    public enum RiskLevel {
        LOW,
        MODERATE,
        HIGH,
        EXTREME,
        PENDING_FORECAST,
        UNSUPPORTED
    }

    public enum ForecastStatus {
        FORECASTABLE,        // Within now to now + 12h: live FortyGuard forecast available
        AWAITING_FORECAST    // > 12h in future: FortyGuard forecast unlocks within 12h of shift
    }
}
