package com.nivra.nivra.dto;

public class AuthResponseDTO {

    private String message;
    private Long userId;
    private String name;
    private String email;
    private String role;
    private String token;

    // Constructor for registration
    public AuthResponseDTO(
            String message,
            Long userId,
            String name,
            String email,
            String role) {

        this.message = message;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.token = null;
    }

    // Constructor for login
    public AuthResponseDTO(
            String message,
            Long userId,
            String name,
            String email,
            String role,
            String token) {

        this.message = message;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.role = role;
        this.token = token;
    }

    public String getMessage() {
        return message;
    }

    public Long getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    public String getToken() {
        return token;
    }
}