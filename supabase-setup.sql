-- Supabase Database Setup for Restaurant Application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Disable Row Level Security for all tables (for development)
ALTER TABLE restaurants DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE visits DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    phone VARCHAR(50),
    cuisine VARCHAR(100),
    rating DECIMAL(3,2),
    description TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    parking BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id BIGINT REFERENCES restaurants(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, restaurant_id)
);

-- Create visits table
CREATE TABLE IF NOT EXISTS visits (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id BIGINT REFERENCES restaurants(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    restaurant_id BIGINT REFERENCES restaurants(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine ON restaurants(cuisine);
CREATE INDEX IF NOT EXISTS idx_restaurants_rating ON restaurants(rating);
CREATE INDEX IF NOT EXISTS idx_restaurants_location ON restaurants(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_restaurant_id ON favorites(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_visits_user_id ON visits(user_id);
CREATE INDEX IF NOT EXISTS idx_visits_restaurant_id ON visits(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_id ON reviews(restaurant_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_restaurants_updated_at 
    BEFORE UPDATE ON restaurants 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON reviews 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO restaurants (name, address, phone, cuisine, rating, description, latitude, longitude, parking) VALUES
('맛있는 한식당', '서울시 강남구 테헤란로 123', '02-1234-5678', '한식', 4.5, '전통 한식의 맛을 느낄 수 있는 곳', 37.5665, 127.0080, true),
('이탈리안 피자', '서울시 서초구 강남대로 456', '02-2345-6789', '이탈리안', 4.2, '정통 이탈리안 피자와 파스타', 37.5013, 127.0396, false),
('스시 마스터', '서울시 강남구 논현로 789', '02-3456-7890', '일식', 4.8, '신선한 회와 정통 스시', 37.5270, 127.0276, true),
('중국집', '서울시 강남구 삼성로 321', '02-4567-8901', '중식', 4.0, '정통 중국 요리의 맛', 37.5145, 127.0590, false),
('스테이크 하우스', '서울시 강남구 영동대로 654', '02-5678-9012', '양식', 4.6, '프리미엄 스테이크와 와인', 37.5270, 127.0276, true),
('베트남 쌀국수', '서울시 강남구 도산대로 987', '02-6789-0123', '베트남', 4.3, '신선한 쌀국수와 베트남 요리', 37.5270, 127.0276, false),
('인도 커리', '서울시 강남구 압구정로 147', '02-7890-1234', '인도', 4.1, '정통 인도 커리와 난', 37.5270, 127.0276, true),
('태국 음식점', '서울시 강남구 청담대로 258', '02-8901-2345', '태국', 4.4, '매콤달콤한 태국 요리', 37.5270, 127.0276, false),
('멕시칸 타코', '서울시 강남구 선릉로 369', '02-9012-3456', '멕시칸', 4.0, '정통 멕시칸 타코와 테킬라', 37.5270, 127.0276, true),
('프랑스 브라서리', '서울시 강남구 테헤란로 741', '02-0123-4567', '프랑스', 4.7, '정통 프랑스 요리와 와인', 37.5270, 127.0276, true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample users
INSERT INTO users (username, email, password) VALUES
('testuser', 'test@test.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa')
ON CONFLICT (email) DO NOTHING;

-- Insert sample categories
INSERT INTO categories (name) VALUES
('한식'), ('중식'), ('일식'), ('양식'), ('이탈리안'), ('베트남'), ('인도'), ('태국'), ('멕시칸'), ('프랑스')
ON CONFLICT (name) DO NOTHING; 