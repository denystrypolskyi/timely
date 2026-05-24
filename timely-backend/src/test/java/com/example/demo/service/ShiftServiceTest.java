package com.example.demo.service;

import com.example.demo.model.CustomUserDetails;
import com.example.demo.model.ShiftEntity;
import com.example.demo.model.UserEntity;
import com.example.demo.repository.ShiftRepository;
import com.example.demo.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.Instant;
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
        UserEntity user = userWithId(1L);
        CustomUserDetails principal = new CustomUserDetails(user);
        Instant start = Instant.parse("2026-05-24T08:00:00Z");
        Instant end = Instant.parse("2026-05-24T16:00:00Z");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(shiftRepository.save(any(ShiftEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ShiftEntity result = shiftService.createShift(principal, start, end);

        assertNotNull(result);
        assertEquals(user.getId(), result.getUser().getId());
        assertEquals(start, result.getShiftStart());
        assertEquals(end, result.getShiftEnd());
        verify(shiftRepository).save(any(ShiftEntity.class));
    }

    @Test
    void createShift_shouldThrowException_whenUserNotFound() {
        UserEntity user = userWithId(1L);
        CustomUserDetails principal = new CustomUserDetails(user);

        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () ->
                shiftService.createShift(
                        principal,
                        Instant.parse("2026-05-24T08:00:00Z"),
                        Instant.parse("2026-05-24T16:00:00Z")
                ));

        verify(shiftRepository, never()).save(any());
    }

    @Test
    void createShift_shouldThrowException_whenEndIsBeforeStart() {
        UserEntity user = userWithId(1L);
        CustomUserDetails principal = new CustomUserDetails(user);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        assertThrows(IllegalArgumentException.class, () ->
                shiftService.createShift(
                        principal,
                        Instant.parse("2026-05-24T16:00:00Z"),
                        Instant.parse("2026-05-24T08:00:00Z")
                ));

        verify(shiftRepository, never()).save(any());
    }

    @Test
    void deleteShift_shouldDeleteShiftOwnedByCurrentUser() {
        UserEntity user = userWithId(1L);
        CustomUserDetails principal = new CustomUserDetails(user);
        ShiftEntity shift = new ShiftEntity(
                user,
                Instant.parse("2026-05-24T08:00:00Z"),
                Instant.parse("2026-05-24T16:00:00Z")
        );

        when(shiftRepository.findById(10L)).thenReturn(Optional.of(shift));

        ShiftEntity result = shiftService.deleteShift(principal, 10L);

        assertSame(shift, result);
        verify(shiftRepository).delete(shift);
    }

    @Test
    void deleteShift_shouldRejectShiftOwnedByAnotherUser() {
        UserEntity currentUser = userWithId(1L);
        UserEntity otherUser = userWithId(2L);
        CustomUserDetails principal = new CustomUserDetails(currentUser);
        ShiftEntity shift = new ShiftEntity(
                otherUser,
                Instant.parse("2026-05-24T08:00:00Z"),
                Instant.parse("2026-05-24T16:00:00Z")
        );

        when(shiftRepository.findById(10L)).thenReturn(Optional.of(shift));

        assertThrows(AccessDeniedException.class, () -> shiftService.deleteShift(principal, 10L));
        verify(shiftRepository, never()).delete(any());
    }

    private UserEntity userWithId(Long id) {
        UserEntity user = new UserEntity();
        user.setId(id);
        return user;
    }
}
