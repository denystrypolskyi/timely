package io.github.denystrypolskyi.backend.repository;

import io.github.denystrypolskyi.backend.model.ShiftEntity;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface ShiftRepository extends JpaRepository<ShiftEntity, Long> {

    List<ShiftEntity> findByUserId(Long userId);

    @EntityGraph(attributePaths = "user")
    List<ShiftEntity> findWithUserByUserIdAndShiftStartLessThanAndShiftEndGreaterThanOrderByShiftStartAsc(
            Long userId,
            Instant end,
            Instant start
    );
}
