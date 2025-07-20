-- PostgreSQL Database Schema for Restaurant Application

-- Create database if not exists (run this manually)
-- CREATE DATABASE restaurantdb;

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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine ON restaurants(cuisine);
CREATE INDEX IF NOT EXISTS idx_restaurants_rating ON restaurants(rating);
CREATE INDEX IF NOT EXISTS idx_restaurants_location ON restaurants(latitude, longitude);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_restaurants_updated_at 
    BEFORE UPDATE ON restaurants 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 