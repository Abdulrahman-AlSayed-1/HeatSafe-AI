package com.heatsafe.adapter.fortyguard;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.heatsafe.adapter.fortyguard.dto.HeatmapRequest;
import com.heatsafe.adapter.fortyguard.dto.HeatmapResponse;
import com.heatsafe.adapter.fortyguard.impl.FortyGuardTemperatureDataProvider;
import com.heatsafe.domain.temperature.TemperatureSeries;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FortyGuardTemperatureDataProviderTest {

    @Spy
    private AOIGenerationService aoiService = new AOIGenerationService();

    @Mock
    private FortyGuardClient fortyGuardClient;

    @InjectMocks
    private FortyGuardTemperatureDataProvider provider;

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Test
    void shouldGenerate24HourlyObservationsFromHeatmapResponse() {
        Location location = Location.builder().latitude(25.2048).longitude(55.2708).build();
        TimeWindow window = TimeWindow.builder()
                .start(LocalDateTime.of(2026, 8, 25, 6, 0))
                .end(LocalDateTime.of(2026, 8, 25, 18, 0))
                .build();

        // Build sample test FeatureCollection
        ArrayNode features = MAPPER.createArrayNode();
        ObjectNode feature = MAPPER.createObjectNode();
        ObjectNode props = MAPPER.createObjectNode();
        props.put("average_temperature", 38.0);
        props.put("min_temperature", 30.0);
        props.put("max_temperature", 45.0);
        feature.set("properties", props);
        features.add(feature);

        ObjectNode mapData = MAPPER.createObjectNode();
        mapData.put("type", "FeatureCollection");
        mapData.set("features", features);

        HeatmapResponse response = HeatmapResponse.builder()
                .activityId("test-act-123")
                .mapData(mapData)
                .build();

        when(fortyGuardClient.submit(any(HeatmapRequest.class))).thenReturn("test-act-123");
        when(fortyGuardClient.waitFor(eq("test-act-123"))).thenReturn(response);

        TemperatureSeries series = provider.getSeries(location, window);

        assertNotNull(series);
        assertEquals("FortyGuard", series.getSource());
        assertNotNull(series.getPoints());
        assertEquals(24, series.getPoints().size(), "Should contain 24 hourly points");

        double maxObserved = series.getPoints().stream()
                .mapToDouble(p -> p.getTemperatureCelsius())
                .max().orElse(0.0);

        double minObserved = series.getPoints().stream()
                .mapToDouble(p -> p.getTemperatureCelsius())
                .min().orElse(0.0);

        assertTrue(maxObserved >= 44.0, "Peak temperature should be at least 44°C");
        assertTrue(minObserved >= 29.0, "Minimum temperature should be at least 29°C");
    }
}
