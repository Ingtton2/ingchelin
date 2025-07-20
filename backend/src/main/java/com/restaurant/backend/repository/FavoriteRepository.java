package com.restaurant.backend.repository;

import com.restaurant.backend.entity.Favorite;
import com.restaurant.backend.entity.User;
import com.restaurant.backend.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUser(User user);
    Optional<Favorite> findByUserAndRestaurant(User user, Restaurant restaurant);
    boolean existsByUserAndRestaurant(User user, Restaurant restaurant);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM Favorite f WHERE f.user = :user AND f.restaurant = :restaurant")
    void deleteByUserAndRestaurant(@Param("user") User user, @Param("restaurant") Restaurant restaurant);
} 