package com.heatsafe.api.controller;

import com.heatsafe.api.dto.HeatRiskAssessmentDTO;
import com.heatsafe.service.HeatRiskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/worksites/{worksiteId}/heat-risk")
@RequiredArgsConstructor
public class HeatRiskController {
    
    private final HeatRiskService heatRiskService;
    
    @GetMapping
    public ResponseEntity<HeatRiskAssessmentDTO> getHeatRiskAssessment(@PathVariable Long worksiteId) {
        return ResponseEntity.ok(heatRiskService.assessHeatRisk(worksiteId));
    }
}
