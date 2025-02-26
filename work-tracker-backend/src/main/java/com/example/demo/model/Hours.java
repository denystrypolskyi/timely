package com.example.demo.model;

import jakarta.persistence.*;
import java.time.Duration;
import java.time.LocalDateTime;

@Entity
@Table(name = "hours")
public class Hours {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "shift_start", nullable = false)
    private LocalDateTime shiftStart;

    @Column(name = "shift_end", nullable = false)
    private LocalDateTime shiftEnd;

    @Column(name = "worked_hours")
    private Long workedHours;

    public Hours() {
    }

    public Hours(User user, LocalDateTime shiftStart, LocalDateTime shiftEnd) {
        this.user = user;
        this.shiftStart = shiftStart;
        this.shiftEnd = shiftEnd;
        this.workedHours = calculateWorkedHours();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDateTime getShiftStart() {
        return shiftStart;
    }

    public void setShiftStart(LocalDateTime shiftStart) {
        this.shiftStart = shiftStart;
    }

    public LocalDateTime getShiftEnd() {
        return shiftEnd;
    }

    public void setShiftEnd(LocalDateTime shiftEnd) {
        this.shiftEnd = shiftEnd;
        this.workedHours = calculateWorkedHours();
    }

    public Long getWorkedHours() {
        return workedHours;
    }

    private Long calculateWorkedHours() {
        if (shiftStart != null && shiftEnd != null) {
            return Duration.between(shiftStart, shiftEnd).toMinutes();
        }
        return null;
    }
}
