package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.dto.StoryDTO;
import com.example.demo.model.Story;
import com.example.demo.model.User;
import com.example.demo.repository.StoryRepository;
import com.example.demo.repository.UserRepository;

@Service
public class StoryService {
    private final StoryRepository storyRepository;
    private final UserRepository userRepository;

    @Autowired
    public StoryService(StoryRepository storyRepository, UserRepository userRepository) {
        this.storyRepository = storyRepository;
        this.userRepository = userRepository;
    }

    public List<Story> getStories() {
        return storyRepository.findAll();
    }

    public List<Story> getStoriesByUserId(Long userId) {
        return storyRepository.findByUser_Id(userId);
    }

    public Story createStory(StoryDTO storyDTO) {
        User user = userRepository.findById(storyDTO.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + storyDTO.getUserId()));

        Story story = new Story();
        story.setUser(user);
        story.setUploadDate(storyDTO.getUploadDate());
        story.setPhotoUrl(storyDTO.getPhotoUrl());
        story.setCaption(storyDTO.getCaption());

        return storyRepository.save(story);
    }
}
