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
}
