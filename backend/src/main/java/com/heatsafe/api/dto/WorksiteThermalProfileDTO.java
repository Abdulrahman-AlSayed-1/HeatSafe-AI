package com.heatsafe.api.dto;

import lombok.*;

/**
 * AOI-wide thermal profile for a worksite derived from FortyGuard heatmap tiles.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorksiteThermalProfileDTO {
    private Double minTemp;
    private Double avgTemp;
    private Double maxTemp;
    private String unit;        // "°C"
    private String dataBasis;   // e.g. "tcm-filter3" or "MOCK"
}
