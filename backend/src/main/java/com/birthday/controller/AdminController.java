package com.birthday.controller;

import com.birthday.dto.NotificationDto;
import com.birthday.entity.NotificationLog;
import com.birthday.repository.NotificationLogRepository;
import com.birthday.scheduler.BirthdayScheduler;
import com.birthday.service.NotificationService;
import com.birthday.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin", description = "Admin-only operations")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final BirthdayScheduler birthdayScheduler;
    private final NotificationLogRepository notificationLogRepository;
    private final UserService userService;
    private final NotificationService notificationService;

    @PostMapping("/scheduler/trigger")
    @Operation(summary = "Manually trigger birthday wishes for today or a specific date")
    public ResponseEntity<Map<String, Object>> triggerScheduler(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        int count = birthdayScheduler.triggerManualRun(targetDate);
        return ResponseEntity.ok(Map.of(
            "message", "Birthday wishes sent",
            "date", targetDate.toString(),
            "usersNotified", count
        ));
    }

    @PostMapping("/notifications/test/{userId}")
    @Operation(summary = "Send a test notification to a specific user")
    public ResponseEntity<Map<String, String>> sendTestNotification(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "EMAIL") NotificationLog.NotificationType type) {
        var userDto = userService.getUserById(userId);
        var userEntity = new com.birthday.entity.User();
        userEntity.setId(userDto.getId());
        userEntity.setFirstName(userDto.getFirstName());
        userEntity.setLastName(userDto.getLastName());
        userEntity.setEmail(userDto.getEmail());
        userEntity.setPhoneNumber(userDto.getPhoneNumber());
        userEntity.setBirthday(userDto.getBirthday());
        userEntity.setCustomMessage(userDto.getCustomMessage());
        userEntity.setNotificationPreference(userDto.getNotificationPreference());

        if (type == NotificationLog.NotificationType.EMAIL) {
            notificationService.sendBirthdayEmail(userEntity);
        } else {
            notificationService.sendBirthdaySms(userEntity);
        }
        return ResponseEntity.ok(Map.of("message", "Test notification sent to " + userDto.getEmail()));
    }

    @GetMapping("/notifications/logs")
    @Operation(summary = "Get recent notification logs")
    public ResponseEntity<List<NotificationDto.Response>> getNotificationLogs() {
        List<NotificationLog> logs = notificationLogRepository.findTop10ByOrderBySentAtDesc();
        List<NotificationDto.Response> response = logs.stream().map(log ->
            NotificationDto.Response.builder()
                .id(log.getId())
                .userId(log.getUser().getId())
                .userName(log.getUser().getFullName())
                .type(log.getType())
                .status(log.getStatus())
                .message(log.getMessage())
                .errorMessage(log.getErrorMessage())
                .recipient(log.getRecipient())
                .sentAt(log.getSentAt())
                .build()
        ).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }
}
