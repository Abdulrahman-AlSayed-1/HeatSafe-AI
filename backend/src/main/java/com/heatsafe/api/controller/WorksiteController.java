package com.heatsafe.api.controller;

import com.heatsafe.api.dto.WorksiteDTO;
import com.heatsafe.service.WorksiteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/worksites")
@RequiredArgsConstructor
public class WorksiteController {
    
    private final WorksiteService worksiteService;
    
    @GetMapping
    public ResponseEntity<List<WorksiteDTO>> listWorksites() {
        return ResponseEntity.ok(worksiteService.getAllWorksites());
    }
    
    @PostMapping
    public ResponseEntity<WorksiteDTO> createWorksite(@RequestBody WorksiteDTO dto) {
        WorksiteDTO created = worksiteService.createWorksite(dto);
        return ResponseEntity.created(URI.create("/api/worksites/" + created.getId())).body(created);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<WorksiteDTO> getWorksite(@PathVariable Long id) {
        return ResponseEntity.ok(worksiteService.getWorksite(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorksite(@PathVariable Long id) {
        worksiteService.deleteWorksite(id);
        return ResponseEntity.noContent().build();
    }
}
