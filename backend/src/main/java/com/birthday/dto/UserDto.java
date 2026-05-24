package com.birthday.dto;

import com.birthday.entity.User;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class UserDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateRequest {
        @NotBlank(message = "First name is required")
        @Size(max = 100) private String firstName;

        @NotBlank(message = "Last name is required")
        @Size(max = 100) private String lastName;

        @NotBlank @Email(message = "Valid email is required")
        private String email;

        @NotBlank @Size(min = 8, message = "Password must be at least 8 characters")
        private String password;

        @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number")
        private String phoneNumber;

        @NotNull(message = "Birthday is required")
        @Past(message = "Birthday must be in the past")
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate birthday;

        private String timezone;
        private String customMessage;
        private User.NotificationPreference notificationPreference;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class UpdateRequest {
        @Size(max = 100) private String firstName;
        @Size(max = 100) private String lastName;

        @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number")
        private String phoneNumber;

        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate birthday;

        private String timezone;
        private String customMessage;
        private User.NotificationPreference notificationPreference;
        private Boolean active;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private String firstName;
        private String lastName;
        private String email;
        private String phoneNumber;

        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate birthday;

        private String timezone;
        private String customMessage;
        private User.NotificationPreference notificationPreference;
        private User.Role role;
        private boolean active;
        private int age;
        private int daysUntilBirthday;
        private boolean isBirthdayToday;

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime createdAt;

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime lastWishedAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class LoginRequest {
        @NotBlank private String email;
        @NotBlank private String password;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AuthResponse {
        private String token;
        private String refreshToken;
        private String tokenType;
        private long expiresIn;
        private Response user;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DashboardStats {
        private long totalUsers;
        private long activeUsers;
        private int birthdaysToday;
        private int upcomingBirthdays;
        private long notificationsSent;
        private long notificationsFailed;
    }
}
