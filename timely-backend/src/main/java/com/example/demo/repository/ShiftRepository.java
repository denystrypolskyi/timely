package com.example.demo.repository;

import com.example.demo.model.ShiftEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

public interface ShiftRepository extends JpaRepository<ShiftEntity, Long> {

    List<ShiftEntity> findByUserId(Long userId);

    List<ShiftEntity> findByUserIdAndShiftStartGreaterThanEqualAndShiftStartLessThan(
            Long userId,
            Instant start,
            Instant end
    );

    @EntityGraph(attributePaths = "user")
    List<ShiftEntity> findWithUserByUserIdAndShiftStartGreaterThanEqualAndShiftStartLessThan(
            Long userId,
            Instant start,
            Instant end
    );
}
