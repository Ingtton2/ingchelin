package com.restaurant.backend.repository;

import com.restaurant.backend.entity.Review;
import com.restaurant.backend.entity.User;
import com.restaurant.backend.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByUser(User user);
    List<Review> findByRestaurant(Restaurant restaurant);
    List<Review> findByUserAndRestaurant(User user, Restaurant restaurant);
} 