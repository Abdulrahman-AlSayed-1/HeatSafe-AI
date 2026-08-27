package com.heatsafe.service;

import com.heatsafe.api.dto.TaskDTO;

import java.util.List;

public interface TaskService {
    TaskDTO createTask(Long worksiteId, TaskDTO dto);
    List<TaskDTO> getTasks(Long worksiteId);
    TaskDTO getTask(Long taskId);
    TaskDTO updateTask(Long taskId, TaskDTO dto);
    void deleteTask(Long taskId);
}
