package com.heatsafe.service.impl;

import com.heatsafe.api.dto.HeatExposureDTO;
import com.heatsafe.service.FortyGuardTelemetrySyncService;
import com.heatsafe.service.HeatExposureService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class HeatExposureServiceImpl implements HeatExposureService {

    private final FortyGuardTelemetrySyncService telemetrySyncService;

    @Override
    public HeatExposureDTO getHeatExposure(Long worksiteId) {
        var telemetry = telemetrySyncService.getTelemetry(worksiteId);
        return telemetry.getHeatExposure();
    }
}
