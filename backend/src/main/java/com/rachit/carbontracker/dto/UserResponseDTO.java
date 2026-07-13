package com.rachit.carbontracker.dto;

public class UserResponseDTO {

    private Long id;
    private String name;
    private String email;
    private Integer points;
    private Integer streak;
    private Double monthlyGoal;

    public UserResponseDTO() {}

    public UserResponseDTO(Long id, String name, String email, Integer points,
                           Integer streak, Double monthlyGoal) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.points = points;
        this.streak = streak;
        this.monthlyGoal = monthlyGoal;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public Integer getStreak() {
        return streak;
    }

    public void setStreak(Integer streak) {
        this.streak = streak;
    }

    public Double getMonthlyGoal() {
        return monthlyGoal;
    }

    public void setMonthlyGoal(Double monthlyGoal) {
        this.monthlyGoal = monthlyGoal;
    }
}