package com.heatsafe.service.impl;

import com.heatsafe.api.dto.WorksiteDTO;
import com.heatsafe.api.mapper.WorksiteMapper;
import com.heatsafe.domain.worksite.Worksite;
import com.heatsafe.domain.worksite.WorksiteRepository;
import com.heatsafe.service.FortyGuardTelemetrySyncService;
import com.heatsafe.service.WorksiteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class WorksiteServiceImpl implements WorksiteService {
    private final WorksiteRepository worksiteRepository;
    private final FortyGuardTelemetrySyncService telemetrySyncService;

    @Override
    public List<WorksiteDTO> getAllWorksites() {
        return worksiteRepository.findAll().stream()
                .map(WorksiteMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public WorksiteDTO getWorksite(Long id) {
        Worksite worksite = worksiteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Worksite not found with id: " + id));
        return WorksiteMapper.toDTO(worksite);
    }

    @Override
    public WorksiteDTO createWorksite(WorksiteDTO dto) {
        if (!isLocationInUnitedStates(dto.getLatitude(), dto.getLongitude())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "FortyGuard Satellite Coverage: Worksites must be located within the United States. Coordinates outside the US (including Canada, Mexico, and international regions) are not supported.");
        }

        Worksite worksite = WorksiteMapper.toEntity(dto);
        Worksite saved = worksiteRepository.save(worksite);
        return WorksiteMapper.toDTO(saved);
    }

    public static boolean isLocationInUnitedStates(Double lat, Double lng) {
        if (lat == null || lng == null) return false;

        // 1. Hawaii
        if (lat >= 18.8 && lat <= 22.5 && lng >= -160.5 && lng <= -154.5) {
            return true;
        }
        // 2. Puerto Rico / USVI
        if (lat >= 17.7 && lat <= 18.6 && lng >= -67.4 && lng <= -64.5) {
            return true;
        }
        // 3. Alaska (Mainland)
        if (lng >= -179.0 && lng <= -141.0 && lat >= 51.0 && lat <= 71.5) {
            return true;
        }
        // 3b. Alaska Panhandle (Southeast Alaska)
        if (lng >= -141.0 && lng <= -129.9 && lat >= 54.5 && lat <= 60.5) {
            return true;
        }
        // 4. Contiguous United States (Lower 48)
        // Strictly reject anything north of 49.384°N (Canada 49th parallel border)
        // or south of Key West (24.5°N)
        if (lat < 24.5 || lat > 49.384 || lng < -125.0 || lng > -66.9) {
            return false;
        }

        // Canada east exclusions (Southern Ontario, Quebec, Maritimes)
        if (lng <= -120.0 && lat > 49.0) {
            return false; // Vancouver / Southern BC
        }
        if (lng >= -83.5 && lng <= -80.5 && lat > 42.0) {
            return false; // Southwestern Ontario (Windsor, London, Sarnia, Chatham)
        }
        if (lng > -80.5 && lng <= -78.9 && lat > 42.8) {
            return false; // Niagara Peninsula, Hamilton, Kitchener, Toronto (Ontario)
        }
        if (lng > -78.9 && lng <= -76.5 && lat > 43.5) {
            return false; // Oshawa, Kingston, Lake Ontario north shore (Ontario)
        }
        if (lng > -76.5 && lng <= -75.0 && lat > 44.4) {
            return false; // Eastern Ontario / St. Lawrence border
        }
        if (lng >= -75.0 && lng <= -71.0 && lat > 45.0) {
            return false; // Montreal, Quebec City, Southern Quebec
        }
        if (lng > -71.0 && lng <= -67.0 && lat > 47.4) {
            return false; // New Brunswick / Eastern Canada
        }

        return true;
    }

    @Override
    public void deleteWorksite(Long id) {
        if (!worksiteRepository.existsById(id)) {
            throw new RuntimeException("Worksite not found with id: " + id);
        }
        telemetrySyncService.invalidateCache(id);
        worksiteRepository.deleteById(id);
    }
}
