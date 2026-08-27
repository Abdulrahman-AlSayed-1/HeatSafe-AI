package com.heatsafe.service;

import com.heatsafe.api.dto.WorksiteThermalProfileDTO;

public interface ThermalProfileService {
    WorksiteThermalProfileDTO getThermalProfile(Long worksiteId);
}
