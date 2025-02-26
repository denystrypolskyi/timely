package com.example.demo.repository;

import com.example.demo.model.Hours;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HoursRepository extends JpaRepository<Hours, Long> {
    List<Hours> findByUser(User user);
}
