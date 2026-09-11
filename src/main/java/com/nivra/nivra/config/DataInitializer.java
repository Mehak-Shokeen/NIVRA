package com.nivra.nivra.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.nivra.nivra.entity.User;
import com.nivra.nivra.repository.UserRepository;

@Configuration
public class DataInitializer {
    @Bean
    CommandLineRunner initializeUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.findByEmail("admin@nivra.com").isEmpty()) {
                User admin = new User();
                admin.setName("Nivra Administrator");
                admin.setEmail("admin@nivra.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole("ADMIN");
                userRepository.save(admin);
            }
            if (userRepository.findByEmail("authority@nivra.com").isEmpty()) {
                User authority = new User();
                authority.setName("Nivra Authority");
                authority.setEmail("authority@nivra.com");
                authority.setPassword(passwordEncoder.encode("authority123"));
                authority.setRole("AUTHORITY");
                userRepository.save(authority);
            }
            if (userRepository.findByEmail("worker@nivra.com").isEmpty()) {
                User worker = new User();
                worker.setName("Nivra Worker");
                worker.setEmail("worker@nivra.com");
                worker.setPassword(passwordEncoder.encode("worker123"));
                worker.setRole("WORKER");
                userRepository.save(worker);
            }
        };
    }
}
