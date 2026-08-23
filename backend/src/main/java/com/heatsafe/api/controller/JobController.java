package com.heatsafe.api.controller;

import com.heatsafe.api.dto.JobStatusDTO;
import com.heatsafe.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/jobs/{jobId}")
@RequiredArgsConstructor
public class JobController {
    
    private final JobService jobService;
    
    @GetMapping
    public ResponseEntity<JobStatusDTO> getJobStatus(@PathVariable String jobId) {
        return ResponseEntity.ok(jobService.getJobStatus(jobId));
    }
}
