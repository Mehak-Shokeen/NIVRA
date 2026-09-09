package com.nivra.nivra.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.nivra.nivra.dto.RegisterRequestDTO;
import com.nivra.nivra.dto.LoginRequestDTO;
import com.nivra.nivra.dto.AuthResponseDTO;
import com.nivra.nivra.entity.User;
import com.nivra.nivra.repository.UserRepository;
import com.nivra.nivra.exception.ResourceNotFoundException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public User register(RegisterRequestDTO request) {

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());

        String hashedPassword =
                passwordEncoder.encode(request.getPassword());

        user.setPassword(hashedPassword);
        user.setRole("CITIZEN");

        return userRepository.save(user);
    }

    public AuthResponseDTO login(LoginRequestDTO request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Invalid email or password"));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtService.generateToken(user);

        return new AuthResponseDTO(
                "Login successful",
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                token
        );
    }
}