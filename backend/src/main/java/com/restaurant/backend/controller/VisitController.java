package com.restaurant.backend.controller;

import com.restaurant.backend.entity.Visit;
import com.restaurant.backend.entity.User;
import com.restaurant.backend.entity.Restaurant;
import com.restaurant.backend.repository.VisitRepository;
import com.restaurant.backend.repository.UserRepository;
import com.restaurant.backend.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/visits")
@CrossOrigin(origins = "http://localhost:3000")
public class VisitController {
    
    @Autowired
    private VisitRepository visitRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RestaurantRepository restaurantRepository;
    
    // 사용자의 방문 기록 조회
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Visit>> getUserVisits(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        List<Visit> visits = visitRepository.findByUser(user);
        return ResponseEntity.ok(visits);
    }
    
    // 레스토랑의 방문 기록 조회
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<Visit>> getRestaurantVisits(@PathVariable Long restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId).orElse(null);
        if (restaurant == null) {
            return ResponseEntity.notFound().build();
        }
        List<Visit> visits = visitRepository.findByRestaurant(restaurant);
        return ResponseEntity.ok(visits);
    }
    
    // 레스토랑별 방문 수 조회
    @GetMapping("/count/restaurant/{restaurantId}")
    public ResponseEntity<Long> getRestaurantVisitCount(@PathVariable Long restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId).orElse(null);
        if (restaurant == null) {
            return ResponseEntity.notFound().build();
        }
        Long visitCount = visitRepository.countByRestaurant(restaurant);
        return ResponseEntity.ok(visitCount);
    }
    
    // 모든 레스토랑의 방문 수 조회
    @GetMapping("/count/all")
    public ResponseEntity<Map<Long, Long>> getAllRestaurantVisitCounts() {
        List<Restaurant> restaurants = restaurantRepository.findAll();
        Map<Long, Long> visitCounts = new HashMap<>();
        
        for (Restaurant restaurant : restaurants) {
            Long visitCount = visitRepository.countByRestaurant(restaurant);
            visitCounts.put(restaurant.getId(), visitCount);
        }
        
        return ResponseEntity.ok(visitCounts);
    }
    
    // 방문 기록 추가
    @PostMapping
    public ResponseEntity<Visit> addVisit(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        Long restaurantId = Long.valueOf(request.get("restaurantId").toString());
        Integer rating = request.get("rating") != null ? Integer.valueOf(request.get("rating").toString()) : null;
        String review = (String) request.get("review");
        
        User user = userRepository.findById(userId).orElse(null);
        Restaurant restaurant = restaurantRepository.findById(restaurantId).orElse(null);
        
        if (user == null || restaurant == null) {
            return ResponseEntity.notFound().build();
        }
        
        LocalDateTime visitDate = LocalDateTime.now();
        Visit visit = new Visit(user, restaurant, visitDate, rating, review);
        Visit savedVisit = visitRepository.save(visit);
        return ResponseEntity.ok(savedVisit);
    }
} 