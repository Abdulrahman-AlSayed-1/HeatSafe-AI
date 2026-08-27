package com.heatsafe.service;

import com.heatsafe.api.dto.HeatRiskAssessmentDTO;
import com.heatsafe.api.dto.TaskRiskEvaluationDTO;
import com.heatsafe.domain.task.Task;

public interface HeatRiskService {
    HeatRiskAssessmentDTO assessHeatRisk(Long worksiteId);
    TaskRiskEvaluationDTO evaluateTask(Task task, Long worksiteId);
}
