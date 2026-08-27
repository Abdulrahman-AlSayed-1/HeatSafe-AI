package com.heatsafe.domain.task;

import com.heatsafe.domain.worksite.Worksite;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Task {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "worksite_id", nullable = false)
    private Worksite worksite;
    
    @Column(nullable = false)
    private String name;
    
    private String description;
    
    @Column(nullable = false)
    private LocalDateTime startTime;
    
    @Column(nullable = false)
    private Integer durationMinutes;

    @Column(nullable = false)
    @Builder.Default
    private Integer workerCount = 1;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExposureType exposureType;

    @Column(name = "work_rest_ratio")
    @Builder.Default
    private String workRestRatio = "CONTINUOUS";

    @Column(name = "cooling_measures")
    private String coolingMeasures;

    @Column(name = "mitigation_notes")
    private String mitigationNotes;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        if (workerCount == null || workerCount < 1) {
            workerCount = 1;
        }
        if (workRestRatio == null || workRestRatio.trim().isEmpty()) {
            workRestRatio = "CONTINUOUS";
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        if (workerCount == null || workerCount < 1) {
            workerCount = 1;
        }
        if (workRestRatio == null || workRestRatio.trim().isEmpty()) {
            workRestRatio = "CONTINUOUS";
        }
        updatedAt = LocalDateTime.now();
    }
    
    public LocalDateTime getEndTime() {
        return startTime.plusMinutes(durationMinutes);
    }
    
    public enum ExposureType {
        HIGH,
        MODERATE,
        LOW,
        INDOOR
    }
}
