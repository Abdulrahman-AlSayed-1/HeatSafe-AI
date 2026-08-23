package com.heatsafe.domain.temperature;

import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TemperatureSeries {
    private String source;
    private String unit;
    private String dataBasis;
    @Builder.Default
    private List<TemperatureObservation> points = new ArrayList<>();
    private Double riskThreshold;
    @Builder.Default
    private List<CriticalWindow> criticalWindows = new ArrayList<>();
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CriticalWindow {
        private String start;
        private String end;
    }
}
