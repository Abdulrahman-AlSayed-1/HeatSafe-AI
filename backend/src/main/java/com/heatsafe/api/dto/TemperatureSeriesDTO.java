package com.heatsafe.api.dto;

import com.heatsafe.domain.temperature.TemperatureObservation;
import com.heatsafe.domain.temperature.TemperatureSeries;
import lombok.*;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TemperatureSeriesDTO {
    private String source;
    private String unit;
    private String dataBasis;
    private List<TemperaturePointDTO> points;
    private Double riskThreshold;
    private List<CriticalWindowDTO> criticalWindows;
    
    public static TemperatureSeriesDTO fromDomain(TemperatureSeries series) {
        return TemperatureSeriesDTO.builder()
                .source(series.getSource())
                .unit(series.getUnit())
                .dataBasis(series.getDataBasis())
                .points(series.getPoints().stream()
                        .map(TemperaturePointDTO::fromDomain)
                        .collect(Collectors.toList()))
                .riskThreshold(series.getRiskThreshold())
                .criticalWindows(series.getCriticalWindows().stream()
                        .map(CriticalWindowDTO::fromDomain)
                        .collect(Collectors.toList()))
                .build();
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TemperaturePointDTO {
        private String timestamp;
        private Double temperature;
        
        public static TemperaturePointDTO fromDomain(TemperatureObservation obs) {
            return TemperaturePointDTO.builder()
                    .timestamp(obs.getTimestamp().toString())
                    .temperature(obs.getTemperatureCelsius())
                    .build();
        }
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CriticalWindowDTO {
        private String start;
        private String end;
        
        public static CriticalWindowDTO fromDomain(TemperatureSeries.CriticalWindow window) {
            return CriticalWindowDTO.builder()
                    .start(window.getStart())
                    .end(window.getEnd())
                    .build();
        }
    }
}
