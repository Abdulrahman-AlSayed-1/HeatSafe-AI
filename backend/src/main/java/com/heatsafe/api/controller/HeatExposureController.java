package com.heatsafe.api.controller;

import com.heatsafe.api.dto.HeatExposureDTO;
import com.heatsafe.service.HeatExposureService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/worksites/{worksiteId}/heat-exposure")
@RequiredArgsConstructor
public class HeatExposureController {

    private final HeatExposureService heatExposureService;

    @GetMapping
    public ResponseEntity<HeatExposureDTO> getHeatExposure(@PathVariable Long worksiteId) {
        return ResponseEntity.ok(heatExposureService.getHeatExposure(worksiteId));
    }
}
