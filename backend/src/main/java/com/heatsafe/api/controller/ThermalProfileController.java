package com.heatsafe.api.controller;

import com.heatsafe.api.dto.WorksiteThermalProfileDTO;
import com.heatsafe.service.ThermalProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/worksites/{worksiteId}/thermal-profile")
@RequiredArgsConstructor
public class ThermalProfileController {

    private final ThermalProfileService thermalProfileService;

    @GetMapping
    public ResponseEntity<WorksiteThermalProfileDTO> getThermalProfile(@PathVariable Long worksiteId) {
        return ResponseEntity.ok(thermalProfileService.getThermalProfile(worksiteId));
    }
}
