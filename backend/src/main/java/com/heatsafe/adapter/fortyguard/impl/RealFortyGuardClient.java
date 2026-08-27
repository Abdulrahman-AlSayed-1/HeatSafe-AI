package com.heatsafe.adapter.fortyguard.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heatsafe.adapter.fortyguard.FortyGuardClient;
import com.heatsafe.adapter.fortyguard.dto.HeatmapRequest;
import com.heatsafe.adapter.fortyguard.dto.HeatmapResponse;
import com.heatsafe.adapter.fortyguard.exception.FortyGuardException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.Set;

/**
 * Real FortyGuard client connecting directly to the live /v1/heatmap and /v1/status endpoints.
 * Fully aligned with official FortyGuard Enterprise API specifications.
 */
@Component
@Slf4j
public class RealFortyGuardClient implements FortyGuardClient {

    private static final int MAX_POLL_ATTEMPTS = 25;
    private static final long POLL_INTERVAL_MS = 3_000;
    private static final Set<String> TERMINAL_SUCCESS = Set.of("succeeded", "completed");
    private static final Set<String> TERMINAL_FAILURE = Set.of("failed", "error");

    private final RestTemplate restTemplate;
    private final String apiKey;
    private final String baseUrl;
    private final ObjectMapper objectMapper;

    public RealFortyGuardClient(
            RestTemplate restTemplate,
            @Value("${fortyguard.api-key:}") String apiKey,
            @Value("${fortyguard.base-url:https://api.fortyguard.com}") String baseUrl,
            ObjectMapper objectMapper
    ) {
        this.restTemplate = restTemplate;
        this.apiKey = apiKey != null ? apiKey.trim() : "";
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.objectMapper = objectMapper;
    }

    private void validateApiKey() {
        if (apiKey.isEmpty()) {
            throw new FortyGuardException(
                    "FortyGuard API Key is not configured. Please set the FORTYGUARD_API_KEY environment variable to access live microclimate telemetry.",
                    HttpStatus.UNAUTHORIZED,
                    "FORTYGUARD_API_KEY_MISSING"
            );
        }
    }

    @Override
    public String submit(HeatmapRequest request) {
        validateApiKey();

        String url = baseUrl + "/v1/heatmap";
        HttpHeaders headers = createHeaders();
        HttpEntity<HeatmapRequest> entity = new HttpEntity<>(request, headers);

        try {
            log.info("Submitting heatmap request to FortyGuard: {}, analytic_type={}", url, request.getAnalyticType());
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            if (response.getBody() == null) {
                throw new FortyGuardException(
                        "FortyGuard API returned an empty response.",
                        HttpStatus.BAD_GATEWAY,
                        "FORTYGUARD_INVALID_RESPONSE"
                );
            }

            JsonNode root = objectMapper.readTree(response.getBody());
            if (root.path("error").asBoolean(false)) {
                String errorMsg = root.path("message").asText("FortyGuard API rejected the submission");
                throw new FortyGuardException(errorMsg, HttpStatus.BAD_REQUEST, "FORTYGUARD_SUBMISSION_REJECTED");
            }

            String activityId = null;
            if (root.has("data") && root.get("data").has("activity_id")) {
                activityId = root.get("data").get("activity_id").asText();
            } else if (root.has("activity_id")) {
                activityId = root.get("activity_id").asText();
            }

            if (activityId == null || activityId.isBlank()) {
                throw new FortyGuardException(
                        "FortyGuard API returned missing activity_id.",
                        HttpStatus.BAD_GATEWAY,
                        "FORTYGUARD_INVALID_RESPONSE"
                );
            }

            log.info("Heatmap submitted successfully, activity_id: {}", activityId);
            return activityId;

        } catch (HttpStatusCodeException e) {
            handleHttpError("POST /v1/heatmap", e);
            return null; // unreachable
        } catch (ResourceAccessException e) {
            log.error("Network error connecting to FortyGuard: {}", e.getMessage());
            throw new FortyGuardException(
                    "Could not connect to FortyGuard API server. Network timeout or connection refused.",
                    HttpStatus.GATEWAY_TIMEOUT,
                    "FORTYGUARD_CONNECTION_FAILED"
            );
        } catch (FortyGuardException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error submitting heatmap request to FortyGuard", e);
            throw new FortyGuardException(
                    "Failed to process FortyGuard heatmap submission: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "FORTYGUARD_SUBMISSION_ERROR"
            );
        }
    }

    @Override
    public HeatmapResponse getStatus(String activityId) {
        validateApiKey();

        String url = baseUrl + "/v1/status/" + activityId;
        HttpHeaders headers = createHeaders();
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            if (response.getBody() == null) {
                return null;
            }

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode data = root.has("data") ? root.get("data") : root;
            String status = data.path("status").asText("").toLowerCase();

            if (TERMINAL_SUCCESS.contains(status)) {
                JsonNode resultNode = data.has("result") ? data.get("result") : data;
                return HeatmapResponse.builder()
                        .activityId(activityId)
                        .mapData(resultNode.get("map_data"))
                        .statsData(resultNode.get("stats_data"))
                        .build();
            } else if (TERMINAL_FAILURE.contains(status)) {
                String msg = data.path("message").asText("Activity processing failed on FortyGuard");
                throw new FortyGuardException(
                        "FortyGuard activity failed: " + msg,
                        HttpStatus.BAD_GATEWAY,
                        "FORTYGUARD_TASK_FAILED"
                );
            }
            return null; // still in progress

        } catch (HttpStatusCodeException e) {
            if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                return null; // Not ready yet
            }
            handleHttpError("GET /v1/status/" + activityId, e);
            return null;
        } catch (FortyGuardException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Error checking status for activity {}: {}", activityId, e.getMessage());
            return null;
        }
    }

    @Override
    public HeatmapResponse waitFor(String activityId) {
        validateApiKey();

        String url = baseUrl + "/v1/status/" + activityId;
        HttpHeaders headers = createHeaders();
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        log.info("Polling FortyGuard status for activity: {}", activityId);

        for (int attempt = 1; attempt <= MAX_POLL_ATTEMPTS; attempt++) {
            try {
                ResponseEntity<String> response = restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        entity,
                        String.class
                );

                if (response.getBody() != null) {
                    JsonNode root = objectMapper.readTree(response.getBody());
                    JsonNode data = root.has("data") ? root.get("data") : root;
                    String status = data.path("status").asText("").toLowerCase();

                    if (TERMINAL_SUCCESS.contains(status)) {
                        log.info("FortyGuard activity {} succeeded on attempt {}", activityId, attempt);
                        JsonNode resultNode = data.has("result") ? data.get("result") : data;

                        return HeatmapResponse.builder()
                                .activityId(activityId)
                                .mapData(resultNode.get("map_data"))
                                .statsData(resultNode.get("stats_data"))
                                .build();
                    } else if (TERMINAL_FAILURE.contains(status)) {
                        String msg = data.path("message").asText("Activity processing failed on FortyGuard");
                        log.error("FortyGuard activity {} failed: {}", activityId, msg);
                        throw new FortyGuardException(
                                "FortyGuard activity failed: " + msg,
                                HttpStatus.BAD_GATEWAY,
                                "FORTYGUARD_TASK_FAILED"
                        );
                    } else {
                        log.debug("Activity {} status: '{}' (attempt {}/{})", activityId, status, attempt, MAX_POLL_ATTEMPTS);
                    }
                }

            } catch (HttpStatusCodeException e) {
                if (e.getStatusCode() == HttpStatus.NOT_FOUND && attempt < 5) {
                    // Eventual consistency: status endpoint may return 404 momentarily right after submission
                    log.debug("Activity {} not ready yet (HTTP 404 on attempt {}), retrying...", activityId, attempt);
                } else {
                    handleHttpError("GET /v1/status/" + activityId, e);
                }
            } catch (ResourceAccessException e) {
                log.warn("Network timeout while polling activity {} on attempt {}", activityId, attempt);
            } catch (FortyGuardException e) {
                throw e;
            } catch (Exception e) {
                log.warn("Error polling activity {} (attempt {}): {}", activityId, attempt, e.getMessage());
            }

            try {
                Thread.sleep(POLL_INTERVAL_MS);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new FortyGuardException(
                        "Interrupted while waiting for FortyGuard heatmap",
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "FORTYGUARD_INTERRUPTED"
                );
            }
        }

        log.error("Timed out waiting for FortyGuard activity {}", activityId);
        throw new FortyGuardException(
                "Timed out waiting for FortyGuard to process satellite heatmap (" + activityId + ")",
                HttpStatus.GATEWAY_TIMEOUT,
                "FORTYGUARD_TIMEOUT"
        );
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", apiKey);
        headers.set("x-api-key", apiKey);
        headers.set("Authorization", "Bearer " + apiKey);
        return headers;
    }

    private void handleHttpError(String action, HttpStatusCodeException e) {
        log.error("FortyGuard API HTTP error on {}: status={}, body={}", action, e.getStatusCode(), e.getResponseBodyAsString());

        if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
            throw new FortyGuardException(
                    "FortyGuard API 401 Unauthorized: Invalid or expired API Key.",
                    HttpStatus.UNAUTHORIZED,
                    "FORTYGUARD_UNAUTHORIZED"
            );
        } else if (e.getStatusCode() == HttpStatus.FORBIDDEN) {
            throw new FortyGuardException(
                    "FortyGuard API 403 Forbidden: Insufficient permissions for requested thermal layer.",
                    HttpStatus.FORBIDDEN,
                    "FORTYGUARD_FORBIDDEN"
            );
        } else if (e.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS) {
            throw new FortyGuardException(
                    "FortyGuard API 429: Rate limit exceeded. Please retry shortly.",
                    HttpStatus.TOO_MANY_REQUESTS,
                    "FORTYGUARD_RATE_LIMITED"
            );
        } else {
            throw new FortyGuardException(
                    "FortyGuard API error (" + e.getStatusCode().value() + "): " + e.getStatusText(),
                    HttpStatus.valueOf(e.getStatusCode().value()),
                    "FORTYGUARD_API_ERROR"
            );
        }
    }
}
