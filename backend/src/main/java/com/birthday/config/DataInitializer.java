package com.birthday.config;

import com.birthday.entity.User;
import com.birthday.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("admin@birthday.com")) {
            String hashed = passwordEncoder.encode("Admin@123");
            log.info("Generated hash: {}", hashed); // confirm it starts with $2a$

            User admin = User.builder()
                .firstName("Admin")
                .lastName("User")
                .email("admin@birthday.com")
                .password(hashed)
                .phoneNumber("+1234567890")
                .birthday(LocalDate.of(1990, 1, 15))
                .timezone("Asia/Kolkata")
                .customMessage("Wishing you a wonderful birthday!")
                .notificationPreference(User.NotificationPreference.EMAIL)
                .role(User.Role.ADMIN)
                .active(true)
                .build();

            userRepository.save(admin);
            log.info("✅ Admin created: admin@birthday.com / Admin@123");
        } else {
            // Log existing user details for debugging
            userRepository.findByEmail("admin@birthday.com").ifPresent(u -> {
                log.info("Admin exists — active: {}, role: {}, hash prefix: {}",
                    u.isActive(), u.getRole(), u.getPassword().substring(0, 10));
            });
        }
    }
}