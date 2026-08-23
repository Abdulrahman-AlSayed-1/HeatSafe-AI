package com.heatsafe.api.controller;

import com.heatsafe.api.dto.TemperatureSeriesDTO;
import com.heatsafe.service.TemperatureService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/worksites/{worksiteId}/temperature")
@RequiredArgsConstructor
public class TemperatureController {
    
    private final TemperatureService temperatureService;
    
    @GetMapping
    public ResponseEntity<TemperatureSeriesDTO> getTemperatureSeries(@PathVariable Long worksiteId) {
        return ResponseEntity.ok(temperatureService.getTemperatureSeries(worksiteId));
    }
}
