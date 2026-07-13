package com.rachit.carbontracker.controller;

import com.rachit.carbontracker.dto.GoalUpdateRequestDTO;
import com.rachit.carbontracker.dto.UserResponseDTO;
import com.rachit.carbontracker.entity.User;
import com.rachit.carbontracker.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

// NEW controller: the frontend's "Update Goal" button was calling an
// endpoint that never existed on the backend. This adds it, plus a basic
// "get my profile" endpoint for completeness.
@RestController
@RequestMapping("/api/users")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/me")
    public UserResponseDTO getCurrentUser(Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();

        return toResponse(user);
    }

    @PatchMapping("/me/goal")
    public UserResponseDTO updateGoal(
            @Valid @RequestBody GoalUpdateRequestDTO request,
            Authentication authentication) {

        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();

        user.setMonthlyGoal(request.getMonthlyGoal());

        userRepository.save(user);

        return toResponse(user);
    }

    private UserResponseDTO toResponse(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPoints(),
                user.getStreak(),
                user.getMonthlyGoal()
        );
    }
}