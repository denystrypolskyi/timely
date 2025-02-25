package com.example.demo.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "stories")
public class Story {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "upload_date", nullable = false)
    private LocalDate uploadDate;

    @Column(name = "photo_url", nullable = false)
    private String photoUrl;

    private String caption;

    public Story() {
    }

    public Story(User user, LocalDate uploadDate, String photoUrl, String caption) {
        this.user = user;
        this.uploadDate = uploadDate;
        this.photoUrl = photoUrl;
        this.caption = caption;
    }

    public Long getId() {
        return id;
    }

    public long getUserId() {
        return user.getId();
    }

    public LocalDate getUploadDate() {
        return uploadDate;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getCaption() {
        return caption;
    }

    public void setCaption(String caption) {
        this.caption = caption;
    }

    public void setUploadDate(LocalDate uploadDate) {
        this.uploadDate = uploadDate;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
