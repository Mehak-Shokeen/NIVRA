package com.nivra.nivra.dto;

import java.time.LocalDateTime;

public class NotificationResponseDTO {

    private Long id;
    private String message;
    private boolean read;
    private Long issueId;
    private LocalDateTime createdAt;

    public NotificationResponseDTO(
            Long id,
            String message,
            boolean read,
            Long issueId,
            LocalDateTime createdAt) {

        this.id = id;
        this.message = message;
        this.read = read;
        this.issueId = issueId;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getMessage() {
        return message;
    }

    public boolean isRead() {
        return read;
    }

    public Long getIssueId() {
        return issueId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}