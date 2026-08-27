package com.heatsafe.service.impl;

import com.heatsafe.api.dto.HeatRiskAssessmentDTO;
import com.heatsafe.api.dto.TemperatureSeriesDTO;
import com.heatsafe.domain.risk.HeatRiskAssessment;
import com.heatsafe.domain.task.Task;
import com.heatsafe.domain.task.TaskRepository;
import com.heatsafe.domain.temperature.TemperatureObservation;
import com.heatsafe.domain.temperature.TemperatureSeries;
import com.heatsafe.domain.worksite.Worksite;
import com.heatsafe.domain.worksite.WorksiteRepository;
import com.heatsafe.service.HeatRiskService;
import com.heatsafe.service.TemperatureService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class HeatRiskServiceImpl implements HeatRiskService {
    private final TemperatureService temperatureService;
    private final WorksiteRepository worksiteRepository;
    private final TaskRepository taskRepository;

    private static final double EXTREME_THRESHOLD = 42.0;
    private static final double HIGH_THRESHOLD    = 38.0;
    private static final double MODERATE_THRESHOLD= 35.0;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("HH:mm");

    @Override
    public HeatRiskAssessmentDTO assessHeatRisk(Long worksiteId) {
        Worksite worksite = worksiteRepository.findById(worksiteId)
                .orElseThrow(() -> new RuntimeException("Worksite not found with id: " + worksiteId));

        TemperatureSeriesDTO seriesDTO = temperatureService.getTemperatureSeries(worksiteId);
        TemperatureSeries series = convertToDomain(seriesDTO);

        if (series == null || series.getPoints() == null || series.getPoints().isEmpty()) {
            return HeatRiskAssessmentDTO.builder()
                    .riskLevel(HeatRiskAssessment.RiskLevel.UNSUPPORTED.name())
                    .score(null)
                    .criticalWindows(new ArrayList<>())
                    .affectedTasks(new ArrayList<>())
                    .reasons(List.of("FortyGuard satellite thermal telemetry is not available for this location. Heat risk assessment cannot be computed."))
                    .assessedAt(LocalDateTime.now())
                    .build();
        }

        List<Task> tasks = taskRepository.findByWorksiteId(worksiteId);

        List<HeatRiskAssessment.CriticalWindow> criticalWindows = identifyCriticalWindows(series);
        List<HeatRiskAssessment.AffectedTask> affectedTasks = identifyAffectedTasks(tasks, criticalWindows, series);

        HeatRiskAssessment.RiskLevel riskLevel = determineOverallRiskLevel(criticalWindows, affectedTasks, series);
        double score = calculateRiskScore(riskLevel, affectedTasks.size());

        List<String> reasons = generateReasons(criticalWindows, affectedTasks, series, riskLevel);

        HeatRiskAssessment assessment = HeatRiskAssessment.builder()
                .riskLevel(riskLevel)
                .score(score)
                .criticalWindows(criticalWindows)
                .affectedTasks(affectedTasks)
                .reasons(reasons)
                .assessedAt(LocalDateTime.now())
                .build();

        return HeatRiskAssessmentDTO.fromDomain(assessment);
    }

    // ── Critical windows ────────────────────────────────────────────────────

    private List<HeatRiskAssessment.CriticalWindow> identifyCriticalWindows(TemperatureSeries series) {
        List<HeatRiskAssessment.CriticalWindow> windows = new ArrayList<>();
        if (series.getPoints() == null || series.getPoints().isEmpty()) {
            return windows;
        }

        LocalDateTime windowStart = null;
        double maxTempInWindow = 0.0;

        for (TemperatureObservation point : series.getPoints()) {
            if (point.getTemperatureCelsius() >= MODERATE_THRESHOLD) {
                if (windowStart == null) {
                    windowStart = point.getTimestamp();
                    maxTempInWindow = point.getTemperatureCelsius();
                } else {
                    maxTempInWindow = Math.max(maxTempInWindow, point.getTemperatureCelsius());
                }
            } else {
                if (windowStart != null) {
                    windows.add(HeatRiskAssessment.CriticalWindow.builder()
                            .start(windowStart)
                            .end(point.getTimestamp())
                            .maxTemperature(maxTempInWindow)
                            .build());
                    windowStart = null;
                    maxTempInWindow = 0.0;
                }
            }
        }

        // Close any window still open at end-of-day
        if (windowStart != null && !series.getPoints().isEmpty()) {
            LocalDateTime last = series.getPoints().get(series.getPoints().size() - 1).getTimestamp();
            windows.add(HeatRiskAssessment.CriticalWindow.builder()
                    .start(windowStart).end(last).maxTemperature(maxTempInWindow).build());
        }
        return windows;
    }

    // ── Affected tasks ──────────────────────────────────────────────────────

    private List<HeatRiskAssessment.AffectedTask> identifyAffectedTasks(
            List<Task> tasks, List<HeatRiskAssessment.CriticalWindow> criticalWindows, TemperatureSeries series) {

        List<HeatRiskAssessment.AffectedTask> affected = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (Task task : tasks) {
            long minutesAhead = Duration.between(now, task.getStartTime()).toMinutes();
            // Tasks scheduled beyond the +12h predictive forecast window cannot have live heat impacts assessed yet
            if (minutesAhead > 12 * 60) {
                continue;
            }

            TaskRiskResult result = evaluateTaskRiskScore(task, series);
            if (result.level != HeatRiskAssessment.RiskLevel.LOW) {
                affected.add(HeatRiskAssessment.AffectedTask.builder()
                        .taskId(task.getId())
                        .taskName(task.getName())
                        .taskStart(task.getStartTime())
                        .taskEnd(task.getEndTime())
                        .workerCount(task.getWorkerCount() != null ? task.getWorkerCount() : 1)
                        .forecastStatus(HeatRiskAssessment.ForecastStatus.FORECASTABLE)
                        .riskLevel(result.level)
                        .riskScore(result.score)
                        .reason(result.reason)
                        .build());
            }
        }
        return affected;
    }

    // ── Reasons generation ──────────────────────────────────────────────────

    private List<String> generateReasons(
            List<HeatRiskAssessment.CriticalWindow> windows,
            List<HeatRiskAssessment.AffectedTask> affectedTasks,
            TemperatureSeries series,
            HeatRiskAssessment.RiskLevel overallRisk) {

        List<String> reasons = new ArrayList<>();
        double maxTemp = series.getPoints().stream()
                .mapToDouble(TemperatureObservation::getTemperatureCelsius)
                .max().orElse(0.0);

        if (maxTemp >= EXTREME_THRESHOLD) {
            reasons.add(String.format(Locale.US, "Peak temperature %.1f°C exceeds EXTREME threshold of %.0f°C", maxTemp, EXTREME_THRESHOLD));
        } else if (maxTemp >= HIGH_THRESHOLD) {
            reasons.add(String.format(Locale.US, "Peak temperature %.1f°C exceeds HIGH threshold of %.0f°C", maxTemp, HIGH_THRESHOLD));
        } else if (maxTemp >= MODERATE_THRESHOLD) {
            reasons.add(String.format(Locale.US, "Peak temperature %.1f°C exceeds MODERATE threshold of %.0f°C", maxTemp, MODERATE_THRESHOLD));
        }

        for (HeatRiskAssessment.CriticalWindow w : windows) {
            reasons.add(String.format(Locale.US,
                    "Critical heat window from %s to %s (peak %.1f°C)",
                    w.getStart().toLocalTime().toString().substring(0, 5),
                    w.getEnd().toLocalTime().toString().substring(0, 5),
                    w.getMaxTemperature()));
        }

        affectedTasks.stream().limit(3).forEach(t -> reasons.add(String.format(Locale.US,
                "Task '%s' (%s exposure) overlaps critical heat window %s–%s",
                t.getTaskName(),
                t.getRiskLevel(),
                t.getTaskStart().toLocalTime().toString().substring(0, 5),
                t.getTaskEnd().toLocalTime().toString().substring(0, 5))));

        if (reasons.isEmpty()) {
            reasons.add("All conditions within safe baseline thresholds");
        }

        return reasons;
    }

    // ── Overall risk level calculation ──────────────────────────────────────

    private HeatRiskAssessment.RiskLevel determineOverallRiskLevel(
            List<HeatRiskAssessment.CriticalWindow> windows,
            List<HeatRiskAssessment.AffectedTask> affectedTasks,
            TemperatureSeries series) {

        double maxTemp = series.getPoints().stream()
                .mapToDouble(TemperatureObservation::getTemperatureCelsius)
                .max().orElse(0.0);

        if (maxTemp >= EXTREME_THRESHOLD) {
            if (!affectedTasks.isEmpty()) return HeatRiskAssessment.RiskLevel.EXTREME;
            return HeatRiskAssessment.RiskLevel.HIGH;
        }
        if (maxTemp >= HIGH_THRESHOLD) {
            if (!affectedTasks.isEmpty()) return HeatRiskAssessment.RiskLevel.HIGH;
            return HeatRiskAssessment.RiskLevel.MODERATE;
        }
        if (maxTemp >= MODERATE_THRESHOLD) {
            if (!affectedTasks.isEmpty())  return HeatRiskAssessment.RiskLevel.MODERATE;
            return HeatRiskAssessment.RiskLevel.LOW;
        }
        if (affectedTasks.isEmpty()) return HeatRiskAssessment.RiskLevel.LOW;
        if (affectedTasks.stream().anyMatch(t -> t.getRiskLevel() == HeatRiskAssessment.RiskLevel.EXTREME))
            return HeatRiskAssessment.RiskLevel.EXTREME;
        if (affectedTasks.stream().anyMatch(t -> t.getRiskLevel() == HeatRiskAssessment.RiskLevel.HIGH))
            return HeatRiskAssessment.RiskLevel.HIGH;
        if (affectedTasks.stream().anyMatch(t -> t.getRiskLevel() == HeatRiskAssessment.RiskLevel.MODERATE))
            return HeatRiskAssessment.RiskLevel.MODERATE;
        return HeatRiskAssessment.RiskLevel.LOW;
    }

    @Override
    public com.heatsafe.api.dto.TaskRiskEvaluationDTO evaluateTask(Task task, Long worksiteId) {
        if (task == null) {
            return com.heatsafe.api.dto.TaskRiskEvaluationDTO.builder()
                    .riskLevel("SAFE")
                    .riskScore(1.0)
                    .riskReason("No task scheduled")
                    .taskPeakTemp(25.0)
                    .build();
        }

        LocalDateTime now = LocalDateTime.now();
        long minutesAhead = Duration.between(now, task.getStartTime()).toMinutes();
        // Tasks scheduled beyond the +12h window cannot have predictive heat forecast assessed yet
        if (minutesAhead > 12 * 60) {
            return com.heatsafe.api.dto.TaskRiskEvaluationDTO.builder()
                    .riskLevel("AWAITING_FORECAST")
                    .riskScore(null)
                    .riskReason("FortyGuard satellite forecast unlocks within 12 hours of shift")
                    .taskPeakTemp(null)
                    .build();
        }

        TemperatureSeriesDTO seriesDTO = temperatureService.getTemperatureSeries(worksiteId);
        TemperatureSeries series = convertToDomain(seriesDTO);
        TaskRiskResult result = evaluateTaskRiskScore(task, series);
        return com.heatsafe.api.dto.TaskRiskEvaluationDTO.builder()
                .riskLevel(result.level.name())
                .riskScore(result.score)
                .riskReason(result.reason)
                .taskPeakTemp(result.peakTemp)
                .build();
    }

    public static class TaskRiskResult {
        public HeatRiskAssessment.RiskLevel level;
        public double score;
        public String reason;
        public double peakTemp;

        public TaskRiskResult(HeatRiskAssessment.RiskLevel level, double score, String reason, double peakTemp) {
            this.level = level;
            this.score = score;
            this.reason = reason;
            this.peakTemp = peakTemp;
        }
    }

    public TaskRiskResult evaluateTaskRiskScore(Task task, TemperatureSeries series) {
        if (task.getExposureType() == Task.ExposureType.INDOOR) {
            return new TaskRiskResult(HeatRiskAssessment.RiskLevel.LOW, 1.0, "Sheltered indoor environment with cooling/thermal protection", 22.0);
        }

        if (series == null || series.getPoints() == null || series.getPoints().isEmpty()) {
            return new TaskRiskResult(HeatRiskAssessment.RiskLevel.LOW, 1.5, "Standard baseline thermal conditions", 25.0);
        }

        // Find max temperature during the task window
        double taskMaxTemp = series.getPoints().stream()
                .filter(p -> isOverlapping(task.getStartTime(), task.getEndTime(), p.getTimestamp(), p.getTimestamp().plusHours(1)))
                .mapToDouble(TemperatureObservation::getTemperatureCelsius)
                .max()
                .orElseGet(() -> series.getPoints().stream().mapToDouble(TemperatureObservation::getTemperatureCelsius).average().orElse(25.0));

        String workRest = task.getWorkRestRatio() != null ? task.getWorkRestRatio() : "CONTINUOUS";
        String cooling = task.getCoolingMeasures();
        boolean hasActiveCooling = cooling != null && !cooling.trim().isEmpty() && !cooling.equalsIgnoreCase("NONE");

        double baseScore;
        if (taskMaxTemp >= EXTREME_THRESHOLD) {
            baseScore = 9.0;
        } else if (taskMaxTemp >= HIGH_THRESHOLD) {
            baseScore = 7.5;
        } else if (taskMaxTemp >= MODERATE_THRESHOLD) {
            baseScore = 5.0;
        } else if (taskMaxTemp >= 30.0) {
            baseScore = 2.5;
        } else {
            baseScore = 1.5;
        }

        // Adjust for duration if outdoor unbroken
        if (task.getDurationMinutes() != null && task.getDurationMinutes() >= 180 && "CONTINUOUS".equals(workRest) && taskMaxTemp >= MODERATE_THRESHOLD) {
            baseScore += 0.6;
        }

        // Apply Mitigations
        if ("15_45".equals(workRest)) {
            baseScore -= 3.5;
        } else if ("30_30".equals(workRest)) {
            baseScore -= 2.5;
        } else if ("45_15".equals(workRest)) {
            baseScore -= 1.5;
        }

        if (hasActiveCooling) {
            baseScore -= 1.2;
        }

        double finalScore = Math.max(1.0, Math.min(10.0, Math.round(baseScore * 10.0) / 10.0));

        HeatRiskAssessment.RiskLevel level;
        if (finalScore >= 8.5) {
            level = HeatRiskAssessment.RiskLevel.EXTREME;
        } else if (finalScore >= 6.0) {
            level = HeatRiskAssessment.RiskLevel.HIGH;
        } else if (finalScore >= 3.5) {
            level = HeatRiskAssessment.RiskLevel.MODERATE;
        } else {
            level = HeatRiskAssessment.RiskLevel.LOW;
        }

        String reason;
        if (level == HeatRiskAssessment.RiskLevel.LOW) {
            if ("15_45".equals(workRest) || "30_30".equals(workRest) || hasActiveCooling) {
                reason = String.format(Locale.US, "Mitigated with %s rest & active cooling (Peak %.1f°C)", workRest.replace('_', '/'), taskMaxTemp);
            } else {
                reason = String.format(Locale.US, "Operating in safe morning/evening window (Peak %.1f°C)", taskMaxTemp);
            }
        } else {
            reason = String.format(Locale.US, "Exposed to %.1f°C ambient heat (%s rest cycle)", taskMaxTemp, workRest.replace('_', '/'));
        }

        return new TaskRiskResult(level, finalScore, reason, taskMaxTemp);
    }

    private double calculateRiskScore(HeatRiskAssessment.RiskLevel riskLevel, int affectedTaskCount) {
        double base = switch (riskLevel) {
            case EXTREME -> 9.0;
            case HIGH    -> 7.0;
            case MODERATE -> 5.0;
            default      -> 2.0;
        };
        return Math.min(base + Math.min(affectedTaskCount * 0.2, 1.0), 10.0);
    }

    private boolean isOverlapping(LocalDateTime s1, LocalDateTime e1, LocalDateTime s2, LocalDateTime e2) {
        // Direct datetime overlap
        if (s1.isBefore(e2) && e1.isAfter(s2)) {
            return true;
        }
        // Diurnal time-of-day overlap (protecting daily recurring work shifts against diurnal heat peak)
        java.time.LocalTime tStart = s1.toLocalTime();
        java.time.LocalTime tEnd = e1.toLocalTime();
        java.time.LocalTime wStart = s2.toLocalTime();
        java.time.LocalTime wEnd = s2.toLocalTime();
        if (wEnd.isBefore(wStart) || wEnd.equals(wStart)) {
            wEnd = e2.toLocalTime();
        }
        return tStart.isBefore(e2.toLocalTime()) && tEnd.isAfter(s2.toLocalTime());
    }

    // ── CRITICAL FIX: convertToDomain now passes the actual points through ──

    private TemperatureSeries convertToDomain(TemperatureSeriesDTO dto) {
        List<TemperatureObservation> points = new ArrayList<>();
        if (dto.getPoints() != null) {
            for (var p : dto.getPoints()) {
                try {
                    LocalDateTime ts = LocalDateTime.parse(p.getTimestamp());
                    points.add(TemperatureObservation.builder()
                            .timestamp(ts)
                            .temperatureCelsius(p.getTemperature() != null ? p.getTemperature() : 0.0)
                            .build());
                } catch (Exception e) {
                    log.warn("Could not parse temperature point timestamp: {}", p.getTimestamp());
                }
            }
        }
        return TemperatureSeries.builder()
                .source(dto.getSource())
                .unit(dto.getUnit())
                .dataBasis(dto.getDataBasis())
                .riskThreshold(dto.getRiskThreshold() != null ? dto.getRiskThreshold() : 35.0)
                .points(points)
                .criticalWindows(new ArrayList<>())
                .build();
    }
}
