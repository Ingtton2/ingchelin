package com.restaurant.backend.repository;

import com.restaurant.backend.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
    
    List<Restaurant> findByCuisine(String cuisine);
    
    List<Restaurant> findByRatingGreaterThanEqual(Double rating);
    
    @Query("SELECT r FROM Restaurant r WHERE r.name LIKE %:keyword% OR r.description LIKE %:keyword% OR r.cuisine LIKE %:keyword%")
    List<Restaurant> searchByKeyword(@Param("keyword") String keyword);
    
    @Query("SELECT r FROM Restaurant r WHERE " +
           "SQRT(POWER(r.latitude - :lat, 2) + POWER(r.longitude - :lng, 2)) <= :radius")
    List<Restaurant> findNearby(@Param("lat") Double latitude, 
                                @Param("lng") Double longitude, 
                                @Param("radius") Double radius);
    
    // 중복 체크를 위한 메서드
    boolean existsByNameAndAddress(String name, String address);
} 