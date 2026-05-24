package com.birthday.service.impl;

import com.birthday.entity.NotificationLog;
import com.birthday.entity.User;
import com.birthday.repository.NotificationLogRepository;
import com.birthday.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.time.LocalDate;
import java.time.Period;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final JavaMailSender mailSender;
    private final NotificationLogRepository logRepository;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${birthday.notification.email.enabled:true}")
    private boolean emailEnabled;

    @Value("${birthday.notification.sms.enabled:false}")
    private boolean smsEnabled;

    @Value("${twilio.enabled:false}")
    private boolean twilioEnabled;

    @Value("${twilio.account-sid:}")
    private String twilioAccountSid;

    @Value("${twilio.auth-token:}")
    private String twilioAuthToken;

    @Value("${twilio.phone-number:}")
    private String twilioPhoneNumber;

    @Override
    public void sendBirthdayWish(User user) {
        User.NotificationPreference pref = user.getNotificationPreference();
        if (pref == User.NotificationPreference.EMAIL || pref == User.NotificationPreference.BOTH) {
            sendBirthdayEmail(user);
        }
        if (pref == User.NotificationPreference.SMS || pref == User.NotificationPreference.BOTH) {
            sendBirthdaySms(user);
        }
    }

    @Override
    public void sendBirthdayEmail(User user) {
        if (!emailEnabled) {
            log.info("Email notifications are disabled. Skipping email for user: {}", user.getEmail());
            logNotification(user, NotificationLog.NotificationType.EMAIL,
                NotificationLog.NotificationStatus.SKIPPED, null, "Email disabled", user.getEmail());
            return;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("🎂 Happy Birthday, " + user.getFirstName() + "!");
            helper.setText(buildEmailBody(user), true);
            mailSender.send(message);
            log.info("Birthday email sent successfully to: {}", user.getEmail());
            logNotification(user, NotificationLog.NotificationType.EMAIL,
                NotificationLog.NotificationStatus.SENT,
                "Birthday email sent", null, user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send birthday email to {}: {}", user.getEmail(), e.getMessage());
            logNotification(user, NotificationLog.NotificationType.EMAIL,
                NotificationLog.NotificationStatus.FAILED,
                null, e.getMessage(), user.getEmail());
        }
    }

    @Override
    public void sendBirthdaySms(User user) {
        if (!smsEnabled || !twilioEnabled) {
            log.info("SMS notifications are disabled. Skipping SMS for user: {}", user.getPhoneNumber());
            if (user.getPhoneNumber() != null) {
                logNotification(user, NotificationLog.NotificationType.SMS,
                    NotificationLog.NotificationStatus.SKIPPED, null, "SMS disabled", user.getPhoneNumber());
            }
            return;
        }
        if (user.getPhoneNumber() == null || user.getPhoneNumber().isBlank()) {
            log.warn("No phone number for user: {}", user.getEmail());
            return;
        }
        try {
            // Twilio integration — uncomment and configure when Twilio is enabled
            /*
            com.twilio.Twilio.init(twilioAccountSid, twilioAuthToken);
            com.twilio.rest.api.v2010.account.Message.creator(
                new com.twilio.type.PhoneNumber(user.getPhoneNumber()),
                new com.twilio.type.PhoneNumber(twilioPhoneNumber),
                buildSmsBody(user)
            ).create();
            */
            log.info("SMS sent to {} (Twilio stub)", user.getPhoneNumber());
            logNotification(user, NotificationLog.NotificationType.SMS,
                NotificationLog.NotificationStatus.SENT,
                buildSmsBody(user), null, user.getPhoneNumber());
        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", user.getPhoneNumber(), e.getMessage());
            logNotification(user, NotificationLog.NotificationType.SMS,
                NotificationLog.NotificationStatus.FAILED,
                null, e.getMessage(), user.getPhoneNumber());
        }
    }

    private String buildEmailBody(User user) {
        int age = Period.between(user.getBirthday(), LocalDate.now()).getYears();
        String customMsg = user.getCustomMessage() != null && !user.getCustomMessage().isBlank()
            ? user.getCustomMessage()
            : "Wishing you a day filled with joy, laughter, and all your favorite things!";

        return """
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8f4ff; margin: 0; padding: 0; }
                .container { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 20px;
                             box-shadow: 0 4px 24px rgba(80,40,160,0.08); overflow: hidden; }
                .header { background: linear-gradient(135deg, #7c3aed 0%%, #a855f7 50%%, #ec4899 100%%);
                          padding: 48px 32px; text-align: center; }
                .header h1 { color: #fff; font-size: 32px; margin: 0 0 8px; font-weight: 700; }
                .header p { color: rgba(255,255,255,0.9); font-size: 18px; margin: 0; }
                .emoji { font-size: 64px; display: block; margin-bottom: 16px; }
                .body { padding: 32px; }
                .greeting { font-size: 22px; font-weight: 600; color: #1e1b4b; margin-bottom: 12px; }
                .age-badge { display: inline-block; background: #f3e8ff; color: #7c3aed; border-radius: 20px;
                             padding: 6px 16px; font-size: 15px; font-weight: 600; margin-bottom: 20px; }
                .message { color: #374151; font-size: 16px; line-height: 1.7; margin-bottom: 24px; }
                .custom { background: #fdf4ff; border-left: 4px solid #a855f7; padding: 16px 20px;
                          border-radius: 0 12px 12px 0; color: #6b21a8; font-style: italic; margin-bottom: 28px; }
                .footer { text-align: center; color: #9ca3af; font-size: 13px; padding: 24px;
                          border-top: 1px solid #f3f4f6; }
                .celebrate { font-size: 28px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <span class="emoji">🎂</span>
                  <h1>Happy Birthday!</h1>
                  <p>Today is your special day</p>
                </div>
                <div class="body">
                  <div class="greeting">Dear %s,</div>
                  <div class="age-badge">🎉 Turning %d today!</div>
                  <div class="message">%s</div>
                  <div class="custom">"%s"</div>
                  <p class="celebrate">🎈 🎊 🥳 🎁 🎀</p>
                </div>
                <div class="footer">
                  <p>Sent with ❤️ by Birthday Wisher Enterprise</p>
                </div>
              </div>
            </body>
            </html>
            """.formatted(
                user.getFirstName(),
                age,
                "May this birthday bring you closer to all your dreams and fill your day with wonderful memories.",
                customMsg
            );
    }

    private String buildSmsBody(User user) {
        int age = Period.between(user.getBirthday(), LocalDate.now()).getYears();
        return "🎂 Happy Birthday, %s! Wishing you an amazing %d%s birthday! 🎉".formatted(
            user.getFirstName(), age, getOrdinalSuffix(age));
    }

    private String getOrdinalSuffix(int n) {
        if (n >= 11 && n <= 13) return "th";
        return switch (n % 10) {
            case 1 -> "st";
            case 2 -> "nd";
            case 3 -> "rd";
            default -> "th";
        };
    }

    private void logNotification(User user, NotificationLog.NotificationType type,
                                  NotificationLog.NotificationStatus status,
                                  String message, String errorMessage, String recipient) {
        logRepository.save(NotificationLog.builder()
            .user(user)
            .type(type)
            .status(status)
            .message(message)
            .errorMessage(errorMessage)
            .recipient(recipient)
            .build());
    }
}
