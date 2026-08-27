package com.heatsafe.adapter.fortyguard;

import com.heatsafe.adapter.fortyguard.dto.HeatmapRequest;
import com.heatsafe.adapter.fortyguard.dto.HeatmapResponse;

/**
 * Async FortyGuard heatmap client.
 * The real API flow:
 *   1. submit(request) → returns activity_id
 *   2. getStatus(activityId) → poll until COMPLETED
 *   3. waitFor(activityId) → blocking convenience wrapper
 */
public interface FortyGuardClient {
    String submit(HeatmapRequest request);
    HeatmapResponse getStatus(String activityId);
    HeatmapResponse waitFor(String activityId);
}
