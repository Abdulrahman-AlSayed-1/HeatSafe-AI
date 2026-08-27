package com.heatsafe.api.mapper;

import com.heatsafe.api.dto.WorksiteDTO;
import com.heatsafe.domain.worksite.Worksite;

public class WorksiteMapper {

    public static WorksiteDTO toDTO(Worksite worksite) {
        if (worksite == null) {
            return null;
        }
        return WorksiteDTO.builder()
                .id(worksite.getId())
                .name(worksite.getName())
                .description(worksite.getDescription())
                .latitude(worksite.getLatitude())
                .longitude(worksite.getLongitude())
                .timezone(worksite.getTimezone())
                .createdAt(worksite.getCreatedAt())
                .updatedAt(worksite.getUpdatedAt())
                .build();
    }

    public static Worksite toEntity(WorksiteDTO dto) {
        if (dto == null) {
            return null;
        }
        return Worksite.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .timezone(dto.getTimezone())
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .build();
    }
}
