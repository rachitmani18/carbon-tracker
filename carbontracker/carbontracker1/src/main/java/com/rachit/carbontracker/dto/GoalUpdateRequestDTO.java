package com.rachit.carbontracker.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class GoalUpdateRequestDTO {

    @NotNull(message = "Monthly goal is required")
    @Positive(message = "Monthly goal must be greater than 0")
    private Double monthlyGoal;

    public Double getMonthlyGoal() {
        return monthlyGoal;
    }

    public void setMonthlyGoal(Double monthlyGoal) {
        this.monthlyGoal = monthlyGoal;
    }
}