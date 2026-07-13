package com.rachit.carbontracker.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

// Browsers enforce the Same-Origin Policy: JS running on http://127.0.0.1:5500
// is blocked by default from calling http://localhost:8080, even though both
// are "your" machine - the browser only looks at scheme+host+port. CORS is the
// server explicitly telling the browser "these specific origins are allowed to
// call me." Without this bean, every fetch() from your frontend fails with a
// CORS error in the console before the request even reaches your controllers.
@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Add whatever origin your frontend actually runs on.
        // Live Server in VS Code usually uses 127.0.0.1:5500 or localhost:5500 -
        // add BOTH since browsers treat them as different origins even though
        // they point to the same machine.
        config.setAllowedOrigins(List.of(
                "http://127.0.0.1:5500",
                "http://localhost:5500",
                "http://localhost:5173"   // common Vite dev server port, for later React move
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}