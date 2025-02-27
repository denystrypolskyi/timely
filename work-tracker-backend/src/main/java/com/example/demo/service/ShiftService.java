package com.example.demo.service;

import com.example.demo.model.Shift;
import com.example.demo.repository.ShiftRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@Service
public class ShiftService {
    private final ShiftRepository hoursRepository;
    private final UserRepository userRepository;

    public ShiftService(ShiftRepository hoursRepository, UserRepository userRepository) {
        this.hoursRepository = hoursRepository;
        this.userRepository = userRepository;
    }

    public List<Shift> getAllHours() {
        return hoursRepository.findAll();
    }

    public Optional<List<Shift>> getHoursByUser(Long userId) {
        return userRepository.findById(userId).map(hoursRepository::findByUser);
    }

    public Optional<Shift> createShift(Long userId, LocalDateTime shiftStart, LocalDateTime shiftEnd) {
        return userRepository.findById(userId).map(user -> {
            Shift hours = new Shift();
            hours.setUser(user);
            hours.setShiftStart(shiftStart);
            hours.setShiftEnd(shiftEnd);
            return hoursRepository.save(hours);
        });
    }

    public boolean deleteShift(Long id) {
        if (hoursRepository.existsById(id)) {
            hoursRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Optional<List<Shift>> getShiftsByUserAndMonth(Long userId, int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDateTime startDate = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime endDate = yearMonth.atEndOfMonth().atTime(23, 59, 59);

        return hoursRepository.findByUserIdAndShiftStartBetween(userId, startDate, endDate);
    }
}
