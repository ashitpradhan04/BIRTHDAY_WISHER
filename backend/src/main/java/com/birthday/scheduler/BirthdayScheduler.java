package com.birthday.scheduler;

import com.birthday.entity.User;
import com.birthday.repository.UserRepository;
import com.birthday.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class BirthdayScheduler {

    private final UserRepository userRepository;
    private final NotificationService notificationService;

    /**
     * Runs every day at 8:00 AM (configurable via application.yml).
     * Finds all active users whose birthday is today and sends them wishes.
     */
    @Scheduled(cron = "${birthday.scheduler.cron:0 0 8 * * *}",
               zone = "${birthday.scheduler.timezone:UTC}")
    @Transactional
    public void sendBirthdayWishes() {
        LocalDate today = LocalDate.now();
        log.info("==== Birthday Scheduler running for date: {} ====", today);

        List<User> birthdayUsers = userRepository.findUsersWithBirthdayOn(today);
        log.info("Found {} user(s) with birthday today", birthdayUsers.size());

        int successCount = 0;
        int failCount = 0;

        for (User user : birthdayUsers) {
            try {
                log.info("Sending birthday wish to: {} ({})", user.getFullName(), user.getEmail());
                notificationService.sendBirthdayWish(user);
                user.setLastWishedAt(LocalDateTime.now());
                userRepository.save(user);
                successCount++;
            } catch (Exception e) {
                log.error("Failed to send wish to user {}: {}", user.getId(), e.getMessage(), e);
                failCount++;
            }
        }

        log.info("==== Birthday Scheduler done. Success: {}, Failed: {} ====",
            successCount, failCount);
    }

    /**
     * Manual trigger: find birthday users for a given date and send wishes.
     * Used by admins via the REST API.
     */
    @Transactional
    public int triggerManualRun(LocalDate date) {
        log.info("Manual birthday run triggered for: {}", date);
        List<User> birthdayUsers = userRepository.findUsersWithBirthdayOn(date);
        for (User user : birthdayUsers) {
            notificationService.sendBirthdayWish(user);
            user.setLastWishedAt(LocalDateTime.now());
            userRepository.save(user);
        }
        return birthdayUsers.size();
    }
}
