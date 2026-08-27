package com.heatsafe.api.dto;

import com.heatsafe.domain.task.Task;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskDTO {
    private Long id;
    private Long worksiteId;
    private String name;
    private String description;
    private LocalDateTime startTime;
    private Integer durationMinutes;
    private Integer workerCount;
    private Task.ExposureType exposureType;
    private String workRestRatio; // "CONTINUOUS", "45_15", "30_30", "15_45"
    private String coolingMeasures; // Comma-separated or tags
    private String mitigationNotes;
    private String forecastStatus; // "HISTORICAL", "FORECASTABLE", "AWAITING_FORECAST"
    private String riskLevel; // "SAFE", "LOW", "MODERATE", "HIGH", "EXTREME"
    private Double riskScore; // 0.0 - 10.0
    private String riskReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
