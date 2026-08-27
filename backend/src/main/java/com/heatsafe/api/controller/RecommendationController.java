package com.heatsafe.api.controller;

import com.heatsafe.api.dto.*;
import com.heatsafe.service.HeatExposureService;
import com.heatsafe.service.HeatRiskService;
import com.heatsafe.service.RecommendationService;
import com.heatsafe.service.ThermalProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/worksites/{worksiteId}/recommendations")
@RequiredArgsConstructor
@Slf4j
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final HeatRiskService heatRiskService;
    private final ThermalProfileService thermalProfileService;
    private final HeatExposureService heatExposureService;

    @GetMapping
    public ResponseEntity<List<RecommendationDTO>> getRecommendations(@PathVariable Long worksiteId) {
        HeatRiskAssessmentDTO riskAssessment = heatRiskService.assessHeatRisk(worksiteId);

        WorksiteThermalProfileDTO thermalProfile = null;
        try {
            thermalProfile = thermalProfileService.getThermalProfile(worksiteId);
        } catch (Exception e) {
            log.warn("Could not retrieve thermal profile for recommendations: {}", e.getMessage());
        }

        HeatExposureDTO heatExposure = null;
        try {
            heatExposure = heatExposureService.getHeatExposure(worksiteId);
        } catch (Exception e) {
            log.warn("Could not retrieve heat exposure for recommendations: {}", e.getMessage());
        }

        // Recommendations are strictly tailored to mitigate active non-low-risk tasks to reach a safe state.
        // If there are no tasks assigned or all tasks are within safe/low risk limits, no mitigation is required.
        if (riskAssessment.getAffectedTasks() == null || riskAssessment.getAffectedTasks().isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        RiskAssessmentEvidenceDTO evidence = RiskAssessmentEvidenceDTO.builder()
                .riskLevel(riskAssessment.getRiskLevel())
                .score(riskAssessment.getScore())
                .reasons(riskAssessment.getReasons())
                .thermalMinTemp(thermalProfile != null ? thermalProfile.getMinTemp() : null)
                .thermalAvgTemp(thermalProfile != null ? thermalProfile.getAvgTemp() : null)
                .thermalMaxTemp(thermalProfile != null ? thermalProfile.getMaxTemp() : null)
                .hoursAboveThreshold(heatExposure != null ? heatExposure.getHoursAboveThreshold() : null)
                .longestContinuousExposure(heatExposure != null ? heatExposure.getLongestContinuousExposure() : null)
                .affectedTasks(riskAssessment.getAffectedTasks().stream()
                        .map(t -> RiskAssessmentEvidenceDTO.TaskEvidenceDTO.builder()
                                .taskName(t.getTaskName())
                                .exposureType(t.getRiskLevel())
                                .timeRange(t.getTaskStart() + " - " + t.getTaskEnd())
                                .riskScore(t.getRiskScore())
                                .workerCount(t.getWorkerCount())
                                .reason(t.getReason())
                                .build())
                        .toList())
                .build();

        List<RecommendationDTO> recommendations = recommendationService.generateRecommendations(worksiteId, evidence);
        return ResponseEntity.ok(recommendations);
    }
}
