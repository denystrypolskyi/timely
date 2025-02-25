package com.example.demo.repository;

import com.example.demo.model.Story;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface StoryRepository extends JpaRepository<Story, Long> {
    List<Story> findByUser_Id(Long userId);
}
