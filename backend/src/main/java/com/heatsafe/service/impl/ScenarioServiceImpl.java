package com.heatsafe.service.impl;

import com.heatsafe.api.dto.HeatRiskAssessmentDTO;
import com.heatsafe.api.dto.ScenarioRequestDTO;
import com.heatsafe.api.dto.ScenarioResponseDTO;
import com.heatsafe.api.dto.TaskRiskEvaluationDTO;
import com.heatsafe.api.mapper.TaskMapper;
import com.heatsafe.domain.task.Task;
import com.heatsafe.domain.task.TaskRepository;
import com.heatsafe.service.HeatRiskService;
import com.heatsafe.service.ScenarioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScenarioServiceImpl implements ScenarioService {
    private final HeatRiskService heatRiskService;
    private final TaskRepository taskRepository;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    @Override
    @Transactional
    public ScenarioResponseDTO evaluateScenario(Long worksiteId, ScenarioRequestDTO request) {
        // 1. Get baseline assessment (current state)
        HeatRiskAssessmentDTO baselineDTO = heatRiskService.assessHeatRisk(worksiteId);

        // 2. Fetch target task
        Task task = taskRepository.findById(request.getTaskId())
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + request.getTaskId()));

        // Store original task state
        LocalDateTime originalStartTime = task.getStartTime();
        Integer originalDuration = task.getDurationMinutes();
        String originalWorkRest = task.getWorkRestRatio();
        String originalCooling = task.getCoolingMeasures();
        String originalNotes = task.getMitigationNotes();

        // 2b. Evaluate baseline task risk
        TaskRiskEvaluationDTO baselineTaskRisk = heatRiskService.evaluateTask(task, worksiteId);

        // 3. Apply proposed modifications in memory
        if (request.getProposedStartTime() != null) {
            task.setStartTime(request.getProposedStartTime());
        }
        if (request.getProposedDurationMinutes() != null && request.getProposedDurationMinutes() > 0) {
            task.setDurationMinutes(request.getProposedDurationMinutes());
        }
        if (request.getProposedWorkRestRatio() != null && !request.getProposedWorkRestRatio().trim().isEmpty()) {
            task.setWorkRestRatio(request.getProposedWorkRestRatio());
        }
        if (request.getProposedCoolingMeasures() != null) {
            task.setCoolingMeasures(request.getProposedCoolingMeasures());
        }

        taskRepository.save(task);

        // 4. Get proposed assessment & proposed task risk
        HeatRiskAssessmentDTO proposedDTO = heatRiskService.assessHeatRisk(worksiteId);
        TaskRiskEvaluationDTO proposedTaskRisk = heatRiskService.evaluateTask(task, worksiteId);

        // 5. Generate descriptive mitigation summary
        String summary = buildMitigationSummary(baselineTaskRisk, proposedTaskRisk, task);

        boolean applyToTask = Boolean.TRUE.equals(request.getApplyToTask());

        if (applyToTask) {
            if ("AWAITING_FORECAST".equals(baselineTaskRisk.getRiskLevel()) || baselineTaskRisk.getRiskScore() == null) {
                // Roll back temporary task changes
                task.setStartTime(originalStartTime);
                task.setDurationMinutes(originalDuration);
                task.setWorkRestRatio(originalWorkRest);
                task.setCoolingMeasures(originalCooling);
                task.setMitigationNotes(originalNotes);
                taskRepository.save(task);
                throw new IllegalArgumentException("Cannot apply mitigation plan to task awaiting satellite forecast (>24h out). Modify schedule parameters via Task Update API instead.");
            }

            // Commit proposed changes permanently
            task.setMitigationNotes(summary);
            Task saved = taskRepository.save(task);
            log.info("Applied what-if scenario to task {} in worksite {}: {}", task.getId(), worksiteId, summary);

            return ScenarioResponseDTO.builder()
                    .baselineAssessment(baselineDTO)
                    .proposedAssessment(proposedDTO)
                    .baselineTaskRisk(baselineTaskRisk)
                    .proposedTaskRisk(proposedTaskRisk)
                    .applied(true)
                    .updatedTask(TaskMapper.toDTO(saved))
                    .mitigationSummary(summary)
                    .createdAt(LocalDateTime.now())
                    .build();
        } else {
            // Roll back temporary task changes
            task.setStartTime(originalStartTime);
            task.setDurationMinutes(originalDuration);
            task.setWorkRestRatio(originalWorkRest);
            task.setCoolingMeasures(originalCooling);
            task.setMitigationNotes(originalNotes);
            taskRepository.save(task);

            return ScenarioResponseDTO.builder()
                    .baselineAssessment(baselineDTO)
                    .proposedAssessment(proposedDTO)
                    .baselineTaskRisk(baselineTaskRisk)
                    .proposedTaskRisk(proposedTaskRisk)
                    .applied(false)
                    .updatedTask(TaskMapper.toDTO(task))
                    .mitigationSummary(summary)
                    .createdAt(LocalDateTime.now())
                    .build();
        }
    }

    private String buildMitigationSummary(TaskRiskEvaluationDTO baselineTaskRisk, TaskRiskEvaluationDTO proposedTaskRisk, Task task) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format(Locale.US, "Task '%s' shifted to %s (%dm). ",
                task.getName(),
                task.getStartTime().format(TIME_FMT),
                task.getDurationMinutes()));

        if (task.getWorkRestRatio() != null && !task.getWorkRestRatio().equals("CONTINUOUS")) {
            sb.append(String.format(Locale.US, "Work-Rest: %s. ", task.getWorkRestRatio().replace("_", "/")));
        }
        if (task.getCoolingMeasures() != null && !task.getCoolingMeasures().isEmpty()) {
            sb.append("Cooling: ").append(task.getCoolingMeasures()).append(". ");
        }

        if ("AWAITING_FORECAST".equals(baselineTaskRisk.getRiskLevel())
                || "AWAITING_FORECAST".equals(proposedTaskRisk.getRiskLevel())
                || baselineTaskRisk.getRiskScore() == null
                || proposedTaskRisk.getRiskScore() == null) {
            sb.append("Task is scheduled >24h in advance. High-resolution FortyGuard satellite thermal forecast unlocks at T-24h.");
        } else {
            double baseScore = baselineTaskRisk.getRiskScore();
            double propScore = proposedTaskRisk.getRiskScore();
            double diff = baseScore - propScore;

            if (diff > 0.2) {
                sb.append(String.format(Locale.US, "Task Risk reduced from %.1f/10 (%s) to %.1f/10 (%s) (-%.1f points).",
                        baseScore, baselineTaskRisk.getRiskLevel(), propScore, proposedTaskRisk.getRiskLevel(), diff));
            } else {
                sb.append(String.format(Locale.US, "Task Risk is %.1f/10 (%s).", propScore, proposedTaskRisk.getRiskLevel()));
            }
        }

        return sb.toString();
    }
}

