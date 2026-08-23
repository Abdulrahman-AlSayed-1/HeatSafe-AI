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
    private Task.ExposureType exposureType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
