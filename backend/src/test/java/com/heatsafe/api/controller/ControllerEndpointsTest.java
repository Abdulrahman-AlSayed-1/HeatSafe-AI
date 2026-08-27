package com.heatsafe.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.heatsafe.api.dto.*;
import com.heatsafe.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest({
        ThermalProfileController.class,
        HeatExposureController.class,
        HeatmapController.class,
        HeatRiskController.class,
        RecommendationController.class
})
class ControllerEndpointsTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ThermalProfileService thermalProfileService;

    @MockBean
    private HeatExposureService heatExposureService;

    @MockBean
    private HeatmapService heatmapService;

    @MockBean
    private HeatRiskService heatRiskService;

    @MockBean
    private RecommendationService recommendationService;

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Test
    void shouldReturnThermalProfile() throws Exception {
        WorksiteThermalProfileDTO dto = WorksiteThermalProfileDTO.builder()
                .minTemp(31.0)
                .avgTemp(39.0)
                .maxTemp(46.0)
                .unit("°C")
                .dataBasis("tcm-filter3")
                .build();

        when(thermalProfileService.getThermalProfile(1L)).thenReturn(dto);

        mockMvc.perform(get("/api/worksites/1/thermal-profile"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.minTemp").value(31.0))
                .andExpect(jsonPath("$.avgTemp").value(39.0))
                .andExpect(jsonPath("$.maxTemp").value(46.0))
                .andExpect(jsonPath("$.unit").value("°C"));
    }

    @Test
    void shouldReturnHeatExposure() throws Exception {
        HeatExposureDTO dto = HeatExposureDTO.builder()
                .hoursAboveThreshold(8)
                .longestContinuousExposure(5)
                .peakHeatHour("14:00")
                .thresholdCelsius(35.0)
                .build();

        when(heatExposureService.getHeatExposure(1L)).thenReturn(dto);

        mockMvc.perform(get("/api/worksites/1/heat-exposure"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.hoursAboveThreshold").value(8))
                .andExpect(jsonPath("$.longestContinuousExposure").value(5))
                .andExpect(jsonPath("$.peakHeatHour").value("14:00"));
    }

    @Test
    void shouldReturnHeatmapGeoJson() throws Exception {
        ObjectNode geoJson = MAPPER.createObjectNode();
        geoJson.put("type", "FeatureCollection");
        geoJson.set("features", MAPPER.createArrayNode());

        when(heatmapService.getHeatmap(1L)).thenReturn(geoJson);

        mockMvc.perform(get("/api/worksites/1/heatmap"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("FeatureCollection"));
    }

    @Test
    void shouldReturnRecommendations() throws Exception {
        HeatRiskAssessmentDTO risk = HeatRiskAssessmentDTO.builder()
                .riskLevel("HIGH")
                .score(8.2)
                .reasons(List.of("Peak temperature 46°C exceeds EXTREME threshold"))
                .build();

        when(heatRiskService.assessHeatRisk(1L)).thenReturn(risk);
        when(thermalProfileService.getThermalProfile(1L)).thenReturn(WorksiteThermalProfileDTO.builder().minTemp(30.0).avgTemp(38.0).maxTemp(45.0).build());
        when(heatExposureService.getHeatExposure(1L)).thenReturn(HeatExposureDTO.builder().hoursAboveThreshold(8).longestContinuousExposure(5).build());

        RecommendationDTO rec = RecommendationDTO.builder()
                .id(1L)
                .action("Reschedule high-exposure tasks to early morning")
                .reasoning("High ambient heat exceeds safe operational thresholds")
                .expectedImpact("50% risk reduction")
                .build();

        when(recommendationService.generateRecommendations(eq(1L), any(RiskAssessmentEvidenceDTO.class)))
                .thenReturn(List.of(rec));

        mockMvc.perform(get("/api/worksites/1/recommendations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].action").value("Reschedule high-exposure tasks to early morning"));
    }
}
