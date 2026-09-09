package com.nivra.nivra.controller;

import com.nivra.nivra.dto.NotificationResponseDTO;
import com.nivra.nivra.service.NotificationService;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(
            NotificationService notificationService) {

        this.notificationService = notificationService;
    }

    @GetMapping
    public List<NotificationResponseDTO> getNotifications(
            Authentication authentication) {

        return notificationService.getUserNotifications(
                authentication.getName()
        );
    }
}
