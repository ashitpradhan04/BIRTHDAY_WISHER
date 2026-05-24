package com.birthday.repository;

import com.birthday.entity.NotificationLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {

    Page<NotificationLog> findByUserIdOrderBySentAtDesc(Long userId, Pageable pageable);

    List<NotificationLog> findTop10ByOrderBySentAtDesc();

    @Query("""
        SELECT n FROM NotificationLog n
        WHERE n.sentAt >= :from
        ORDER BY n.sentAt DESC
        """)
    List<NotificationLog> findRecentLogs(@Param("from") LocalDateTime from);

    @Query("SELECT COUNT(n) FROM NotificationLog n WHERE n.status = 'SENT'")
    long countSuccessful();

    @Query("SELECT COUNT(n) FROM NotificationLog n WHERE n.status = 'FAILED'")
    long countFailed();
}
