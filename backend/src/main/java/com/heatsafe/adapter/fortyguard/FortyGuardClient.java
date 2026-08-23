package com.heatsafe.adapter.fortyguard;

import com.heatsafe.adapter.fortyguard.dto.AnalysisRequest;
import com.heatsafe.adapter.fortyguard.dto.AnalysisResult;
import com.heatsafe.adapter.fortyguard.dto.AnalysisStatus;

public interface FortyGuardClient {
    AnalysisStatus submit(AnalysisRequest request);
    AnalysisStatus getStatus(String activityId);
    AnalysisResult waitFor(String activityId);
}
