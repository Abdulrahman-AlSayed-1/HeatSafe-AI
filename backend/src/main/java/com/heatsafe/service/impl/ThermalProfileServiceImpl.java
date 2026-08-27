package com.heatsafe.service.impl;

import com.heatsafe.api.dto.WorksiteThermalProfileDTO;
import com.heatsafe.service.FortyGuardTelemetrySyncService;
import com.heatsafe.service.ThermalProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ThermalProfileServiceImpl implements ThermalProfileService {

    private final FortyGuardTelemetrySyncService telemetrySyncService;

    @Override
    public WorksiteThermalProfileDTO getThermalProfile(Long worksiteId) {
        var telemetry = telemetrySyncService.getTelemetry(worksiteId);
        return telemetry.getThermalProfile();
    }
}
