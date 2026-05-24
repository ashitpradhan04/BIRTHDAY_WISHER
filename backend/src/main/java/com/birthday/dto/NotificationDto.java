package com.birthday.dto;

import com.birthday.entity.NotificationLog;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDateTime;

public class NotificationDto {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private Long userId;
        private String userName;
        private NotificationLog.NotificationType type;
        private NotificationLog.NotificationStatus status;
        private String message;
        private String errorMessage;
        private String recipient;

        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        private LocalDateTime sentAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class TestRequest {
        private Long userId;
        private NotificationLog.NotificationType type;
    }
}
