package com.example.demo.repository;

import com.example.demo.model.Hours;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface HoursRepository extends JpaRepository<Hours, Long> {
    List<Hours> findByUser(User user);
    Optional<List<Hours>> findByUserIdAndShiftStartBetween(Long userId, LocalDateTime startDate, LocalDateTime endDate);
}
