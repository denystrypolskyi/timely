package com.example.demo.mapper;

import org.springframework.stereotype.Component;

import com.example.demo.dto.ShiftResponse;
import com.example.demo.model.ShiftEntity;

@Component
public class ShiftMapper {
    public ShiftResponse toDto(ShiftEntity entity) {
        return new ShiftResponse(entity.getId(), entity.getShiftDurationMinutes(), entity.getShiftStart(), entity.getShiftEnd(), entity.getUser().getId());
    }
}
