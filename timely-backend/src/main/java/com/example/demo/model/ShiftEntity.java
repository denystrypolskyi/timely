package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Getter;

import java.time.Duration;
import java.time.Instant;

import java.util.Objects;

@Getter
@Entity
@Table(name = "shifts")
public class ShiftEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(name = "shift_start", nullable = false)
    private Instant shiftStart;

    @Column(name = "shift_end", nullable = false)
    private Instant shiftEnd;

    @Column(name = "shift_duration_minutes", nullable = false)
    private Long shiftDurationMinutes;

    public ShiftEntity() {
    }

    public ShiftEntity(UserEntity user, Instant shiftStart, Instant shiftEnd) {
        this.user = Objects.requireNonNull(user, "User cannot be null");
        updateShiftTimes(shiftStart, shiftEnd);
    }

    public void updateShiftTimes(Instant shiftStart, Instant shiftEnd) {
        validateShiftTimes(shiftStart, shiftEnd);

        this.shiftStart = shiftStart;
        this.shiftEnd = shiftEnd;
    }

    private void validateShiftTimes(Instant start, Instant end) {
        Objects.requireNonNull(start, "Shift start cannot be null");
        Objects.requireNonNull(end, "Shift end cannot be null");

        if (end.isBefore(start)) {
            throw new IllegalArgumentException("Shift end cannot be earlier than shift start");
        }
    }

    @PrePersist
    @PreUpdate
    private void onPersistOrUpdate() {
        validateShiftTimes(shiftStart, shiftEnd);
        this.shiftDurationMinutes =
                Duration.between(shiftStart, shiftEnd).toMinutes();
    }
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ShiftEntity that)) return false;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
