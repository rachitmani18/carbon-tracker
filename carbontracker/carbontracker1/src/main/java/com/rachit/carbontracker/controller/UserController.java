package com.rachit.carbontracker.controller;

import com.rachit.carbontracker.dto.LoginResponseDTO;
import com.rachit.carbontracker.dto.LoginRequestDTO;
import com.rachit.carbontracker.dto.RegisterRequestDTO;
import com.rachit.carbontracker.dto.RegisterResponseDTO;
import com.rachit.carbontracker.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

// @CrossOrigin(origins = "*") removed - see the comment in ActivityController
// for why. CorsConfig.java is now the single source of truth for CORS.
@RestController
@RequestMapping("/api/auth")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public RegisterResponseDTO register(@Valid @RequestBody RegisterRequestDTO request) {
        return userService.register(request);
    }

    @PostMapping("/login")
    public LoginResponseDTO login(@Valid @RequestBody LoginRequestDTO request) {
        return userService.login(request);
    }
}