package com.restaurant.backend.service;

import com.restaurant.backend.entity.Restaurant;
import com.restaurant.backend.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;

@Service
public class CoordinateUpdateService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private KakaoMapService kakaoMapService;

    @Value("${kakao.map.api.key}")
    private String kakaoApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void updateAllRestaurantCoordinates() {
        List<Restaurant> restaurants = restaurantRepository.findAll();
        
        for (Restaurant restaurant : restaurants) {
            // latitude가 null이거나 0인 경우에만 업데이트
            if (restaurant.getLatitude() == null || restaurant.getLatitude() == 0.0) {
                try {
                    updateRestaurantCoordinates(restaurant);
                    Thread.sleep(100); // API 호출 제한을 위한 딜레이
                } catch (Exception e) {
                    System.err.println("Failed to update coordinates for restaurant: " + restaurant.getName() + " - " + e.getMessage());
                }
            }
        }
    }

    private void updateRestaurantCoordinates(Restaurant restaurant) {
        try {
            String address = restaurant.getAddress();
            if (address == null || address.trim().isEmpty()) {
                return;
            }

            // 주소에서 시/구 정보 추출 (예: "서울 송파구" 또는 "경기 성남시 분당구")
            String simplifiedAddress = extractSimplifiedAddress(address);
            
            // 먼저 키워드 검색 시도 (식당명만 사용, 15자로 제한)
            String keywordQuery = restaurant.getName();
            if (keywordQuery.length() > 15) {
                keywordQuery = keywordQuery.substring(0, 15); // 15자로 제한
            }
            if (tryKeywordSearch(restaurant, keywordQuery)) {
                return;
            }
            
            // 키워드 검색 실패 시 주소 검색 시도
            if (tryAddressSearch(restaurant, address)) {
                return;
            }
            
            // 주소 검색도 실패 시 단순화된 주소로 검색
            if (tryAddressSearch(restaurant, simplifiedAddress)) {
                return;
            }
            
            // 마지막으로 지역명만으로 키워드 검색 시도
            String regionQuery = simplifiedAddress;
            if (regionQuery.length() > 15) {
                regionQuery = regionQuery.substring(0, 15);
            }
            tryKeywordSearch(restaurant, regionQuery);
            
        } catch (Exception e) {
            System.err.println("Error updating coordinates for " + restaurant.getName() + ": " + e.getMessage());
        }
    }
    
    private String extractSimplifiedAddress(String address) {
        // 주소에서 시/구 정보만 추출
        if (address.contains("서울")) {
            String[] parts = address.split(" ");
            for (int i = 0; i < parts.length; i++) {
                if (parts[i].equals("서울") && i + 1 < parts.length) {
                    return "서울 " + parts[i + 1];
                }
            }
        } else if (address.contains("경기")) {
            String[] parts = address.split(" ");
            for (int i = 0; i < parts.length; i++) {
                if (parts[i].equals("경기") && i + 1 < parts.length) {
                    return "경기 " + parts[i + 1];
                }
            }
        }
        return address;
    }
    
    private boolean tryKeywordSearch(Restaurant restaurant, String query) {
        try {
            String url = "https://dapi.kakao.com/v2/local/search/keyword.json?query=" + 
                        java.net.URLEncoder.encode(query, "UTF-8");
            
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("Authorization", "KakaoAK " + kakaoApiKey);
            
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);
            org.springframework.http.ResponseEntity<String> responseEntity = restTemplate.exchange(url, org.springframework.http.HttpMethod.GET, entity, String.class);
            String response = responseEntity.getBody();
            JsonNode root = objectMapper.readTree(response);
            
            if (root.has("documents") && root.get("documents").isArray() && 
                root.get("documents").size() > 0) {
                
                JsonNode firstResult = root.get("documents").get(0);
                double latitude = firstResult.get("y").asDouble();
                double longitude = firstResult.get("x").asDouble();
                
                restaurant.setLatitude(latitude);
                restaurant.setLongitude(longitude);
                restaurantRepository.save(restaurant);
                
                System.out.println("Updated coordinates (keyword search) for: " + restaurant.getName() + 
                                 " - Lat: " + latitude + ", Lng: " + longitude);
                return true;
            }
        } catch (Exception e) {
            System.err.println("Keyword search failed for " + restaurant.getName() + ": " + e.getMessage());
        }
        return false;
    }
    
    private boolean tryAddressSearch(Restaurant restaurant, String address) {
        try {
            String url = "https://dapi.kakao.com/v2/local/search/address.json?query=" + 
                        java.net.URLEncoder.encode(address, "UTF-8");
            
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("Authorization", "KakaoAK " + kakaoApiKey);
            
            org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);
            org.springframework.http.ResponseEntity<String> responseEntity = restTemplate.exchange(url, org.springframework.http.HttpMethod.GET, entity, String.class);
            String response = responseEntity.getBody();
            JsonNode root = objectMapper.readTree(response);
            
            if (root.has("documents") && root.get("documents").isArray() && 
                root.get("documents").size() > 0) {
                
                JsonNode firstResult = root.get("documents").get(0);
                double latitude = firstResult.get("y").asDouble();
                double longitude = firstResult.get("x").asDouble();
                
                restaurant.setLatitude(latitude);
                restaurant.setLongitude(longitude);
                restaurantRepository.save(restaurant);
                
                System.out.println("Updated coordinates (address search) for: " + restaurant.getName() + 
                                 " - Lat: " + latitude + ", Lng: " + longitude);
                return true;
            }
        } catch (Exception e) {
            System.err.println("Address search failed for " + restaurant.getName() + ": " + e.getMessage());
        }
        return false;
    }

    public void updateSingleRestaurantCoordinates(Long restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId).orElse(null);
        if (restaurant != null) {
            updateRestaurantCoordinates(restaurant);
        }
    }
} 