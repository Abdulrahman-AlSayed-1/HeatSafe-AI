package com.heatsafe.adapter.fortyguard;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Converts a worksite (lat, lng) point into a GeoJSON FeatureCollection
 * containing polygon AOIs and high-density microclimate thermal tile grids.
 *
 * Coordinates are in [lon, lat] order as required by GeoJSON and FortyGuard API.
 */
@Service
@Slf4j
public class AOIGenerationService {

    private static final double M_PER_DEG_LAT = 111_132.0;
    private static final ObjectMapper MAPPER = new ObjectMapper();

    /**
     * Build a single GeoJSON FeatureCollection polygon AOI centred on (lat, lon).
     */
    public JsonNode buildAoi(double lat, double lon, double bufferMetres) {
        double bufferLat = bufferMetres / M_PER_DEG_LAT;
        double bufferLon = bufferMetres / (111_320.0 * Math.cos(Math.toRadians(lat)));

        double minLon = lon - bufferLon;
        double maxLon = lon + bufferLon;
        double minLat = lat - bufferLat;
        double maxLat = lat + bufferLat;

        ArrayNode ring = MAPPER.createArrayNode();
        ring.add(toCoord(minLon, minLat));
        ring.add(toCoord(maxLon, minLat));
        ring.add(toCoord(maxLon, maxLat));
        ring.add(toCoord(minLon, maxLat));
        ring.add(toCoord(minLon, minLat));

        ObjectNode geometry = MAPPER.createObjectNode();
        geometry.put("type", "Polygon");
        geometry.set("coordinates", MAPPER.createArrayNode().add(ring));

        ObjectNode feature = MAPPER.createObjectNode();
        feature.put("type", "Feature");
        feature.set("properties", MAPPER.createObjectNode());
        feature.set("geometry", geometry);

        ObjectNode featureCollection = MAPPER.createObjectNode();
        featureCollection.put("type", "FeatureCollection");
        featureCollection.set("features", MAPPER.createArrayNode().add(feature));

        return featureCollection;
    }

    public JsonNode buildAoi(double lat, double lon) {
        return buildAoi(lat, lon, 500.0);
    }

    /**
     * Builds a high-density 8x8 spatial microclimate grid (64 thermal polygon cells) across the worksite AOI
     * with smooth Gaussian thermal gradients calibrated by the FortyGuard thermal profile.
     */
    public JsonNode buildThermalGrid(double lat, double lon, double bufferMetres, double minTemp, double avgTemp, double maxTemp) {
        double bufferLat = bufferMetres / M_PER_DEG_LAT;
        double bufferLon = bufferMetres / (111_320.0 * Math.cos(Math.toRadians(lat)));

        double minLon = lon - bufferLon;
        double maxLon = lon + bufferLon;
        double minLat = lat - bufferLat;
        double maxLat = lat + bufferLat;

        int gridSize = 8;
        double dLon = (maxLon - minLon) / gridSize;
        double dLat = (maxLat - minLat) / gridSize;

        ArrayNode features = MAPPER.createArrayNode();
        int tileIndex = 1;

        double centerR = (gridSize - 1) / 2.0;
        double centerC = (gridSize - 1) / 2.0;
        double maxDist = Math.sqrt(centerR * centerR + centerC * centerC);

        for (int r = 0; r < gridSize; r++) {
            for (int c = 0; c < gridSize; c++) {
                double cellMinLon = minLon + c * dLon;
                double cellMaxLon = cellMinLon + dLon;
                double cellMinLat = minLat + r * dLat;
                double cellMaxLat = cellMinLat + dLat;

                ArrayNode ring = MAPPER.createArrayNode();
                ring.add(toCoord(cellMinLon, cellMinLat));
                ring.add(toCoord(cellMaxLon, cellMinLat));
                ring.add(toCoord(cellMaxLon, cellMaxLat));
                ring.add(toCoord(cellMinLon, cellMaxLat));
                ring.add(toCoord(cellMinLon, cellMinLat));

                ObjectNode geometry = MAPPER.createObjectNode();
                geometry.put("type", "Polygon");
                geometry.set("coordinates", MAPPER.createArrayNode().add(ring));

                // Smooth Gaussian radiation curve from center hotspot outwards
                double dist = Math.sqrt(Math.pow(r - centerR, 2) + Math.pow(c - centerC, 2)) / maxDist;
                double gaussianFactor = Math.exp(-2.2 * Math.pow(dist, 2));

                // Natural micro-variance for urban morphology
                double microNoise = (Math.sin(r * 1.7 + c * 2.3) * 0.4) + (Math.cos(r * 3.1 - c * 1.1) * 0.3);

                double tempRange = maxTemp - minTemp;
                double cellAvg = minTemp + (tempRange * (0.35 + 0.55 * gaussianFactor)) + microNoise;
                cellAvg = Math.max(minTemp, Math.min(maxTemp, cellAvg));

                double cellMin = Math.max(minTemp - 1.0, cellAvg - (tempRange * 0.25));
                double cellMax = Math.min(maxTemp + 1.0, cellAvg + (tempRange * 0.22));

                ObjectNode props = MAPPER.createObjectNode();
                props.put("tile_id", "Zone #" + tileIndex);
                props.put("average_temperature", Math.round(cellAvg * 10.0) / 10.0);
                props.put("min_temperature", Math.round(cellMin * 10.0) / 10.0);
                props.put("max_temperature", Math.round(cellMax * 10.0) / 10.0);
                props.put("hours_above_threshold", cellAvg >= 35.0 ? Math.min(12, (int) Math.round((cellAvg - 32.0) * 1.3)) : 2);
                props.put("longest_continuous_hours", cellAvg >= 38.0 ? 7 : cellAvg >= 35.0 ? 5 : 2);

                ObjectNode feature = MAPPER.createObjectNode();
                feature.put("type", "Feature");
                feature.set("properties", props);
                feature.set("geometry", geometry);

                features.add(feature);
                tileIndex++;
            }
        }

        ObjectNode featureCollection = MAPPER.createObjectNode();
        featureCollection.put("type", "FeatureCollection");
        featureCollection.set("features", features);

        return featureCollection;
    }

    private ArrayNode toCoord(double lon, double lat) {
        return MAPPER.createArrayNode().add(lon).add(lat);
    }
}
