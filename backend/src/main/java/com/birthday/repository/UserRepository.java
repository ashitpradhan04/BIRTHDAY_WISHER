package com.birthday.repository;

import com.birthday.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByActiveTrue();

    // Find users whose birthday is today (matches month and day)
    @Query("""
        SELECT u FROM User u
        WHERE u.active = true
          AND FUNCTION('MONTH', u.birthday) = FUNCTION('MONTH', :today)
          AND FUNCTION('DAY', u.birthday)   = FUNCTION('DAY', :today)
        """)
    List<User> findUsersWithBirthdayOn(@Param("today") LocalDate today);

    // Find upcoming birthdays within N days
    @Query("""
        SELECT u FROM User u
        WHERE u.active = true
          AND (
            (FUNCTION('MONTH', u.birthday) = FUNCTION('MONTH', :from)
             AND FUNCTION('DAY', u.birthday) >= FUNCTION('DAY', :from))
          OR
            (FUNCTION('MONTH', u.birthday) = FUNCTION('MONTH', :to)
             AND FUNCTION('DAY', u.birthday) <= FUNCTION('DAY', :to))
          )
        ORDER BY FUNCTION('MONTH', u.birthday), FUNCTION('DAY', u.birthday)
        """)
    List<User> findUpcomingBirthdays(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT u FROM User u WHERE u.role = :role AND u.active = true")
    List<User> findByRole(@Param("role") User.Role role);

    @Query("SELECT COUNT(u) FROM User u WHERE u.active = true")
    long countActiveUsers();
}
