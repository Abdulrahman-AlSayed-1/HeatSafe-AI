package com.heatsafe.adapter.fortyguard.dto;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalysisRequest {
    private String endpoint;
    private Map<String, Object> parameters;
}
