package com.rachit.carbontracker.dto;

public class DashboardResponseDTO {

    private double totalEmission;
    private double transportEmission;
    private double foodEmission;
    private double energyEmission;
    private double shoppingEmission;
    private double digitalEmission;
    private int totalActivities;

    // NEW: these three were completely missing before, so the frontend
    // dashboard could never show real points/streak/goal values - it was
    // always reading undefined.
    private int totalPoints;
    private int currentStreak;
    private double monthlyGoal;

    public double getTotalEmission() {
        return totalEmission;
    }

    public void setTotalEmission(double totalEmission) {
        this.totalEmission = totalEmission;
    }

    public double getTransportEmission() {
        return transportEmission;
    }

    public void setTransportEmission(double transportEmission) {
        this.transportEmission = transportEmission;
    }

    public double getFoodEmission() {
        return foodEmission;
    }

    public void setFoodEmission(double foodEmission) {
        this.foodEmission = foodEmission;
    }

    public double getEnergyEmission() {
        return energyEmission;
    }

    public void setEnergyEmission(double energyEmission) {
        this.energyEmission = energyEmission;
    }

    public double getShoppingEmission() {
        return shoppingEmission;
    }

    public void setShoppingEmission(double shoppingEmission) {
        this.shoppingEmission = shoppingEmission;
    }

    public double getDigitalEmission() {
        return digitalEmission;
    }

    public void setDigitalEmission(double digitalEmission) {
        this.digitalEmission = digitalEmission;
    }

    public int getTotalActivities() {
        return totalActivities;
    }

    public void setTotalActivities(int totalActivities) {
        this.totalActivities = totalActivities;
    }

    public int getTotalPoints() {
        return totalPoints;
    }

    public void setTotalPoints(int totalPoints) {
        this.totalPoints = totalPoints;
    }

    public int getCurrentStreak() {
        return currentStreak;
    }

    public void setCurrentStreak(int currentStreak) {
        this.currentStreak = currentStreak;
    }

    public double getMonthlyGoal() {
        return monthlyGoal;
    }

    public void setMonthlyGoal(double monthlyGoal) {
        this.monthlyGoal = monthlyGoal;
    }
}