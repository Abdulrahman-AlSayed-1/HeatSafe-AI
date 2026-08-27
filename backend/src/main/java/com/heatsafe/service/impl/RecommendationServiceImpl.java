package com.heatsafe.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heatsafe.api.dto.HeatRiskAssessmentDTO;
import com.heatsafe.api.dto.RecommendationDTO;
import com.heatsafe.api.dto.RiskAssessmentEvidenceDTO;
import com.heatsafe.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationServiceImpl implements RecommendationService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${spring.ai.openai.base-url:http://127.0.0.1:11434}")
    private String aiBaseUrl;

    @Value("${spring.ai.openai.api-key:ollama}")
    private String aiApiKey;

    @Value("${spring.ai.openai.chat.options.model:llama3.1}")
    private String aiModel;

    @Override
    public List<RecommendationDTO> generateRecommendations(Long worksiteId, RiskAssessmentEvidenceDTO evidence) {
        if (evidence == null || evidence.getAffectedTasks() == null || evidence.getAffectedTasks().isEmpty()) {
            log.info("No active non-low-risk tasks requiring mitigation for worksite {}", worksiteId);
            return List.of();
        }

        try {
            String prompt = buildPrompt(evidence);

            String cleanBase = aiBaseUrl.replaceAll("/v1/?$", "").replaceAll("/+$", "");
            if (cleanBase.contains("localhost")) {
                cleanBase = cleanBase.replace("localhost", "127.0.0.1");
            }
            String url = cleanBase + "/v1/chat/completions";
            log.info("Generating AI recommendations using model '{}' at URL: {}", aiModel, url);

            Map<String, Object> requestPayload = Map.of(
                    "model", aiModel,
                    "messages", List.of(
                            Map.of("role", "system", "content",
                                    "You are an expert occupational heat-safety engineer following OSHA and NIOSH standards.\n" +
                                    "Your goal is to provide tailored, highly actionable heat mitigation recommendations.\n" +
                                    "RULES:\n" +
                                    "- Provide at least ONE dedicated tailored recommendation for EACH non-low-risk task listed by name, addressing its exact risk cause.\n" +
                                    "- Then provide TWO site-wide environmental controls (e.g. 1. Electrolyte hydration protocol, 2. Microclimate shade/misting canopy).\n" +
                                    "- ACTION: 1 short direct command (under 14 words).\n" +
                                    "- REASONING: 1 short sentence (under 20 words) citing specific temperatures/hours.\n" +
                                    "- IMPACT: 1 short phrase with percentage or score reduction (under 10 words).\n" +
                                    "- No conversational preamble, no markdown headers, no filler."),
                            Map.of("role", "user", "content", prompt)
                    ),
                    "temperature", 0.2
            );

            WebClient client = WebClient.builder()
                    .baseUrl(url)
                    .defaultHeader("Authorization", "Bearer " + aiApiKey)
                    .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                    .build();

            String responseBody = client.post()
                    .bodyValue(requestPayload)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(20))
                    .block();

            JsonNode rootNode = objectMapper.readTree(responseBody);
            String aiText = rootNode.path("choices").path(0).path("message").path("content").asText();

            log.info("Successfully received AI recommendations from {}: {}", aiModel, aiText);
            List<RecommendationDTO> parsed = parseRecommendations(aiText, evidence);
            if (!parsed.isEmpty()) {
                return parsed;
            }
        } catch (Exception e) {
            log.warn("AI LLM call unavailable ({}: {}), utilizing deterministic baseline protocols", e.getClass().getSimpleName(), e.getMessage());
        }
        return getFallbackRecommendations(evidence);
    }

    @Override
    public List<RecommendationDTO> generateRecommendations(Long worksiteId, HeatRiskAssessmentDTO riskAssessment) {
        RiskAssessmentEvidenceDTO evidence = RiskAssessmentEvidenceDTO.builder()
                .riskLevel(riskAssessment.getRiskLevel())
                .score(riskAssessment.getScore())
                .reasons(riskAssessment.getReasons())
                .affectedTasks(riskAssessment.getAffectedTasks() != null ?
                        riskAssessment.getAffectedTasks().stream()
                                .map(t -> RiskAssessmentEvidenceDTO.TaskEvidenceDTO.builder()
                                        .taskName(t.getTaskName())
                                        .exposureType(t.getRiskLevel())
                                        .timeRange(t.getTaskStart() + " - " + t.getTaskEnd())
                                        .riskScore(t.getRiskScore())
                                        .workerCount(t.getWorkerCount())
                                        .reason(t.getReason())
                                        .build())
                                .toList() : List.of())
                .build();
        return generateRecommendations(worksiteId, evidence);
    }

    private String buildPrompt(RiskAssessmentEvidenceDTO evidence) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Based on the following FortyGuard thermal analytics and worksite heat risk assessment, provide concise, actionable recommendations to mitigate heat hazard for workers.\n\n");

        prompt.append("Worksite Heat Evidence:\n");
        prompt.append("- Thermal Hazard Level: ").append(evidence.getRiskLevel() != null ? evidence.getRiskLevel() : "MODERATE");
        if (evidence.getScore() != null) {
            prompt.append(" (Hazard Index: ").append(String.format("%.1f", evidence.getScore())).append("/10)\n");
        } else {
            prompt.append("\n");
        }

        if (evidence.getThermalMinTemp() != null && evidence.getThermalMaxTemp() != null) {
            prompt.append(String.format("- Ambient Thermal Profile: Min %.1f°C | Avg %.1f°C | Max %.1f°C\n",
                    evidence.getThermalMinTemp(),
                    evidence.getThermalAvgTemp() != null ? evidence.getThermalAvgTemp() : evidence.getThermalMaxTemp(),
                    evidence.getThermalMaxTemp()));
        }

        if (evidence.getHoursAboveThreshold() != null && evidence.getLongestContinuousExposure() != null) {
            prompt.append(String.format("- Exposure Profile: %d hours above 35°C threshold | Longest continuous high-heat period: %dh\n",
                    evidence.getHoursAboveThreshold(),
                    evidence.getLongestContinuousExposure()));
        }

        if (evidence.getReasons() != null && !evidence.getReasons().isEmpty()) {
            prompt.append("- Key Worksite Risk Factors Identified:\n");
            for (String reason : evidence.getReasons()) {
                prompt.append("  * ").append(reason).append("\n");
            }
        }

        int taskCount = (evidence.getAffectedTasks() != null) ? evidence.getAffectedTasks().size() : 0;
        int totalExpected = taskCount + 2;

        if (evidence.getAffectedTasks() != null && !evidence.getAffectedTasks().isEmpty()) {
            prompt.append("\n- Specific At-Risk Tasks Requiring Tailored Action:\n");
            for (var task : evidence.getAffectedTasks()) {
                String scoreStr = task.getRiskScore() != null ? String.format("%.1f/10", task.getRiskScore()) : "At Risk";
                prompt.append("  * Task: '").append(task.getTaskName()).append("'")
                        .append(" | Risk: ").append(task.getExposureType()).append(" (").append(scoreStr).append(")")
                        .append(" | Schedule: ").append(task.getTimeRange())
                        .append(" | Workers: ").append(task.getWorkerCount() != null ? task.getWorkerCount() : 1)
                        .append(" | Specific Hazard: ").append(task.getReason() != null ? task.getReason() : "Peak heat overlap")
                        .append("\n");
            }
        }

        prompt.append(String.format("\nTASK-SPECIFIC AND ENVIRONMENTAL INSTRUCTION:\n" +
                "You MUST generate exactly %d recommendations in total:\n" +
                "1. Exactly ONE tailored recommendation for EACH of the %d at-risk tasks listed above (referencing each task by its exact name '%s' in the ACTION command and addressing its specific shift timing/exposure).\n" +
                "2. Exactly TWO site-wide environmental controls:\n" +
                "   - Site-wide mandatory 1.0L/hr chilled electrolyte hydration protocol.\n" +
                "   - Active shaded microclimate cooling and portable high-pressure misting stations.\n\n",
                totalExpected, taskCount,
                taskCount > 0 ? evidence.getAffectedTasks().get(0).getTaskName() : "Task"));

        prompt.append("Format strictly as:\n");
        prompt.append("ACTION: [Direct command naming the specific task in quotes, under 14 words]\n");
        prompt.append("REASONING: [1 sentence citing specific task metrics, under 20 words]\n");
        prompt.append("IMPACT: [Short phrase with percentage or score reduction, under 10 words]\n\n");

        return prompt.toString();
    }

    private List<RecommendationDTO> parseRecommendations(String response, RiskAssessmentEvidenceDTO evidence) {
        List<RecommendationDTO> recommendations = new ArrayList<>();
        if (response == null || response.isBlank()) {
            return recommendations;
        }

        List<RiskAssessmentEvidenceDTO.TaskEvidenceDTO> affectedTasks = (evidence != null && evidence.getAffectedTasks() != null)
                ? evidence.getAffectedTasks()
                : List.of();

        String[] sections = response.split("(?i)ACTION:");

        for (int i = 1; i < sections.length; i++) {
            try {
                String section = sections[i];

                String action = extractField(section, "", "REASONING:");
                String reasoning = extractField(section, "REASONING:", "IMPACT:");
                String impact = extractField(section, "IMPACT:", "ACTION:");

                if (impact.isEmpty() && i == sections.length - 1) {
                    impact = extractField(section, "IMPACT:", null);
                }

                // Clean single line content, markdown asterisks and trailing labels
                action = action.split("\\r?\\n")[0].replaceAll("^\\*+|\\*+$", "").trim();
                reasoning = reasoning.split("\\r?\\n")[0].replaceAll("^\\*+|\\*+$", "").trim();
                impact = impact.split("\\r?\\n")[0].replaceAll("^\\*+|\\*+$", "").trim();

                if (!action.isEmpty()) {
                    String category = "SITE_CONTROL";
                    String targetTask = null;

                    // Match task by name in action or reasoning
                    for (var t : affectedTasks) {
                        if (action.toLowerCase().contains(t.getTaskName().toLowerCase()) ||
                                reasoning.toLowerCase().contains(t.getTaskName().toLowerCase())) {
                            category = "TASK_CONTROL";
                            targetTask = t.getTaskName();
                            break;
                        }
                    }

                    // Index-based assignment fallback if first N recommendations correspond to affected tasks
                    int recIdx = recommendations.size();
                    if (targetTask == null && recIdx < affectedTasks.size()) {
                        category = "TASK_CONTROL";
                        targetTask = affectedTasks.get(recIdx).getTaskName();
                        if (!action.toLowerCase().contains(targetTask.toLowerCase())) {
                            action = String.format("For '%s': %s", targetTask, action);
                        }
                    }

                    recommendations.add(RecommendationDTO.builder()
                            .id((long) recommendations.size() + 1)
                            .category(category)
                            .targetTask(targetTask)
                            .action(action)
                            .reasoning(reasoning)
                            .expectedImpact(impact.isEmpty() ? "Significant reduction in occupational thermal strain" : impact)
                            .build());
                }
            } catch (Exception e) {
                log.warn("Failed to parse recommendation section {}", i, e);
            }
        }

        return recommendations;
    }

    private String extractField(String text, String startMarker, String endMarker) {
        int startIndex = 0;
        if (!startMarker.isEmpty()) {
            int idx = text.toUpperCase().indexOf(startMarker.toUpperCase());
            if (idx == -1) return "";
            startIndex = idx + startMarker.length();
        }

        int end = text.length();
        if (endMarker != null) {
            int endIdx = text.toUpperCase().indexOf(endMarker.toUpperCase(), startIndex);
            if (endIdx != -1) {
                end = endIdx;
            }
        }

        return text.substring(startIndex, end).trim();
    }

    private List<RecommendationDTO> getFallbackRecommendations(RiskAssessmentEvidenceDTO evidence) {
        List<RecommendationDTO> recommendations = new ArrayList<>();
        long recId = 1L;

        // 1. Task-Specific Tailored Recommendations (One per non-low-risk task)
        if (evidence != null && evidence.getAffectedTasks() != null && !evidence.getAffectedTasks().isEmpty()) {
            for (var task : evidence.getAffectedTasks()) {
                String riskLvl = task.getExposureType() != null ? task.getExposureType() : "HIGH";
                String reason = task.getReason() != null ? task.getReason() : "severe thermal exposure";
                String scoreStr = task.getRiskScore() != null ? String.format("%.1f/10", task.getRiskScore()) : "elevated";

                if ("EXTREME".equalsIgnoreCase(riskLvl) || reason.toLowerCase().contains("peak heat") || reason.toLowerCase().contains("midday")) {
                    recommendations.add(RecommendationDTO.builder()
                            .id(recId++)
                            .category("TASK_CONTROL")
                            .targetTask(task.getTaskName())
                            .action(String.format("Reschedule '%s' (%s) to cooler morning window (before 11:00 AM)",
                                    task.getTaskName(),
                                    task.getTimeRange() != null ? task.getTimeRange() : "scheduled shift"))
                            .reasoning(String.format("Task encounters %s (%s). Morning shift eliminates extreme solar radiation and core thermal buildup.",
                                    reason, riskLvl))
                            .expectedImpact(String.format("Reduces task risk score from %s to safe baseline (<3.0)", scoreStr))
                            .build());
                } else if ("HIGH".equalsIgnoreCase(riskLvl) || reason.toLowerCase().contains("duration") || reason.toLowerCase().contains("unbroken") || reason.toLowerCase().contains("continuous")) {
                    int restDuration = "EXTREME".equalsIgnoreCase(riskLvl) ? 20 : 15;
                    int workDuration = "EXTREME".equalsIgnoreCase(riskLvl) ? 30 : 45;
                    recommendations.add(RecommendationDTO.builder()
                            .id(recId++)
                            .category("TASK_CONTROL")
                            .targetTask(task.getTaskName())
                            .action(String.format("Enforce mandatory %dm work / %dm shaded rest rotation for '%s' (%d workers)",
                                    workDuration, restDuration,
                                    task.getTaskName(),
                                    task.getWorkerCount() != null ? task.getWorkerCount() : 4))
                            .reasoning(String.format("Continuous outdoor labor during %s without active recovery leads to rapid metabolic heat storage.",
                                    task.getTimeRange() != null ? task.getTimeRange() : "shift"))
                            .expectedImpact("Cuts heat strain and exhaustion risk by 55–65%")
                            .build());
                } else {
                    recommendations.add(RecommendationDTO.builder()
                            .id(recId++)
                            .category("TASK_CONTROL")
                            .targetTask(task.getTaskName())
                            .action(String.format("Deploy mobile misting fans and shaded cooling station at '%s' work perimeter",
                                    task.getTaskName()))
                            .reasoning(String.format("Localized microclimate intervention prevents heat strain escalation during %s scheduled shift.",
                                    task.getTimeRange() != null ? task.getTimeRange() : "active window"))
                            .expectedImpact("Reduces effective microclimate thermal load by 4–6°C")
                            .build());
                }
            }
        }

        // 2. Exposure-Calibrated Hydration & Site-Wide Physiological Recovery Protocol (Environmental 1)
        int hoursAbove = (evidence != null && evidence.getHoursAboveThreshold() != null) ? evidence.getHoursAboveThreshold() : 8;
        recommendations.add(RecommendationDTO.builder()
                .id(recId++)
                .category("SITE_CONTROL")
                .targetTask(null)
                .action("Enforce mandatory 1.0L/hr chilled electrolyte hydration and buddy-system monitoring")
                .reasoning(String.format("With %d hours above 35°C threshold across the worksite, continuous fluid and electrolyte replacement prevents clinical dehydration.", hoursAbove))
                .expectedImpact("Reduces severe heat illness and cramping incidence by up to 60%")
                .build());

        // 3. Site-Wide Microclimate Cooling & Shade Engineering (Environmental 2)
        String avgTempStr = (evidence != null && evidence.getThermalAvgTemp() != null) ? String.format("%.1f°C", evidence.getThermalAvgTemp()) : "elevated ambient";
        recommendations.add(RecommendationDTO.builder()
                .id(recId++)
                .category("SITE_CONTROL")
                .targetTask(null)
                .action("Deploy portable high-pressure misting stations and shade canopies across active outdoor zones")
                .reasoning(String.format("Ambient thermal hazard levels (%s) and radiant surface heat require active shaded microclimate recovery points.", avgTempStr))
                .expectedImpact("Lowers effective microclimate temperature by 4–7°C at rest points")
                .build());

        return recommendations;
    }
}
