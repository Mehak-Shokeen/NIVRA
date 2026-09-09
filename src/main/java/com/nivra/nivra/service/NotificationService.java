package com.nivra.nivra.service;

import com.nivra.nivra.dto.NotificationResponseDTO;
import com.nivra.nivra.entity.Issue;
import com.nivra.nivra.entity.Notification;
import com.nivra.nivra.entity.User;
import com.nivra.nivra.exception.ResourceNotFoundException;
import com.nivra.nivra.repository.NotificationRepository;
import com.nivra.nivra.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(
            NotificationRepository notificationRepository,
            UserRepository userRepository) {

        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public void createNotification(
            User user,
            Issue issue,
            String message) {

        Notification notification = new Notification();

        notification.setUser(user);
        notification.setIssue(issue);
        notification.setMessage(message);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        notificationRepository.save(notification);
    }

    public List<NotificationResponseDTO> getUserNotifications(
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"));

        return notificationRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(notification ->
                        new NotificationResponseDTO(
                                notification.getId(),
                                notification.getMessage(),
                                notification.isRead(),
                                notification.getIssue() != null
                                        ? notification.getIssue().getId()
                                        : null,
                                notification.getCreatedAt()
                        ))
                .toList();
    }
}