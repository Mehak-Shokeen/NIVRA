package com.nivra.nivra.config;

import com.nivra.nivra.entity.User;
import com.nivra.nivra.repository.UserRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeUsers(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            // Create Authority user
            if (userRepository.findByEmail("authority@nivra.com").isEmpty()) {

                User authority = new User();

                authority.setName("Nivra Authority");
                authority.setEmail("authority@nivra.com");
                authority.setPassword(
                        passwordEncoder.encode("authority123")
                );
                authority.setRole("AUTHORITY");

                userRepository.save(authority);
            }

            // Create Worker user
            if (userRepository.findByEmail("worker@nivra.com").isEmpty()) {

                User worker = new User();

                worker.setName("Nivra Worker");
                worker.setEmail("worker@nivra.com");
                worker.setPassword(
                        passwordEncoder.encode("worker123")
                );
                worker.setRole("WORKER");

                userRepository.save(worker);
            }
        };
    }
}