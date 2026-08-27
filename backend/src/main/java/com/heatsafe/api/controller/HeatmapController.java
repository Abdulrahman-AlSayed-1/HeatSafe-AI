package com.heatsafe.api.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.heatsafe.service.HeatmapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/worksites/{worksiteId}/heatmap")
@RequiredArgsConstructor
public class HeatmapController {

    private final HeatmapService heatmapService;

    @GetMapping
    public ResponseEntity<JsonNode> getHeatmap(@PathVariable Long worksiteId) {
        return ResponseEntity.ok(heatmapService.getHeatmap(worksiteId));
    }
}
