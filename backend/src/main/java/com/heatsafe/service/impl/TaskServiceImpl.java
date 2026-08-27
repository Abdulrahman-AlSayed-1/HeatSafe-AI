package com.heatsafe.service.impl;

import com.heatsafe.api.dto.TaskDTO;
import com.heatsafe.api.dto.TaskRiskEvaluationDTO;
import com.heatsafe.api.mapper.TaskMapper;
import com.heatsafe.domain.task.Task;
import com.heatsafe.domain.task.TaskRepository;
import com.heatsafe.domain.worksite.Worksite;
import com.heatsafe.domain.worksite.WorksiteRepository;
import com.heatsafe.service.HeatRiskService;
import com.heatsafe.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskServiceImpl implements TaskService {
    private final TaskRepository taskRepository;
    private final WorksiteRepository worksiteRepository;
    @Lazy
    private final HeatRiskService heatRiskService;

    @Override
    public TaskDTO createTask(Long worksiteId, TaskDTO dto) {
        Worksite worksite = worksiteRepository.findById(worksiteId)
                .orElseThrow(() -> new RuntimeException("Worksite not found with id: " + worksiteId));
        Task task = TaskMapper.toEntity(dto, worksite);
        Task saved = taskRepository.save(task);
        return enrichDTO(saved);
    }

    @Override
    public List<TaskDTO> getTasks(Long worksiteId) {
        worksiteRepository.findById(worksiteId)
                .orElseThrow(() -> new RuntimeException("Worksite not found with id: " + worksiteId));
        return taskRepository.findByWorksiteId(worksiteId).stream()
                .map(this::enrichDTO)
                .collect(Collectors.toList());
    }

    @Override
    public TaskDTO getTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));
        return enrichDTO(task);
    }

    @Override
    public TaskDTO updateTask(Long taskId, TaskDTO dto) {
        Task existingTask = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));
        
        Worksite worksite = existingTask.getWorksite();
        Task updatedTask = TaskMapper.toEntity(dto, worksite);
        updatedTask.setId(taskId);
        
        Task saved = taskRepository.save(updatedTask);
        return enrichDTO(saved);
    }

    @Override
    public void deleteTask(Long taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new RuntimeException("Task not found with id: " + taskId);
        }
        taskRepository.deleteById(taskId);
    }

    private TaskDTO enrichDTO(Task task) {
        TaskDTO dto = TaskMapper.toDTO(task);
        if (dto != null && task.getWorksite() != null) {
            try {
                TaskRiskEvaluationDTO eval = heatRiskService.evaluateTask(task, task.getWorksite().getId());
                dto.setRiskLevel(eval.getRiskLevel());
                dto.setRiskScore(eval.getRiskScore());
                dto.setRiskReason(eval.getRiskReason());
            } catch (Exception e) {
                dto.setRiskLevel("SAFE");
                dto.setRiskScore(1.0);
            }
        }
        return dto;
    }
}
