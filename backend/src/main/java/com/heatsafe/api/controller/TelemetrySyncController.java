package com.heatsafe.api.controller;

import com.heatsafe.service.FortyGuardTelemetrySyncService;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/worksites/{worksiteId}/telemetry")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TelemetrySyncController {

    private final FortyGuardTelemetrySyncService telemetrySyncService;

    @Data
    @Builder
    public static class TelemetryStatusResponse {
        private String status; // "READY", "SYNCING", "FAILED"
        private long timestamp;
        private String errorMessage;
    }

    @GetMapping("/status")
    public ResponseEntity<TelemetryStatusResponse> getStatus(@PathVariable Long worksiteId) {
        var entry = telemetrySyncService.getTelemetry(worksiteId);
        return ResponseEntity.ok(TelemetryStatusResponse.builder()
                .status(entry.getStatus())
                .timestamp(entry.getTimestamp())
                .errorMessage(entry.getErrorMessage())
                .build());
    }

    @PostMapping("/sync")
    public ResponseEntity<TelemetryStatusResponse> triggerSync(@PathVariable Long worksiteId) {
        telemetrySyncService.invalidateCache(worksiteId);
        var entry = telemetrySyncService.getTelemetry(worksiteId);
        return ResponseEntity.ok(TelemetryStatusResponse.builder()
                .status(entry.getStatus())
                .timestamp(entry.getTimestamp())
                .errorMessage(entry.getErrorMessage())
                .build());
    }
}
