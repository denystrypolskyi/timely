package com.example.demo.service;

import com.example.demo.dto.CreateShiftRequest;
import com.example.demo.model.CustomUserDetails;
import com.example.demo.model.ShiftEntity;
import com.example.demo.model.UserEntity;
import com.example.demo.repository.ShiftRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Objects;

@Service
public class ShiftService {
    private final ShiftRepository shiftRepository;
    private final UserRepository userRepository;

    public ShiftService(ShiftRepository shiftRepository, UserRepository userRepository) {
        this.shiftRepository = shiftRepository;
        this.userRepository = userRepository;
    }

    public List<ShiftEntity> getAllShifts() {
        return shiftRepository.findAll();
    }

    public List<ShiftEntity> getShiftsByUser(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID must be provided");
        }

        return shiftRepository.findByUserId(userId);
    }

    public ShiftEntity createShift(CustomUserDetails customUserDetails, Instant shiftStart, Instant shiftEnd) {
        if (shiftEnd.isBefore(shiftStart)) {
            throw new IllegalArgumentException("Shift end must be after shift start");
        }

        UserEntity user = userRepository.findById(customUserDetails.getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ShiftEntity shift = new ShiftEntity(user, shiftStart, shiftEnd);

        return shiftRepository.save(shift);
    }

    public ShiftEntity deleteShift(Long id) {
        ShiftEntity shift = shiftRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Shift not found"));

        shiftRepository.delete(shift);
        return shift;
    }


    public List<ShiftEntity> getShiftsByUserAndMonth(Long userId, int year, int month) {

        validateInputs(userId, year, month);

        YearMonth yearMonth = YearMonth.of(year, month);

        LocalDateTime start = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime end = yearMonth.plusMonths(1).atDay(1).atStartOfDay();

        return shiftRepository.findWithUserByUserIdAndShiftStartGreaterThanEqualAndShiftStartLessThan(userId, start, end);
    }

    private void validateInputs(Long userId, int year, int month) {

        Objects.requireNonNull(userId, "User ID must be provided");

        if (month < 1 || month > 12)
            throw new IllegalArgumentException("Month must be between 1 and 12");

        if (year < 1900 || year > 2100)
            throw new IllegalArgumentException("Year is out of valid range");
    }
}
