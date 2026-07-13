package com.rachit.carbontracker.service;
import com.rachit.carbontracker.dto.LoginResponseDTO;
import com.rachit.carbontracker.Security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.crypto.password.PasswordEncoder;
import com.rachit.carbontracker.dto.LoginRequestDTO;
import com.rachit.carbontracker.dto.RegisterRequestDTO;
import com.rachit.carbontracker.dto.RegisterResponseDTO;
import com.rachit.carbontracker.entity.User;
import com.rachit.carbontracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtService jwtService;

    // Register User
    public RegisterResponseDTO register(RegisterRequestDTO request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return new RegisterResponseDTO(false, "Email already exists");
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        userRepository.save(user);

        return new RegisterResponseDTO(true, "User Registered Successfully");
    }

    // Login User
    public LoginResponseDTO login(LoginRequestDTO request) {

        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null) {
            return new LoginResponseDTO(false, "User not found", null);
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return new LoginResponseDTO(false, "Invalid Password", null);
        }

        String token = jwtService.generateToken(user.getEmail());

        return new LoginResponseDTO(true, "Login Successful", token);
    }
}