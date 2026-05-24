package com.birthday.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification_logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationStatus status;

    @Column(length = 1000)
    private String message;

    @Column(length = 500)
    private String errorMessage;

    @Column(length = 200)
    private String recipient;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime sentAt;

    public enum NotificationType {
        EMAIL, SMS
    }

    public enum NotificationStatus {
        SENT, FAILED, SKIPPED
    }
}
