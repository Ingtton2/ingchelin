package com.restaurant.backend.config;

import com.restaurant.backend.entity.Restaurant;
import com.restaurant.backend.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private RestaurantRepository restaurantRepository;
    
    @Override
    public void run(String... args) throws Exception {
        // PostgreSQL에서는 스키마가 이미 생성되어 있다고 가정
        // 기존 데이터가 없을 때만 초기 데이터 추가
        if (restaurantRepository.count() == 0) {
            addSampleRestaurants();
        }
    }
    
    private void addSampleRestaurants() {
        Restaurant[] restaurants = {
            new Restaurant("맛있는 한식당", "서울시 강남구 테헤란로 123", "02-1234-5678", "한식", 4.5, "전통 한식의 맛을 느낄 수 있는 곳", 37.5665, 127.0080),
            new Restaurant("이탈리안 피자", "서울시 서초구 강남대로 456", "02-2345-6789", "이탈리안", 4.2, "정통 이탈리안 피자와 파스타", 37.5013, 127.0396),
            new Restaurant("스시 마스터", "서울시 강남구 논현로 789", "02-3456-7890", "일식", 4.8, "신선한 회와 정통 스시", 37.5270, 127.0276),
            new Restaurant("중국집", "서울시 강남구 삼성로 321", "02-4567-8901", "중식", 4.0, "정통 중국 요리의 맛", 37.5145, 127.0590),
            new Restaurant("스테이크 하우스", "서울시 강남구 영동대로 654", "02-5678-9012", "양식", 4.6, "프리미엄 스테이크와 와인", 37.5270, 127.0276),
            new Restaurant("베트남 쌀국수", "서울시 강남구 도산대로 987", "02-6789-0123", "베트남", 4.3, "신선한 쌀국수와 베트남 요리", 37.5270, 127.0276),
            new Restaurant("인도 커리", "서울시 강남구 압구정로 147", "02-7890-1234", "인도", 4.1, "정통 인도 커리와 난", 37.5270, 127.0276),
            new Restaurant("태국 음식점", "서울시 강남구 청담대로 258", "02-8901-2345", "태국", 4.4, "매콤달콤한 태국 요리", 37.5270, 127.0276),
            new Restaurant("멕시칸 타코", "서울시 강남구 선릉로 369", "02-9012-3456", "멕시칸", 4.0, "정통 멕시칸 타코와 테킬라", 37.5270, 127.0276),
            new Restaurant("프랑스 브라서리", "서울시 강남구 테헤란로 741", "02-0123-4567", "프랑스", 4.7, "정통 프랑스 요리와 와인", 37.5270, 127.0276)
        };
        
        for (Restaurant restaurant : restaurants) {
            restaurantRepository.save(restaurant);
        }
        
        System.out.println("Sample restaurants loaded successfully!");
    }
} 