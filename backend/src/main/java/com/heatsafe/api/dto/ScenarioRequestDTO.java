package com.heatsafe.api.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScenarioRequestDTO {
    private Long taskId;
    private LocalDateTime proposedStartTime;
    private Integer proposedDurationMinutes;
    private String proposedWorkRestRatio; // "CONTINUOUS", "45_15", "30_30", "15_45"
    private String proposedCoolingMeasures; // Comma-separated tags
    private Boolean applyToTask;
}
