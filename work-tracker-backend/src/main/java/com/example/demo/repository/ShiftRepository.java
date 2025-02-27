package com.example.demo.repository;

import com.example.demo.model.Shift;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ShiftRepository extends JpaRepository<Shift, Long> {
    List<Shift> findByUser(User user);
    Optional<List<Shift>> findByUserIdAndShiftStartBetween(Long userId, LocalDateTime startDate, LocalDateTime endDate);
}
