package com.heatsafe.domain.temperature;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TemperatureObservation {
    private LocalDateTime timestamp;
    private Double temperatureCelsius;
    private Double apparentTemperature;
    private String source;
    
    public enum Source {
        FORTYGUARD,
        MOCK
    }
}
