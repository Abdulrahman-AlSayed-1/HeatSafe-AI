package com.heatsafe.service;

import com.fasterxml.jackson.databind.JsonNode;

public interface HeatmapService {
    JsonNode getHeatmap(Long worksiteId);
}
