package com.rachit.carbontracker.service;

import java.util.ArrayList;
import java.util.List;

import com.rachit.carbontracker.dto.ActivityItemDTO;
import com.rachit.carbontracker.dto.ActivityRequestDTO;
import com.rachit.carbontracker.dto.ActivityResponseDTO;
import com.rachit.carbontracker.dto.DashboardResponseDTO;
import com.rachit.carbontracker.entity.Activity;
import com.rachit.carbontracker.entity.User;
import com.rachit.carbontracker.repository.ActivityRepository;
import com.rachit.carbontracker.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class ActivityService {

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private UserRepository userRepository;

    // Save Activity
    public ActivityResponseDTO saveActivity(ActivityRequestDTO request,
                                            Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return new ActivityResponseDTO(false, "User not found");
        }

        Activity activity = new Activity();

        activity.setActivityType(request.getActivityType());
        activity.setDescription(request.getDescription());
        activity.setCarbonEmission(request.getCarbonEmission());
        activity.setUser(user);

        activityRepository.save(activity);

        // FIX: points/streak were never actually updated anywhere before -
        // the User entity had the fields, but nothing ever wrote to them.
        // Points formula: lower emission = more points, same idea as the
        // original frontend-only version, just now computed and persisted
        // server-side (never trust a client-submitted point value).
        double emission = request.getCarbonEmission() != null ? request.getCarbonEmission() : 0.0;
        int pointsEarned = (int) Math.max(5, Math.round(10 - emission));

        user.setPoints(user.getPoints() + pointsEarned);
        user.setStreak(user.getStreak() + 1);

        userRepository.save(user);

        return new ActivityResponseDTO(true, "Activity Saved Successfully");
    }

    // Get My Activities
    // FIX: previously returned List<Activity> (the raw JPA entity) straight
    // from the controller. Activity has a @ManyToOne User user field with no
    // @JsonIgnore, so Jackson would serialize the whole User object into the
    // response - including the bcrypt password hash. Mapping to a DTO here
    // closes that leak entirely.
    public List<ActivityItemDTO> getMyActivities(Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return new ArrayList<>();
        }

        List<Activity> activities = activityRepository.findByUser(user);

        List<ActivityItemDTO> result = new ArrayList<>();

        for (Activity activity : activities) {
            result.add(new ActivityItemDTO(
                    activity.getId(),
                    activity.getActivityType(),
                    activity.getDescription(),
                    activity.getCarbonEmission(),
                    activity.getCreatedAt()
            ));
        }

        return result;
    }

    // Dashboard
    public DashboardResponseDTO getDashboard(Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email).orElse(null);

        DashboardResponseDTO dashboard = new DashboardResponseDTO();

        if (user == null) {
            return dashboard;
        }

        List<Activity> activities = activityRepository.findByUser(user);

        double total = 0;
        double transport = 0;
        double food = 0;
        double energy = 0;
        double shopping = 0;
        double digital = 0;

        for (Activity activity : activities) {

            double emission = activity.getCarbonEmission() != null ? activity.getCarbonEmission() : 0.0;
            total += emission;

            // FIX: activity.getActivityType() could theoretically be null
            // (e.g. bad data, manual DB edit) and .toLowerCase() on null
            // would throw a NullPointerException, crashing this whole
            // endpoint with a 500. Guarding it here costs nothing and
            // prevents one bad row from breaking the entire dashboard.
            String type = activity.getActivityType() != null
                    ? activity.getActivityType().toLowerCase()
                    : "";

            switch (type) {

                case "transport":
                    transport += emission;
                    break;

                case "food":
                    food += emission;
                    break;

                case "energy":
                    energy += emission;
                    break;

                case "shopping":
                    shopping += emission;
                    break;

                case "digital":
                    digital += emission;
                    break;
            }
        }

        dashboard.setTotalEmission(total);
        dashboard.setTransportEmission(transport);
        dashboard.setFoodEmission(food);
        dashboard.setEnergyEmission(energy);
        dashboard.setShoppingEmission(shopping);
        dashboard.setDigitalEmission(digital);
        dashboard.setTotalActivities(activities.size());

        // NEW: these three come straight from the User entity, which already
        // tracks them - they just were never wired into the response before.
        dashboard.setTotalPoints(user.getPoints());
        dashboard.setCurrentStreak(user.getStreak());
        dashboard.setMonthlyGoal(user.getMonthlyGoal());

        return dashboard;
    }
}