package com.rachit.carbontracker.controller;

import com.rachit.carbontracker.dto.ActivityItemDTO;
import com.rachit.carbontracker.dto.DashboardResponseDTO;
import java.util.List;
import com.rachit.carbontracker.dto.ActivityRequestDTO;
import com.rachit.carbontracker.dto.ActivityResponseDTO;
import com.rachit.carbontracker.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/activity")
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    // FIX: return type changed from List<Activity> to List<ActivityItemDTO> -
    // see the comment in ActivityService.getMyActivities for why returning
    // the raw entity was a security leak (exposed the password hash).
    @GetMapping("/my")
    public List<ActivityItemDTO> getMyActivities(Authentication authentication) {

        return activityService.getMyActivities(authentication);
    }

    @GetMapping("/dashboard")
    public DashboardResponseDTO getDashboard(Authentication authentication) {

        return activityService.getDashboard(authentication);
    }

    @PostMapping("/add")
    public ActivityResponseDTO addActivity(
            @RequestBody ActivityRequestDTO request,
            Authentication authentication) {

        return activityService.saveActivity(request, authentication);
    }
}