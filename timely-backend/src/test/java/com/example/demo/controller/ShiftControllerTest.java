package com.example.demo.controller;

import com.example.demo.dto.ShiftResponse;
import com.example.demo.dto.UpdateShiftRequest;
import com.example.demo.mapper.ShiftMapper;
import com.example.demo.model.CustomUserDetails;
import com.example.demo.model.ShiftEntity;
import com.example.demo.model.UserEntity;
import com.example.demo.service.ShiftService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.Instant;

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
}
