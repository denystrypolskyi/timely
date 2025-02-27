package com.example.demo.service;

import com.example.demo.model.Hours;
import com.example.demo.repository.HoursRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@Service
public class HoursService {
    private final HoursRepository hoursRepository;
    private final UserRepository userRepository;

    public HoursService(HoursRepository hoursRepository, UserRepository userRepository) {
        this.hoursRepository = hoursRepository;
        this.userRepository = userRepository;
    }

    public List<Hours> getAllHours() {
        return hoursRepository.findAll();
    }

    public Optional<List<Hours>> getHoursByUser(Long userId) {
        return userRepository.findById(userId).map(hoursRepository::findByUser);
    }

    public Optional<Hours> logWorkHours(Long userId, LocalDateTime shiftStart, LocalDateTime shiftEnd) {
        return userRepository.findById(userId).map(user -> {
            Hours hours = new Hours();
            hours.setUser(user);
            hours.setShiftStart(shiftStart);
            hours.setShiftEnd(shiftEnd);
            return hoursRepository.save(hours);
        });
    }

    public boolean deleteWorkHours(Long id) {
        if (hoursRepository.existsById(id)) {
            hoursRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Optional<List<Hours>> getHoursByUserAndMonth(Long userId, int year, int month) {
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDateTime startDate = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime endDate = yearMonth.atEndOfMonth().atTime(23, 59, 59);

        return hoursRepository.findByUserIdAndShiftStartBetween(userId, startDate, endDate);
    }
}
