package io.github.denystrypolskyi.backend.service;

import io.github.denystrypolskyi.backend.model.RefreshSession;
import io.github.denystrypolskyi.backend.model.UserEntity;
import io.github.denystrypolskyi.backend.repository.RefreshSessionRepository;
import io.github.denystrypolskyi.backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {
    @Mock RefreshSessionRepository sessions;
    @Mock UserRepository users;

    @Test
    void rotationReplacesTokenAndReuseRevokesSession() {
        UserEntity user = new UserEntity();
        user.setId(7L);
        when(users.getReferenceById(7L)).thenReturn(user);
        when(sessions.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        RefreshTokenService service = new RefreshTokenService(sessions, users, 30);
        String first = service.create(7L).value();
        UUID id = UUID.fromString(first.substring(0, first.indexOf('.')));
        var captor = org.mockito.ArgumentCaptor.forClass(RefreshSession.class);
        verify(sessions).save(captor.capture());
        RefreshSession session = captor.getValue();
        when(sessions.findLocked(id)).thenReturn(Optional.of(session));

        var rotated = service.rotate(first).orElseThrow();
        assertEquals(7L, rotated.userId());
        assertNotEquals(first, rotated.value());
        assertTrue(service.rotate(first).isEmpty());
        verify(sessions).delete(session);
    }

    @Test
    void expiredOrMalformedTokenCannotRefresh() {
        RefreshTokenService service = new RefreshTokenService(sessions, users, 30);
        assertTrue(service.rotate("invalid").isEmpty());
        String token = UUID.randomUUID() + "." + "a".repeat(43);
        UserEntity user = new UserEntity();
        RefreshSession expired = new RefreshSession(UUID.fromString(token.substring(0, 36)),
                user, "unused", Instant.now().minusSeconds(1));
        when(sessions.findLocked(expired.getId())).thenReturn(Optional.of(expired));
        assertTrue(service.rotate(token).isEmpty());
        verify(sessions).delete(expired);
    }
}
