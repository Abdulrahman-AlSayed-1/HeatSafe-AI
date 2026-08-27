package com.heatsafe.service.impl;

import com.heatsafe.api.dto.TemperatureSeriesDTO;
import com.heatsafe.domain.temperature.TemperatureSeries;
import com.heatsafe.domain.worksite.Worksite;
import com.heatsafe.domain.worksite.WorksiteRepository;
import com.heatsafe.service.FortyGuardTelemetrySyncService;
import com.heatsafe.service.TemperatureService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TemperatureServiceImpl implements TemperatureService {

    private final FortyGuardTelemetrySyncService telemetrySyncService;
    private final WorksiteRepository worksiteRepository;

    @Override
    public TemperatureSeriesDTO getTemperatureSeries(Long worksiteId) {
        Worksite worksite = worksiteRepository.findById(worksiteId)
                .orElseThrow(() -> new RuntimeException("Worksite not found with id: " + worksiteId));

        var telemetry = telemetrySyncService.getTelemetry(worksiteId);
        TemperatureSeries series = telemetry.getTemperatureSeries();
        return TemperatureSeriesDTO.fromDomain(series);
    }
}
