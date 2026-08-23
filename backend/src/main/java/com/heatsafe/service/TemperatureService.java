package com.heatsafe.service;

import com.heatsafe.api.dto.TemperatureSeriesDTO;

public interface TemperatureService {
    TemperatureSeriesDTO getTemperatureSeries(Long worksiteId);
}
