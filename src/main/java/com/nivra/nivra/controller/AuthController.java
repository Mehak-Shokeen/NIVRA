package com.nivra.nivra.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nivra.nivra.dto.AuthResponseDTO;
import com.nivra.nivra.dto.LoginRequestDTO;
import com.nivra.nivra.dto.RegisterRequestDTO;
import com.nivra.nivra.entity.User;
import com.nivra.nivra.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponseDTO register(
            @Valid @RequestBody RegisterRequestDTO request) {

        User user = authService.register(request);

        return new AuthResponseDTO(
                "Registration successful",
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
    }

    @PostMapping("/login")
    public AuthResponseDTO login(
        @Valid @RequestBody LoginRequestDTO request) {
        return authService.login(request);
    }
}
