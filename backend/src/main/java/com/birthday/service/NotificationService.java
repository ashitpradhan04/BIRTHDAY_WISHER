package com.birthday.service;

import com.birthday.entity.User;

public interface NotificationService {
    void sendBirthdayWish(User user);
    void sendBirthdayEmail(User user);
    void sendBirthdaySms(User user);
}
