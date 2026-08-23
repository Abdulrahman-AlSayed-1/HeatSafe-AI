package com.heatsafe.api.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobStatusDTO {
    private String jobId;
    private String status;
    private String message;
    private Object result;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
}
