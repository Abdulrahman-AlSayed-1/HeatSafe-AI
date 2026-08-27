package com.heatsafe.adapter.fortyguard;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AOIGenerationServiceTest {

    private final AOIGenerationService service = new AOIGenerationService();

    @Test
    void shouldBuildValidGeoJsonFeatureCollection() {
        double lat = 25.2048;
        double lon = 55.2708;

        JsonNode aoi = service.buildAoi(lat, lon);

        assertNotNull(aoi);
        assertEquals("FeatureCollection", aoi.get("type").asText());
        assertTrue(aoi.has("features"));
        assertTrue(aoi.get("features").isArray());
        assertEquals(1, aoi.get("features").size());

        JsonNode feature = aoi.get("features").get(0);
        assertEquals("Feature", feature.get("type").asText());

        JsonNode geom = feature.get("geometry");
        assertEquals("Polygon", geom.get("type").asText());

        JsonNode coordinates = geom.get("coordinates").get(0);
        assertEquals(5, coordinates.size(), "Polygon ring should have 5 coordinates (closed)");
    }
}
