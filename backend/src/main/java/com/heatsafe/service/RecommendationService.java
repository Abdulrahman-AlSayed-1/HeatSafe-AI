package com.heatsafe.service;

import com.heatsafe.api.dto.HeatRiskAssessmentDTO;
import com.heatsafe.api.dto.RecommendationDTO;
import com.heatsafe.api.dto.RiskAssessmentEvidenceDTO;

import java.util.List;

public interface RecommendationService {
    List<RecommendationDTO> generateRecommendations(Long worksiteId, RiskAssessmentEvidenceDTO evidence);
    List<RecommendationDTO> generateRecommendations(Long worksiteId, HeatRiskAssessmentDTO riskAssessment);
}
