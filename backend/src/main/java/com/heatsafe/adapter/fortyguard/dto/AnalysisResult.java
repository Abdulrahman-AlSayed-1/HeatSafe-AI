package com.heatsafe.adapter.fortyguard.dto;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalysisResult {
    private String activityId;
    private JobStatus status;
    private Map<String, Object> data;
    
    public enum JobStatus {
        COMPLETED,
        FAILED
    }
}
