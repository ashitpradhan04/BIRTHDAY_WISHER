package com.birthday.service;

import com.birthday.dto.UserDto;
import java.util.List;

public interface UserService {
    UserDto.Response createUser(UserDto.CreateRequest request);
    UserDto.Response updateUser(Long id, UserDto.UpdateRequest request);
    UserDto.Response getUserById(Long id);
    UserDto.Response getUserByEmail(String email);
    List<UserDto.Response> getAllUsers();
    List<UserDto.Response> getActiveUsers();
    List<UserDto.Response> getTodaysBirthdays();
    List<UserDto.Response> getUpcomingBirthdays(int days);
    void deleteUser(Long id);
    UserDto.DashboardStats getDashboardStats();
}
