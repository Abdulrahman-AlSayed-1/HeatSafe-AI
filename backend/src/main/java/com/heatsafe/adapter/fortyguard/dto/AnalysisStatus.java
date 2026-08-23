package com.heatsafe.adapter.fortyguard.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalysisStatus {
    private String activityId;
    private JobStatus status;
    private String message;
    
    public enum JobStatus {
        QUEUED,
        PROCESSING,
        COMPLETED,
        FAILED
    }
}
