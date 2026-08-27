package com.heatsafe.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.heatsafe.service.FortyGuardTelemetrySyncService;
import com.heatsafe.service.HeatmapService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class HeatmapServiceImpl implements HeatmapService {

    private final FortyGuardTelemetrySyncService telemetrySyncService;

    @Override
    public JsonNode getHeatmap(Long worksiteId) {
        var telemetry = telemetrySyncService.getTelemetry(worksiteId);
        return telemetry.getTcmResponse() != null ? telemetry.getTcmResponse().getMapData() : null;
    }
}
