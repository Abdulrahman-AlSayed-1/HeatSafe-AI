package com.heatsafe.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationDTO {
    private Long id;
    private String category; // "TASK_CONTROL" | "SITE_CONTROL"
    private String targetTask;
    private String action;
    private String reasoning;
    private String expectedImpact;
}
