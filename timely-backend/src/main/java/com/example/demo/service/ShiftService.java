package com.example.demo.service;

import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.CustomUserDetails;
import com.example.demo.model.ShiftEntity;
import com.example.demo.model.UserEntity;
import com.example.demo.repository.ShiftRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneId;
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

    public Page<ShiftEntity> getAllShifts(Pageable pageable) {
        Objects.requireNonNull(pageable, "Pageable must be provided");

        return shiftRepository.findAll(pageable);
    }

    public List<ShiftEntity> getShiftsByUser(Long userId) {
        Objects.requireNonNull(userId, "User ID must be provided");

        return shiftRepository.findByUserId(userId);
    }

    public ShiftEntity createShift(CustomUserDetails customUserDetails, Instant shiftStart, Instant shiftEnd) {
        Objects.requireNonNull(customUserDetails, "Authenticated user must be provided");
        Objects.requireNonNull(shiftStart, "Shift start must be provided");
        Objects.requireNonNull(shiftEnd, "Shift end must be provided");

        UserEntity user = userRepository.findById(customUserDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ShiftEntity shift = new ShiftEntity(user, shiftStart, shiftEnd);

        return shiftRepository.save(shift);
    }

    public ShiftEntity updateShift(
            CustomUserDetails currentUser,
            Long shiftId,
            Instant shiftStart,
            Instant shiftEnd) {
        Objects.requireNonNull(currentUser, "Authenticated user must be provided");
        Objects.requireNonNull(shiftId, "Shift ID must be provided");
        Objects.requireNonNull(shiftStart, "Shift start must be provided");
        Objects.requireNonNull(shiftEnd, "Shift end must be provided");

        ShiftEntity shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new ResourceNotFoundException("Shift not found"));

        if (!Objects.equals(shift.getUser().getId(), currentUser.getId())) {
            throw new AccessDeniedException("You can only update your own shifts");
        }

        shift.updateShiftTimes(shiftStart, shiftEnd);
        return shiftRepository.save(shift);
    }

    public ShiftEntity deleteShift(CustomUserDetails customUserDetails, Long id) {
        Objects.requireNonNull(customUserDetails, "Authenticated user must be provided");
        Objects.requireNonNull(id, "Shift ID must be provided");

        ShiftEntity shift = shiftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shift not found"));

        if (!Objects.equals(shift.getUser().getId(), customUserDetails.getId())) {
            throw new AccessDeniedException("You can only delete your own shifts");
        }

        shiftRepository.delete(shift);
        return shift;
    }

    public List<ShiftEntity> getShiftsByUserAndMonth(Long userId, int year, int month) {

        validateInputs(userId, year, month);

        YearMonth yearMonth = YearMonth.of(year, month);

        ZoneId zone = ZoneId.of("Europe/Warsaw"); // TODO: add timeZone field to UserEntity for per-user timezone
                                                  // support.

        Instant start = yearMonth
                .atDay(1)
                .atStartOfDay(zone)
                .toInstant();

        Instant end = yearMonth
                .plusMonths(1)
                .atDay(1)
                .atStartOfDay(zone)
                .toInstant();

        return shiftRepository
                .findWithUserByUserIdAndShiftStartGreaterThanEqualAndShiftStartLessThan(
                        userId, start, end);
    }

    private void validateInputs(Long userId, int year, int month) {

        Objects.requireNonNull(userId, "User ID must be provided");

        if (month < 1 || month > 12)
            throw new IllegalArgumentException("Month must be between 1 and 12");

        if (year < 1900 || year > 2100)
            throw new IllegalArgumentException("Year is out of valid range");
    }
}
