package com.birthday.service.impl;

import com.birthday.dto.UserDto;
import com.birthday.entity.User;
import com.birthday.exception.DuplicateResourceException;
import com.birthday.exception.ResourceNotFoundException;
import com.birthday.repository.NotificationLogRepository;
import com.birthday.repository.UserRepository;
import com.birthday.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final NotificationLogRepository notificationLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserDto.Response createUser(UserDto.CreateRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }
        User user = User.builder()
            .firstName(request.getFirstName())
            .lastName(request.getLastName())
            .email(request.getEmail())
            .password(passwordEncoder.encode(request.getPassword()))
            .phoneNumber(request.getPhoneNumber())
            .birthday(request.getBirthday())
            .timezone(request.getTimezone() != null ? request.getTimezone() : "UTC")
            .customMessage(request.getCustomMessage())
            .notificationPreference(request.getNotificationPreference() != null
                ? request.getNotificationPreference() : User.NotificationPreference.EMAIL)
            .build();
        return toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserDto.Response updateUser(Long id, UserDto.UpdateRequest request) {
        User user = findById(id);
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getBirthday() != null) user.setBirthday(request.getBirthday());
        if (request.getTimezone() != null) user.setTimezone(request.getTimezone());
        if (request.getCustomMessage() != null) user.setCustomMessage(request.getCustomMessage());
        if (request.getNotificationPreference() != null) user.setNotificationPreference(request.getNotificationPreference());
        if (request.getActive() != null) user.setActive(request.getActive());
        return toResponse(userRepository.save(user));
    }

    @Override
    public UserDto.Response getUserById(Long id) {
        return toResponse(findById(id));
    }

    @Override
    public UserDto.Response getUserByEmail(String email) {
        return toResponse(userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email)));
    }

    @Override
    public List<UserDto.Response> getAllUsers() {
        return userRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<UserDto.Response> getActiveUsers() {
        return userRepository.findByActiveTrue().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<UserDto.Response> getTodaysBirthdays() {
        return userRepository.findUsersWithBirthdayOn(LocalDate.now())
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public List<UserDto.Response> getUpcomingBirthdays(int days) {
        LocalDate from = LocalDate.now();
        LocalDate to = from.plusDays(days);
        return userRepository.findUpcomingBirthdays(from, to)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        User user = findById(id);
        user.setActive(false);
        userRepository.save(user);
    }

    @Override
    public UserDto.DashboardStats getDashboardStats() {
        return UserDto.DashboardStats.builder()
            .totalUsers(userRepository.count())
            .activeUsers(userRepository.countActiveUsers())
            .birthdaysToday(userRepository.findUsersWithBirthdayOn(LocalDate.now()).size())
            .upcomingBirthdays(userRepository.findUpcomingBirthdays(
                LocalDate.now(), LocalDate.now().plusDays(7)).size())
            .notificationsSent(notificationLogRepository.countSuccessful())
            .notificationsFailed(notificationLogRepository.countFailed())
            .build();
    }

    private User findById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    public UserDto.Response toResponse(User user) {
        LocalDate today = LocalDate.now();
        int age = Period.between(user.getBirthday(), today).getYears();
        int daysUntil = calculateDaysUntilBirthday(user.getBirthday(), today);
        boolean birthdayToday = user.getBirthday().getMonth() == today.getMonth()
            && user.getBirthday().getDayOfMonth() == today.getDayOfMonth();

        return UserDto.Response.builder()
            .id(user.getId())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .email(user.getEmail())
            .phoneNumber(user.getPhoneNumber())
            .birthday(user.getBirthday())
            .timezone(user.getTimezone())
            .customMessage(user.getCustomMessage())
            .notificationPreference(user.getNotificationPreference())
            .role(user.getRole())
            .active(user.isActive())
            .age(age)
            .daysUntilBirthday(daysUntil)
            .isBirthdayToday(birthdayToday)
            .createdAt(user.getCreatedAt())
            .lastWishedAt(user.getLastWishedAt())
            .build();
    }

    private int calculateDaysUntilBirthday(LocalDate birthday, LocalDate today) {
        LocalDate nextBirthday = birthday.withYear(today.getYear());
        if (!nextBirthday.isAfter(today)) {
            nextBirthday = nextBirthday.plusYears(1);
        }
        return (int) today.until(nextBirthday, java.time.temporal.ChronoUnit.DAYS);
    }
}
