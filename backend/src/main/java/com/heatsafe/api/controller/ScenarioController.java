package com.heatsafe.api.controller;

import com.heatsafe.api.dto.ScenarioRequestDTO;
import com.heatsafe.api.dto.ScenarioResponseDTO;
import com.heatsafe.service.ScenarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/worksites/{worksiteId}/scenarios")
@RequiredArgsConstructor
public class ScenarioController {
    
    private final ScenarioService scenarioService;
    
    @PostMapping
    public ResponseEntity<ScenarioResponseDTO> evaluateScenario(
            @PathVariable Long worksiteId,
            @RequestBody ScenarioRequestDTO request) {
        return ResponseEntity.ok(scenarioService.evaluateScenario(worksiteId, request));
    }
}
