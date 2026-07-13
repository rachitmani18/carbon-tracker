package com.rachit.carbontracker.dto;

import java.time.LocalDateTime;

// Returned by GET /api/activity/my instead of the raw Activity entity.
// Never return JPA entities directly from a controller: Activity has a
// @ManyToOne User field, and without @JsonIgnore, Jackson would
// serialize that whole User object into the JSON response - including
// the bcrypt password hash. A DTO is the safe, explicit contract between
// backend and frontend.
public class ActivityItemDTO {

    private Long id;
    private String activityType;
    private String description;
    private Double carbonEmission;
    private LocalDateTime createdAt;

    public ActivityItemDTO() {}

    public ActivityItemDTO(Long id, String activityType, String description,
                           Double carbonEmission, LocalDateTime createdAt) {
        this.id = id;
        this.activityType = activityType;
        this.description = description;
        this.carbonEmission = carbonEmission;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getActivityType() {
        return activityType;
    }

    public void setActivityType(String activityType) {
        this.activityType = activityType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getCarbonEmission() {
        return carbonEmission;
    }

    public void setCarbonEmission(Double carbonEmission) {
        this.carbonEmission = carbonEmission;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}