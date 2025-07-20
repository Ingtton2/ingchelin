package com.restaurant.backend.controller;

import com.restaurant.backend.entity.Favorite;
import com.restaurant.backend.entity.User;
import com.restaurant.backend.entity.Restaurant;
import com.restaurant.backend.repository.FavoriteRepository;
import com.restaurant.backend.repository.UserRepository;
import com.restaurant.backend.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = "http://localhost:3000")
public class FavoriteController {
    
    @Autowired
    private FavoriteRepository favoriteRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RestaurantRepository restaurantRepository;
    
    // 사용자의 즐겨찾기 목록 조회
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Favorite>> getUserFavorites(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        List<Favorite> favorites = favoriteRepository.findByUser(user);
        return ResponseEntity.ok(favorites);
    }
    
    // 즐겨찾기 추가
    @PostMapping
    public ResponseEntity<Favorite> addFavorite(@RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");
        Long restaurantId = request.get("restaurantId");
        
        User user = userRepository.findById(userId).orElse(null);
        Restaurant restaurant = restaurantRepository.findById(restaurantId).orElse(null);
        
        if (user == null || restaurant == null) {
            return ResponseEntity.notFound().build();
        }
        
        if (favoriteRepository.existsByUserAndRestaurant(user, restaurant)) {
            return ResponseEntity.badRequest().build();
        }
        
        Favorite favorite = new Favorite(user, restaurant);
        Favorite savedFavorite = favoriteRepository.save(favorite);
        return ResponseEntity.ok(savedFavorite);
    }
    
    // 즐겨찾기 삭제
    @DeleteMapping("/user/{userId}/restaurant/{restaurantId}")
    public ResponseEntity<?> removeFavorite(@PathVariable Long userId, @PathVariable Long restaurantId) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            Restaurant restaurant = restaurantRepository.findById(restaurantId).orElse(null);
            
            if (user == null || restaurant == null) {
                return ResponseEntity.notFound().build();
            }
            
            // 먼저 즐겨찾기가 존재하는지 확인
            if (!favoriteRepository.existsByUserAndRestaurant(user, restaurant)) {
                return ResponseEntity.notFound().build();
            }
            
            // 즐겨찾기 삭제
            favoriteRepository.deleteByUserAndRestaurant(user, restaurant);
            
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("즐겨찾기 삭제 중 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // 즐겨찾기 확인
    @GetMapping("/user/{userId}/restaurant/{restaurantId}")
    public ResponseEntity<Boolean> isFavorite(@PathVariable Long userId, @PathVariable Long restaurantId) {
        User user = userRepository.findById(userId).orElse(null);
        Restaurant restaurant = restaurantRepository.findById(restaurantId).orElse(null);
        
        if (user == null || restaurant == null) {
            return ResponseEntity.notFound().build();
        }
        
        boolean isFavorite = favoriteRepository.existsByUserAndRestaurant(user, restaurant);
        return ResponseEntity.ok(isFavorite);
    }
} 