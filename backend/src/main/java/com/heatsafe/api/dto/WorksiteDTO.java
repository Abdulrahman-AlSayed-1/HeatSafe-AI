package com.heatsafe.api.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorksiteDTO {
    private Long id;
    private String name;
    private String description;
    private Double latitude;
    private Double longitude;
    private String timezone;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
