package com.heatsafe.service.impl;

import com.heatsafe.api.dto.JobStatusDTO;
import com.heatsafe.service.JobService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class JobServiceImpl implements JobService {
    private final Map<String, JobStatusDTO> jobStore = new ConcurrentHashMap<>();

    public String createJob(Object initialData) {
        String jobId = UUID.randomUUID().toString();
        JobStatusDTO status = JobStatusDTO.builder()
                .jobId(jobId)
                .status("QUEUED")
                .message("Job queued")
                .result(null)
                .createdAt(LocalDateTime.now())
                .completedAt(null)
                .build();
        jobStore.put(jobId, status);
        return jobId;
    }

    public void updateJobStatus(String jobId, String status, String message, Object result) {
        JobStatusDTO job = jobStore.get(jobId);
        if (job != null) {
            job.setStatus(status);
            job.setMessage(message);
            job.setResult(result);
            if ("COMPLETED".equals(status) || "FAILED".equals(status)) {
                job.setCompletedAt(LocalDateTime.now());
            }
        }
    }

    @Override
    public JobStatusDTO getJobStatus(String jobId) {
        JobStatusDTO job = jobStore.get(jobId);
        if (job == null) {
            throw new RuntimeException("Job not found with id: " + jobId);
        }
        return job;
    }
}
