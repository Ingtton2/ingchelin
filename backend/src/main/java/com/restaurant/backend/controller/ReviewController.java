package com.restaurant.backend.controller;

import com.restaurant.backend.entity.Review;
import com.restaurant.backend.entity.User;
import com.restaurant.backend.entity.Restaurant;
import com.restaurant.backend.repository.ReviewRepository;
import com.restaurant.backend.repository.UserRepository;
import com.restaurant.backend.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewController {
    
    @Autowired
    private ReviewRepository reviewRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RestaurantRepository restaurantRepository;
    
    // 레스토랑의 리뷰 목록 조회
    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<Review>> getRestaurantReviews(@PathVariable Long restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId).orElse(null);
        if (restaurant == null) {
            return ResponseEntity.notFound().build();
        }
        List<Review> reviews = reviewRepository.findByRestaurant(restaurant);
        return ResponseEntity.ok(reviews);
    }
    
    // 사용자의 리뷰 목록 조회
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Review>> getUserReviews(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        List<Review> reviews = reviewRepository.findByUser(user);
        return ResponseEntity.ok(reviews);
    }
    
    // 리뷰 추가
    @PostMapping
    public ResponseEntity<Review> addReview(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        Long restaurantId = Long.valueOf(request.get("restaurantId").toString());
        Integer rating = Integer.valueOf(request.get("rating").toString());
        String comment = (String) request.get("comment");
        
        User user = userRepository.findById(userId).orElse(null);
        Restaurant restaurant = restaurantRepository.findById(restaurantId).orElse(null);
        
        if (user == null || restaurant == null) {
            return ResponseEntity.notFound().build();
        }
        
        Review review = new Review(user, restaurant, rating, comment);
        Review savedReview = reviewRepository.save(review);
        return ResponseEntity.ok(savedReview);
    }
    
    // 리뷰 수정
    @PutMapping("/{reviewId}")
    public ResponseEntity<Review> updateReview(@PathVariable Long reviewId, @RequestBody Map<String, Object> request) {
        Review review = reviewRepository.findById(reviewId).orElse(null);
        if (review == null) {
            return ResponseEntity.notFound().build();
        }
        
        Integer rating = Integer.valueOf(request.get("rating").toString());
        String comment = (String) request.get("comment");
        
        review.setRating(rating);
        review.setComment(comment);
        review.setUpdatedAt(LocalDateTime.now());
        
        Review updatedReview = reviewRepository.save(review);
        return ResponseEntity.ok(updatedReview);
    }
    
    // 리뷰 삭제
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable Long reviewId) {
        Review review = reviewRepository.findById(reviewId).orElse(null);
        if (review == null) {
            return ResponseEntity.notFound().build();
        }
        
        reviewRepository.delete(review);
        return ResponseEntity.ok().build();
    }
} 