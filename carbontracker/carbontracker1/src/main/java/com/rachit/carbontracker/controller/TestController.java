package com.rachit.carbontracker.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    // Kept as a plain, unauthenticated sanity check that the app is up at all -
    // if this doesn't respond, the problem is deeper than JWT (app not running,
    // wrong port, etc).
    @GetMapping("/api/test")
    public String test() {
        return "JWT Authentication Working!";
    }

    // This one actually proves the JWT flow end-to-end: it requires a valid
    // Bearer token (assuming this path isn't in permitAll() in SecurityConfig),
    // and echoes back whichever email JwtAuthFilter resolved and placed into
    // the SecurityContext - so you can see the full chain (header -> token ->
    // email -> authenticated principal) worked, not just that you got a 200.
    @GetMapping("/api/test/whoami")
    public String whoAmI(Authentication authentication) {
        if (authentication == null) {
            return "No authenticated user found";
        }
        return "Authenticated as: " + authentication.getName();
    }
}