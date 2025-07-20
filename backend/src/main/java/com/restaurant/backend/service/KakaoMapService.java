package com.restaurant.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;

@Service
public class KakaoMapService {

    @Value("${kakao.map.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> searchRestaurantLocation(String restaurantName, String address) {
        try {
            String searchQuery = restaurantName + " " + address;
            String encodedQuery = java.net.URLEncoder.encode(searchQuery, "UTF-8");
            
            String url = "https://dapi.kakao.com/v2/local/search/keyword.json?query=" + encodedQuery;
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + apiKey);
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            
            JsonNode root = objectMapper.readTree(response.getBody());
            
            Map<String, Object> result = new HashMap<>();
            
            if (root.has("documents") && root.get("documents").isArray() && root.get("documents").size() > 0) {
                JsonNode firstResult = root.get("documents").get(0);
                
                result.put("latitude", Double.parseDouble(firstResult.get("y").asText()));
                result.put("longitude", Double.parseDouble(firstResult.get("x").asText()));
                result.put("placeName", firstResult.get("place_name").asText());
                result.put("address", firstResult.get("address_name").asText());
                result.put("phone", firstResult.has("phone") ? firstResult.get("phone").asText() : "");
                result.put("placeUrl", firstResult.get("place_url").asText());
                
                return result;
            }
            
            return null;
            
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    public Map<String, Object> getCoordinatesFromAddress(String address) {
        try {
            String encodedAddress = java.net.URLEncoder.encode(address, "UTF-8");
            
            String url = "https://dapi.kakao.com/v2/local/search/address.json?query=" + encodedAddress;
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + apiKey);
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            
            JsonNode root = objectMapper.readTree(response.getBody());
            
            Map<String, Object> result = new HashMap<>();
            
            if (root.has("documents") && root.get("documents").isArray() && root.get("documents").size() > 0) {
                JsonNode firstResult = root.get("documents").get(0);
                
                result.put("latitude", Double.parseDouble(firstResult.get("y").asText()));
                result.put("longitude", Double.parseDouble(firstResult.get("x").asText()));
                result.put("address", firstResult.get("address_name").asText());
                
                return result;
            }
            
            return null;
            
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
} 