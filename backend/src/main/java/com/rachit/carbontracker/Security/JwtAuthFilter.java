package com.rachit.carbontracker.Security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;

    public JwtAuthFilter(
            JwtService jwtService,
            CustomUserDetailsService customUserDetailsService) {

        this.jwtService = jwtService;
        this.customUserDetailsService = customUserDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        System.out.println("\n======================================");
        System.out.println("JWT FILTER EXECUTED");
        System.out.println("Request URI : " + request.getRequestURI());

        String authHeader = request.getHeader("Authorization");

        System.out.println("Authorization Header : " + authHeader);

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {

            System.out.println("Bearer Token Missing");

            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        System.out.println("Token : " + token);

        try {

            boolean valid = jwtService.validateToken(token);

            System.out.println("Token Valid : " + valid);

            if (!valid) {

                System.out.println("Token Invalid");

                filterChain.doFilter(request, response);
                return;
            }

            String email = jwtService.extractEmail(token);

            System.out.println("Email From Token : " + email);

            UserDetails userDetails =
                    customUserDetailsService.loadUserByUsername(email);

            System.out.println("User Loaded : " + userDetails.getUsername());

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities());

            authentication.setDetails(
                    new WebAuthenticationDetailsSource()
                            .buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(authentication);

            System.out.println("Authentication Successfully Set");

        } catch (Exception e) {

            System.out.println("JWT ERROR OCCURRED");
            e.printStackTrace();
        }

        filterChain.doFilter(request, response);

        System.out.println("JWT FILTER FINISHED");
        System.out.println("======================================\n");
    }
}