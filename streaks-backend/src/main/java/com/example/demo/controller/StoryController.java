package com.example.demo.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.StoryDTO;
import com.example.demo.model.Story;
import com.example.demo.service.StoryService;

@RestController
@RequestMapping("/api/stories")
public class StoryController {

    private final StoryService storyService;

    @Autowired
    public StoryController(StoryService storyService) {
        this.storyService = storyService;
    }

    @GetMapping("/")
    public List<Story> getStories() {
        return storyService.getStories();
    }
    
    @GetMapping("/{userId}")
    public List<Story> getStories(@PathVariable("userId") Long userId) {
        return storyService.getStoriesByUserId(userId);
    }

    @PostMapping("/")
    public Story createStory(@RequestBody StoryDTO storyDTO) {
        return storyService.createStory(storyDTO);
    }
}
