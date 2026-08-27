package com.heatsafe.service;

import com.heatsafe.api.dto.HeatExposureDTO;

public interface HeatExposureService {
    HeatExposureDTO getHeatExposure(Long worksiteId);
}
