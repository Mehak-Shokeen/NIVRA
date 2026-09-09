package com.nivra.nivra.dto;

import java.time.LocalDateTime;

public class CommentResponseDTO {

    private Long id;
    private String text;
    private Long userId;
    private String userName;
    private LocalDateTime createdAt;

    public CommentResponseDTO(
            Long id,
            String text,
            Long userId,
            String userName,
            LocalDateTime createdAt) {

        this.id = id;
        this.text = text;
        this.userId = userId;
        this.userName = userName;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getText() {
        return text;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUserName() {
        return userName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
