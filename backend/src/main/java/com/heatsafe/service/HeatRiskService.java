package com.heatsafe.service;

import com.heatsafe.api.dto.HeatRiskAssessmentDTO;

public interface HeatRiskService {
    HeatRiskAssessmentDTO assessHeatRisk(Long worksiteId);
}
