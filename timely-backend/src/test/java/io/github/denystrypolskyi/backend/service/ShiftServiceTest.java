package io.github.denystrypolskyi.backend.service;

import io.github.denystrypolskyi.backend.exception.ResourceNotFoundException;
import io.github.denystrypolskyi.backend.model.CustomUserDetails;
import io.github.denystrypolskyi.backend.model.ShiftEntity;
import io.github.denystrypolskyi.backend.model.UserEntity;
import io.github.denystrypolskyi.backend.repository.ShiftRepository;
import io.github.denystrypolskyi.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;

import java.time.Instant;
import java.time.ZoneId;
import java.time.YearMonth;
import java.util.List;
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
    void getAllShifts_shouldReturnPagedShifts() {
        UserEntity user = userWithId(1L);
        ShiftEntity shift = new ShiftEntity(
                user,
                Instant.parse("2026-05-24T08:00:00Z"),
                Instant.parse("2026-05-24T16:00:00Z")
        );
        Pageable pageable = PageRequest.of(0, 10);
        Page<ShiftEntity> page = new PageImpl<>(List.of(shift), pageable, 1);

        when(shiftRepository.findAll(pageable)).thenReturn(page);

        Page<ShiftEntity> result = shiftService.getAllShifts(pageable);

        assertEquals(1, result.getTotalElements());
        assertSame(shift, result.getContent().get(0));
        verify(shiftRepository).findAll(pageable);
    }

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

        assertThrows(ResourceNotFoundException.class, () ->
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
    void updateShift_shouldUpdateAndSaveShiftOwnedByCurrentUser() {
        UserEntity user = userWithId(1L);
        CustomUserDetails principal = new CustomUserDetails(user);
        ShiftEntity shift = new ShiftEntity(
                user,
                Instant.parse("2026-05-24T08:00:00Z"),
                Instant.parse("2026-05-24T16:00:00Z")
        );
        Instant updatedStart = Instant.parse("2026-05-25T09:00:00Z");
        Instant updatedEnd = Instant.parse("2026-05-25T17:00:00Z");

        when(shiftRepository.findById(10L)).thenReturn(Optional.of(shift));
        when(shiftRepository.save(shift)).thenReturn(shift);

        ShiftEntity result = shiftService.updateShift(principal, 10L, updatedStart, updatedEnd);

        assertSame(shift, result);
        assertEquals(updatedStart, result.getShiftStart());
        assertEquals(updatedEnd, result.getShiftEnd());
        verify(shiftRepository).save(shift);
    }

    @Test
    void updateShift_shouldRejectShiftOwnedByAnotherUser() {
        UserEntity currentUser = userWithId(1L);
        UserEntity otherUser = userWithId(2L);
        CustomUserDetails principal = new CustomUserDetails(currentUser);
        ShiftEntity shift = new ShiftEntity(
                otherUser,
                Instant.parse("2026-05-24T08:00:00Z"),
                Instant.parse("2026-05-24T16:00:00Z")
        );

        when(shiftRepository.findById(10L)).thenReturn(Optional.of(shift));

        assertThrows(AccessDeniedException.class, () -> shiftService.updateShift(
                principal,
                10L,
                Instant.parse("2026-05-25T09:00:00Z"),
                Instant.parse("2026-05-25T17:00:00Z")
        ));

        verify(shiftRepository, never()).save(any());
    }

    @Test
    void updateShift_shouldThrowNotFound_whenShiftDoesNotExist() {
        UserEntity user = userWithId(1L);
        CustomUserDetails principal = new CustomUserDetails(user);

        when(shiftRepository.findById(10L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> shiftService.updateShift(
                principal,
                10L,
                Instant.parse("2026-05-25T09:00:00Z"),
                Instant.parse("2026-05-25T17:00:00Z")
        ));

        verify(shiftRepository, never()).save(any());
    }

    @Test
    void updateShift_shouldRejectEndBeforeStart() {
        UserEntity user = userWithId(1L);
        CustomUserDetails principal = new CustomUserDetails(user);
        ShiftEntity shift = new ShiftEntity(
                user,
                Instant.parse("2026-05-24T08:00:00Z"),
                Instant.parse("2026-05-24T16:00:00Z")
        );

        when(shiftRepository.findById(10L)).thenReturn(Optional.of(shift));

        assertThrows(IllegalArgumentException.class, () -> shiftService.updateShift(
                principal,
                10L,
                Instant.parse("2026-05-25T17:00:00Z"),
                Instant.parse("2026-05-25T09:00:00Z")
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

    @Test
    void deleteShift_shouldThrowNotFound_whenShiftDoesNotExist() {
        UserEntity user = userWithId(1L);
        CustomUserDetails principal = new CustomUserDetails(user);

        when(shiftRepository.findById(10L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> shiftService.deleteShift(principal, 10L));
        verify(shiftRepository, never()).delete(any());
    }

    @Test
    void getShiftsByUserAndMonth_shouldUseUserTimeZoneAndOverlapBoundaries() {
        UserEntity user = userWithId(1L);
        user.setTimeZone("Europe/Budapest");
        ShiftEntity crossingStart = new ShiftEntity(
                user,
                Instant.parse("2026-02-28T22:00:00Z"),
                Instant.parse("2026-03-01T02:00:00Z")
        );
        ShiftEntity crossingEnd = new ShiftEntity(
                user,
                Instant.parse("2026-03-31T20:00:00Z"),
                Instant.parse("2026-03-31T23:00:00Z")
        );
        Instant monthStart = Instant.parse("2026-02-28T23:00:00Z");
        Instant monthEnd = Instant.parse("2026-03-31T22:00:00Z");

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(shiftRepository
                .findWithUserByUserIdAndShiftStartLessThanAndShiftEndGreaterThanOrderByShiftStartAsc(
                        1L, monthEnd, monthStart))
                .thenReturn(List.of(crossingStart, crossingEnd));

        ShiftService.MonthlyShifts result = shiftService.getShiftsByUserAndMonth(1L, 2026, 3);

        assertEquals(monthStart, result.monthStart());
        assertEquals(monthEnd, result.monthEnd());
        assertEquals(List.of(crossingStart, crossingEnd), result.shifts());
        assertEquals(180, shiftService.durationInRangeMinutes(crossingStart, monthStart, monthEnd));
        assertEquals(120, shiftService.durationInRangeMinutes(crossingEnd, monthStart, monthEnd));
    }

    @Test
    void durationInRangeMinutes_shouldExcludeShiftsTouchingOnlyTheBoundary() {
        UserEntity user = userWithId(1L);
        Instant monthStart = YearMonth.of(2026, 3).atDay(1).atStartOfDay(ZoneId.of("UTC")).toInstant();
        Instant monthEnd = YearMonth.of(2026, 4).atDay(1).atStartOfDay(ZoneId.of("UTC")).toInstant();
        ShiftEntity endingAtStart = new ShiftEntity(
                user, Instant.parse("2026-02-28T22:00:00Z"), monthStart);
        ShiftEntity startingAtEnd = new ShiftEntity(
                user, monthEnd, Instant.parse("2026-04-01T02:00:00Z"));

        assertEquals(0, shiftService.durationInRangeMinutes(endingAtStart, monthStart, monthEnd));
        assertEquals(0, shiftService.durationInRangeMinutes(startingAtEnd, monthStart, monthEnd));
    }

    private UserEntity userWithId(Long id) {
        UserEntity user = new UserEntity();
        user.setId(id);
        return user;
    }
}
