package com.heatsafe.service;

import com.heatsafe.api.dto.HeatRiskAssessmentDTO;
import com.heatsafe.api.dto.TemperatureSeriesDTO;
import com.heatsafe.domain.task.Task;
import com.heatsafe.domain.task.TaskRepository;
import com.heatsafe.domain.worksite.Worksite;
import com.heatsafe.domain.worksite.WorksiteRepository;
import com.heatsafe.service.impl.HeatRiskServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HeatRiskServiceImplTest {

    @Mock
    private TemperatureService temperatureService;

    @Mock
    private WorksiteRepository worksiteRepository;

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private HeatRiskServiceImpl heatRiskService;

    @Test
    void shouldAssessHighOrExtremeRiskWhenTemperaturesAreHigh() {
        Long worksiteId = 1L;
        Worksite worksite = Worksite.builder().id(worksiteId).name("Dubai Construction Site").latitude(25.2).longitude(55.2).build();

        when(worksiteRepository.findById(worksiteId)).thenReturn(Optional.of(worksite));

        // Create 24 points with peak at 44°C
        List<TemperatureSeriesDTO.TemperaturePointDTO> points = new ArrayList<>();
        LocalDateTime base = LocalDateTime.of(2026, 8, 25, 0, 0);
        for (int h = 0; h < 24; h++) {
            double temp = (h >= 10 && h <= 16) ? 44.0 : 32.0;
            points.add(TemperatureSeriesDTO.TemperaturePointDTO.builder()
                    .timestamp(base.plusHours(h).toString())
                    .temperature(temp)
                    .build());
        }

        TemperatureSeriesDTO seriesDTO = TemperatureSeriesDTO.builder()
                .source("FortyGuard")
                .points(points)
                .riskThreshold(35.0)
                .criticalWindows(List.of())
                .build();

        when(temperatureService.getTemperatureSeries(worksiteId)).thenReturn(seriesDTO);

        Task task = Task.builder()
                .id(10L)
                .name("Roof Concrete Pouring")
                .worksite(worksite)
                .startTime(LocalDateTime.of(2026, 8, 25, 11, 0))
                .durationMinutes(240)
                .exposureType(Task.ExposureType.HIGH)
                .build();

        when(taskRepository.findByWorksiteId(worksiteId)).thenReturn(List.of(task));

        HeatRiskAssessmentDTO assessment = heatRiskService.assessHeatRisk(worksiteId);

        assertNotNull(assessment);
        assertNotEquals("LOW", assessment.getRiskLevel(), "High temps must NOT result in LOW risk");
        assertTrue("HIGH".equals(assessment.getRiskLevel()) || "EXTREME".equals(assessment.getRiskLevel()));
        assertTrue(assessment.getScore() >= 7.0);

        assertNotNull(assessment.getReasons());
        assertFalse(assessment.getReasons().isEmpty(), "Reasons list must not be empty");

        assertNotNull(assessment.getCriticalWindows());
        assertFalse(assessment.getCriticalWindows().isEmpty(), "Critical windows must be identified");

        assertNotNull(assessment.getAffectedTasks());
        assertEquals(1, assessment.getAffectedTasks().size());
        assertEquals("Roof Concrete Pouring", assessment.getAffectedTasks().get(0).getTaskName());
    }
}
