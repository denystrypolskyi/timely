package io.github.denystrypolskyi.backend.controller;

import java.util.List;

import io.github.denystrypolskyi.backend.dto.CreateShiftRequest;
import io.github.denystrypolskyi.backend.model.CustomUserDetails;
import io.github.denystrypolskyi.backend.model.ShiftEntity;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.github.denystrypolskyi.backend.dto.ShiftResponse;
import io.github.denystrypolskyi.backend.dto.UpdateShiftRequest;
import io.github.denystrypolskyi.backend.mapper.ShiftMapper;
import io.github.denystrypolskyi.backend.service.ShiftService;

@RestController
@RequestMapping("/api/shifts")
public class ShiftController {
    private final ShiftService shiftService;
    private final ShiftMapper shiftMapper;

    public ShiftController(ShiftService shiftService, ShiftMapper shiftMapper) {
        this.shiftService = shiftService;
        this.shiftMapper = shiftMapper;
    }

    @GetMapping()
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Page<ShiftResponse>> getAllShifts(Pageable pageable) {
        Page<ShiftResponse> shifts = shiftService.getAllShifts(pageable).map(shiftMapper::toDto);
        return ResponseEntity.ok(shifts);
    }

    @GetMapping("/user")
    public ResponseEntity<List<ShiftResponse>> getShiftsForCurrentUser(
            @AuthenticationPrincipal CustomUserDetails user) {
        List<ShiftEntity> shifts = shiftService.getShiftsByUser(user.getId());

        List<ShiftResponse> response = shifts.stream().map(shiftMapper::toDto).toList();

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<ShiftResponse> createShift(@AuthenticationPrincipal CustomUserDetails user,
            @RequestBody @Valid CreateShiftRequest request) {
        ShiftEntity shift = shiftService.createShift(user, request.shiftStart(), request.shiftEnd());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(shiftMapper.toDto(shift));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ShiftResponse> updateShift(@AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long id, @RequestBody @Valid UpdateShiftRequest request) {
        ShiftEntity updatedShift = shiftService.updateShift(user, id, request.shiftStart(), request.shiftEnd());

        return ResponseEntity.ok(shiftMapper.toDto(updatedShift));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShift(@AuthenticationPrincipal CustomUserDetails user, @PathVariable Long id) {
        shiftService.deleteShift(user, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/{year}/{month}")
    public ResponseEntity<List<ShiftResponse>> getUserShiftsForMonth(@AuthenticationPrincipal CustomUserDetails user,
            @PathVariable int year, @PathVariable int month) {
        List<ShiftEntity> shifts = shiftService.getShiftsByUserAndMonth(user.getId(), year, month);

        List<ShiftResponse> response = shifts.stream().map(shiftMapper::toDto).toList();

        return ResponseEntity.ok(response);
    }

}
