package com.restaurant.backend.repository;

import com.restaurant.backend.entity.Visit;
import com.restaurant.backend.entity.User;
import com.restaurant.backend.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VisitRepository extends JpaRepository<Visit, Long> {
    List<Visit> findByUser(User user);
    List<Visit> findByRestaurant(Restaurant restaurant);
    List<Visit> findByUserAndRestaurant(User user, Restaurant restaurant);
} 