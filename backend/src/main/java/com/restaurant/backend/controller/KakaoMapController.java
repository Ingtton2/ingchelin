package com.restaurant.backend.controller;

import com.restaurant.backend.service.KakaoMapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/kakao")
@CrossOrigin(origins = "http://localhost:3000")
public class KakaoMapController {

    @Autowired
    private KakaoMapService kakaoMapService;

    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> searchRestaurant(
            @RequestParam String restaurantName,
            @RequestParam String address) {
        
        Map<String, Object> result = kakaoMapService.searchRestaurantLocation(restaurantName, address);
        
        if (result != null) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/coordinates")
    public ResponseEntity<Map<String, Object>> getCoordinates(@RequestParam String address) {
        
        Map<String, Object> result = kakaoMapService.getCoordinatesFromAddress(address);
        
        if (result != null) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
} 