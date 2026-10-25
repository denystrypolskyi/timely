package io.github.denystrypolskyi.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users", schema = "public")
@Getter
@Setter
@NoArgsConstructor
public class UserEntity {
    public static final String DEFAULT_TIME_ZONE = "Europe/Warsaw";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String username;

    @Column(unique = true)
    private String email;

    private String password;

    private String fullName;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(nullable = false, length = 63)
    private String timeZone = DEFAULT_TIME_ZONE;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = this.createdAt;

        if (this.timeZone == null) {
            this.timeZone = DEFAULT_TIME_ZONE;
        }

        if (this.role == null) {
            this.role = Role.USER;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
