package com.heatsafe.service;

import com.heatsafe.api.dto.JobStatusDTO;

public interface JobService {
    JobStatusDTO getJobStatus(String jobId);
}
