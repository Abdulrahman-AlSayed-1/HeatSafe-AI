package com.heatsafe.service;

import com.heatsafe.api.dto.TaskDTO;

public interface TaskService {
    TaskDTO createTask(Long worksiteId, TaskDTO dto);
}
