package com.restaurant.backend.controller;

import com.restaurant.backend.entity.Restaurant;
import com.restaurant.backend.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin(origins = "http://localhost:3000")
public class RestaurantController {
    
    @Autowired
    private RestaurantRepository restaurantRepository;
    
    // 모든 레스토랑 조회
    @GetMapping
    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }
    
    // ID로 레스토랑 조회
    @GetMapping("/{id}")
    public ResponseEntity<Restaurant> getRestaurantById(@PathVariable Long id) {
        Optional<Restaurant> restaurant = restaurantRepository.findById(id);
        return restaurant.map(ResponseEntity::ok)
                       .orElse(ResponseEntity.notFound().build());
    }
    
    // 새 레스토랑 추가
    @PostMapping
    public Restaurant createRestaurant(@RequestBody Restaurant restaurant) {
        return restaurantRepository.save(restaurant);
    }
    
    // 레스토랑 정보 수정
    @PutMapping("/{id}")
    public ResponseEntity<Restaurant> updateRestaurant(@PathVariable Long id, @RequestBody Restaurant restaurantDetails) {
        Optional<Restaurant> restaurant = restaurantRepository.findById(id);
        if (restaurant.isPresent()) {
            Restaurant updatedRestaurant = restaurant.get();
            updatedRestaurant.setName(restaurantDetails.getName());
            updatedRestaurant.setAddress(restaurantDetails.getAddress());
            updatedRestaurant.setPhone(restaurantDetails.getPhone());
            updatedRestaurant.setCuisine(restaurantDetails.getCuisine());
            updatedRestaurant.setRating(restaurantDetails.getRating());
            updatedRestaurant.setDescription(restaurantDetails.getDescription());
            updatedRestaurant.setLatitude(restaurantDetails.getLatitude());
            updatedRestaurant.setLongitude(restaurantDetails.getLongitude());
            
            Restaurant savedRestaurant = restaurantRepository.save(updatedRestaurant);
            return ResponseEntity.ok(savedRestaurant);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // 레스토랑 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRestaurant(@PathVariable Long id) {
        Optional<Restaurant> restaurant = restaurantRepository.findById(id);
        if (restaurant.isPresent()) {
            restaurantRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    // 요리 타입으로 검색
    @GetMapping("/cuisine/{cuisine}")
    public List<Restaurant> getRestaurantsByCuisine(@PathVariable String cuisine) {
        return restaurantRepository.findByCuisine(cuisine);
    }
    
    // 평점으로 검색
    @GetMapping("/rating/{rating}")
    public List<Restaurant> getRestaurantsByRating(@PathVariable Double rating) {
        return restaurantRepository.findByRatingGreaterThanEqual(rating);
    }
    
    // 키워드로 검색
    @GetMapping("/search")
    public List<Restaurant> searchRestaurants(@RequestParam String keyword) {
        return restaurantRepository.searchByKeyword(keyword);
    }
    
    // 근처 레스토랑 검색
    @GetMapping("/nearby")
    public List<Restaurant> getNearbyRestaurants(@RequestParam Double lat, 
                                                @RequestParam Double lng, 
                                                @RequestParam(defaultValue = "0.01") Double radius) {
        return restaurantRepository.findNearby(lat, lng, radius);
    }
    
    // 랜덤 레스토랑 추천
    @GetMapping("/random")
    public ResponseEntity<Restaurant> getRandomRestaurant() {
        List<Restaurant> allRestaurants = restaurantRepository.findAll();
        if (allRestaurants.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        int randomIndex = (int) (Math.random() * allRestaurants.size());
        return ResponseEntity.ok(allRestaurants.get(randomIndex));
    }
} 