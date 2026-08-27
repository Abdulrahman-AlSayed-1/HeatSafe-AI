package com.heatsafe.service;

import com.heatsafe.api.dto.WorksiteDTO;

import java.util.List;

public interface WorksiteService {
    List<WorksiteDTO> getAllWorksites();
    WorksiteDTO getWorksite(Long id);
    WorksiteDTO createWorksite(WorksiteDTO dto);
    void deleteWorksite(Long id);
}
