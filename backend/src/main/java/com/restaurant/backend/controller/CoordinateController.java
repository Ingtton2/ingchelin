package com.restaurant.backend.controller;

import com.restaurant.backend.service.CoordinateUpdateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coordinates")
@CrossOrigin(origins = "http://localhost:3000")
public class CoordinateController {

    @Autowired
    private CoordinateUpdateService coordinateUpdateService;

    @PostMapping("/update-all")
    public ResponseEntity<String> updateAllCoordinates() {
        try {
            coordinateUpdateService.updateAllRestaurantCoordinates();
            return ResponseEntity.ok("모든 식당의 좌표가 업데이트되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("좌표 업데이트 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @PostMapping("/update/{restaurantId}")
    public ResponseEntity<String> updateSingleRestaurantCoordinates(@PathVariable Long restaurantId) {
        try {
            coordinateUpdateService.updateSingleRestaurantCoordinates(restaurantId);
            return ResponseEntity.ok("식당 ID " + restaurantId + "의 좌표가 업데이트되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("좌표 업데이트 중 오류가 발생했습니다: " + e.getMessage());
        }
    }
} 