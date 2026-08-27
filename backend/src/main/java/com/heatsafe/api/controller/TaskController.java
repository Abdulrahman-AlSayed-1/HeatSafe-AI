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
    
    @GetMapping
    public ResponseEntity<List<TaskDTO>> getTasks(@PathVariable Long worksiteId) {
        List<TaskDTO> tasks = taskService.getTasks(worksiteId);
        return ResponseEntity.ok(tasks);
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<TaskDTO> getTask(@PathVariable Long taskId) {
        TaskDTO task = taskService.getTask(taskId);
        return ResponseEntity.ok(task);
    }

    @PostMapping
    public ResponseEntity<TaskDTO> createTask(@PathVariable Long worksiteId, @RequestBody TaskDTO dto) {
        TaskDTO created = taskService.createTask(worksiteId, dto);
        return ResponseEntity.created(URI.create("/api/worksites/" + worksiteId + "/tasks/" + created.getId())).body(created);
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<TaskDTO> updateTask(@PathVariable Long taskId, @RequestBody TaskDTO dto) {
        TaskDTO updated = taskService.updateTask(taskId, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long taskId) {
        taskService.deleteTask(taskId);
        return ResponseEntity.noContent().build();
    }
}
