package io.github.denystrypolskyi.backend.controller;

import io.github.denystrypolskyi.backend.dto.MonthlyShiftResponse;
import io.github.denystrypolskyi.backend.dto.ShiftResponse;
import io.github.denystrypolskyi.backend.dto.UpdateShiftRequest;
import io.github.denystrypolskyi.backend.mapper.ShiftMapper;
import io.github.denystrypolskyi.backend.model.CustomUserDetails;
import io.github.denystrypolskyi.backend.model.ShiftEntity;
import io.github.denystrypolskyi.backend.model.UserEntity;
import io.github.denystrypolskyi.backend.service.ShiftService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ShiftControllerTest {
    @Mock
    private ShiftService shiftService;

    @Mock
    private ShiftMapper shiftMapper;

    @InjectMocks
    private ShiftController shiftController;

    @Test
    void updateShift_shouldReturnMappedUpdatedShift() {
        UserEntity user = new UserEntity();
        user.setId(1L);
        CustomUserDetails principal = new CustomUserDetails(user);
        Instant start = Instant.parse("2026-05-25T09:00:00Z");
        Instant end = Instant.parse("2026-05-25T17:00:00Z");
        UpdateShiftRequest request = new UpdateShiftRequest(start, end);
        ShiftEntity updatedShift = new ShiftEntity(user, start, end);
        ShiftResponse response = new ShiftResponse(10L, 480L, start, end, 1L);

        when(shiftService.updateShift(principal, 10L, start, end)).thenReturn(updatedShift);
        when(shiftMapper.toDto(updatedShift)).thenReturn(response);

        ResponseEntity<ShiftResponse> result = shiftController.updateShift(principal, 10L, request);

        assertEquals(200, result.getStatusCode().value());
        assertSame(response, result.getBody());
        verify(shiftService).updateShift(principal, 10L, start, end);
        verify(shiftMapper).toDto(updatedShift);
    }

    @Test
    void getUserShiftsForMonth_shouldExposeFullAndInMonthDurations() {
        UserEntity user = new UserEntity();
        user.setId(1L);
        CustomUserDetails principal = new CustomUserDetails(user);
        Instant shiftStart = Instant.parse("2026-02-28T22:00:00Z");
        Instant shiftEnd = Instant.parse("2026-03-01T02:00:00Z");
        Instant monthStart = Instant.parse("2026-02-28T23:00:00Z");
        Instant monthEnd = Instant.parse("2026-03-31T22:00:00Z");
        ShiftEntity shift = new ShiftEntity(user, shiftStart, shiftEnd);
        ShiftResponse mappedShift = new ShiftResponse(10L, 240L, shiftStart, shiftEnd, 1L);
        ShiftService.MonthlyShifts monthlyShifts =
                new ShiftService.MonthlyShifts(List.of(shift), monthStart, monthEnd);

        when(shiftService.getShiftsByUserAndMonth(1L, 2026, 3)).thenReturn(monthlyShifts);
        when(shiftMapper.toDto(shift)).thenReturn(mappedShift);
        when(shiftService.durationInRangeMinutes(shift, monthStart, monthEnd)).thenReturn(180L);

        ResponseEntity<List<MonthlyShiftResponse>> result =
                shiftController.getUserShiftsForMonth(principal, 2026, 3);

        assertEquals(200, result.getStatusCode().value());
        assertEquals(1, result.getBody().size());
        assertEquals(240L, result.getBody().get(0).shiftDurationMinutes());
        assertEquals(180L, result.getBody().get(0).durationInRequestedMonthMinutes());
    }
}
