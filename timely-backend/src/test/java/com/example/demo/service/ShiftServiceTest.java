package com.example.demo.service;

import com.example.demo.dto.CreateShiftRequest;
import com.example.demo.model.ShiftEntity;
import com.example.demo.model.UserEntity;
import com.example.demo.repository.ShiftRepository;
import com.example.demo.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShiftServiceTest {
    @Mock
    private ShiftRepository shiftRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ShiftService shiftService;

    @Test
    void createShift_shouldReturnSavedShift_whenInputIsValid() {
        UserEntity user = new UserEntity();
        user.setId(1L);
        LocalDateTime start = LocalDateTime.now();
        LocalDateTime end = start.plusHours(8);

        ShiftEntity shift = new ShiftEntity(user, start, end);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(shiftRepository.save(any(ShiftEntity.class))).thenReturn(shift);

        CreateShiftRequest newShift = new CreateShiftRequest(1L, start, end);

        ShiftEntity result = shiftService.createShift(newShift);

        assertNotNull(result);
        assertEquals(user.getId(), result.getUser().getId());

        verify(shiftRepository, times(1)).save(any(ShiftEntity.class));
    }

    @Test
    void createShift_shouldThrowException_whenUserNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        CreateShiftRequest request =
                new CreateShiftRequest(1L, LocalDateTime.now(), LocalDateTime.now().plusHours(8));

        assertThrows(RuntimeException.class, () -> shiftService.createShift(request));

        verify(shiftRepository, never()).save(any());
    }
}
