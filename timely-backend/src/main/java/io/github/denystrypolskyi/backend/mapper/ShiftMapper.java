package io.github.denystrypolskyi.backend.mapper;

import org.springframework.stereotype.Component;

import io.github.denystrypolskyi.backend.dto.ShiftResponse;
import io.github.denystrypolskyi.backend.model.ShiftEntity;

@Component
public class ShiftMapper {
    public ShiftResponse toDto(ShiftEntity entity) {
        return new ShiftResponse(entity.getId(), entity.getShiftDurationMinutes(), entity.getShiftStart(), entity.getShiftEnd(), entity.getUser().getId());
    }
}
