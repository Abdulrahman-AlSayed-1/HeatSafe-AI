package com.heatsafe.service;

import com.heatsafe.api.dto.ScenarioRequestDTO;
import com.heatsafe.api.dto.ScenarioResponseDTO;

public interface ScenarioService {
    ScenarioResponseDTO evaluateScenario(Long worksiteId, ScenarioRequestDTO request);
}
