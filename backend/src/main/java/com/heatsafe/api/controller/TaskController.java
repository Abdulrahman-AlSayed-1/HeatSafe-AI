package com.heatsafe.api.controller;

import com.heatsafe.api.dto.TaskDTO;
import com.heatsafe.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/worksites/{worksiteId}/tasks")
@RequiredArgsConstructor
public class TaskController {
    
    private final TaskService taskService;
    
    @PostMapping
    public ResponseEntity<TaskDTO> createTask(@PathVariable Long worksiteId, @RequestBody TaskDTO dto) {
        TaskDTO created = taskService.createTask(worksiteId, dto);
        return ResponseEntity.created(URI.create("/api/worksites/" + worksiteId + "/tasks/" + created.getId())).body(created);
    }
}
