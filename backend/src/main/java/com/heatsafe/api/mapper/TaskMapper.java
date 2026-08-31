package com.heatsafe.api.mapper;

import com.heatsafe.api.dto.TaskDTO;
import com.heatsafe.domain.task.Task;
import com.heatsafe.domain.worksite.Worksite;

import java.time.Duration;
import java.time.LocalDateTime;

public class TaskMapper {

    public static TaskDTO toDTO(Task task) {
        if (task == null) {
            return null;
        }
        return TaskDTO.builder()
                .id(task.getId())
                .worksiteId(task.getWorksite() != null ? task.getWorksite().getId() : null)
                .name(task.getName())
                .description(task.getDescription())
                .startTime(task.getStartTime())
                .durationMinutes(task.getDurationMinutes())
                .workerCount(task.getWorkerCount() != null ? task.getWorkerCount() : 1)
                .exposureType(task.getExposureType())
                .workRestRatio(task.getWorkRestRatio() != null ? task.getWorkRestRatio() : "CONTINUOUS")
                .coolingMeasures(task.getCoolingMeasures())
                .mitigationNotes(task.getMitigationNotes())
                .forecastStatus(calculateForecastStatus(task.getStartTime()))
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }

    public static Task toEntity(TaskDTO dto, Worksite worksite) {
        if (dto == null) {
            return null;
        }
        return Task.builder()
                .id(dto.getId())
                .worksite(worksite)
                .name(dto.getName())
                .description(dto.getDescription())
                .startTime(dto.getStartTime())
                .durationMinutes(dto.getDurationMinutes())
                .workerCount(dto.getWorkerCount() != null ? dto.getWorkerCount() : 1)
                .exposureType(dto.getExposureType())
                .workRestRatio(dto.getWorkRestRatio() != null ? dto.getWorkRestRatio() : "CONTINUOUS")
                .coolingMeasures(dto.getCoolingMeasures())
                .mitigationNotes(dto.getMitigationNotes())
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .build();
    }

    public static String calculateForecastStatus(LocalDateTime startTime) {
        if (startTime == null) return "FORECASTABLE";
        LocalDateTime now = LocalDateTime.now();
        if (startTime.isBefore(now)) {
            return "HISTORICAL";
        }
        long minutesAhead = Duration.between(now, startTime).toMinutes();
        if (minutesAhead <= 24 * 60) {
            return "FORECASTABLE";
        }
        return "AWAITING_FORECAST";
    }
}
