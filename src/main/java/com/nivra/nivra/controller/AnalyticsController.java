package com.nivra.nivra.controller;

import com.nivra.nivra.dto.AnalyticsResponseDTO;
import com.nivra.nivra.service.AnalyticsService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping
    public AnalyticsResponseDTO getAnalytics(Authentication authentication) {

        boolean allowed = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role ->
                        "ROLE_AUTHORITY".equals(role)
                                || "ROLE_ADMIN".equals(role)
                );

        if (!allowed) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only authorities and administrators can view analytics"
            );
        }

        return analyticsService.getAnalytics();
    }
}
