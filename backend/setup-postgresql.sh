#!/bin/bash

# PostgreSQL 설치 및 설정 스크립트

echo "🍽️ Restaurant Backend PostgreSQL Setup"
echo "======================================"

# PostgreSQL 설치 확인
if ! command -v psql &> /dev/null; then
    echo "PostgreSQL이 설치되어 있지 않습니다."
    echo "Homebrew를 통해 PostgreSQL을 설치합니다..."
    
    # Homebrew 설치 확인
    if ! command -v brew &> /dev/null; then
        echo "Homebrew가 설치되어 있지 않습니다."
        echo "Homebrew를 먼저 설치해주세요: https://brew.sh/"
        exit 1
    fi
    
    # PostgreSQL 설치
    brew install postgresql@14
    
    # PostgreSQL 서비스 시작
    brew services start postgresql@14
    
    echo "PostgreSQL이 설치되었습니다."
else
    echo "PostgreSQL이 이미 설치되어 있습니다."
fi

# 데이터베이스 생성
echo "데이터베이스를 생성합니다..."
psql -U postgres -c "CREATE DATABASE restaurantdb;" 2>/dev/null || echo "데이터베이스가 이미 존재합니다."

# 사용자 생성 (필요한 경우)
echo "사용자를 생성합니다..."
psql -U postgres -c "CREATE USER postgres WITH PASSWORD 'password';" 2>/dev/null || echo "사용자가 이미 존재합니다."

# 권한 부여
echo "권한을 부여합니다..."
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE restaurantdb TO postgres;" 2>/dev/null || echo "권한이 이미 설정되어 있습니다."

echo "✅ PostgreSQL 설정이 완료되었습니다!"
echo ""
echo "다음 명령어로 Spring Boot 애플리케이션을 실행하세요:"
echo "cd backend && ./mvnw spring-boot:run"
echo ""
echo "또는 Maven이 설치되어 있지 않다면:"
echo "brew install maven"
echo "mvn spring-boot:run" 