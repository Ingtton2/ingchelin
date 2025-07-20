#!/bin/bash

# Restaurant Backend 전체 설정 스크립트

echo "🍽️ Restaurant Backend Setup"
echo "=========================="

# 1. Maven 설치 및 설정
echo "1️⃣ Maven 설치 및 설정..."
if ! command -v mvn &> /dev/null; then
    echo "Maven이 설치되어 있지 않습니다. 설치를 진행합니다..."
    ./install-maven.sh
else
    echo "Maven이 이미 설치되어 있습니다."
fi

# 2. PostgreSQL 설정
echo ""
echo "2️⃣ PostgreSQL 설정..."
./setup-postgresql.sh

# 3. Maven Wrapper 생성 (Maven이 설치된 경우)
if command -v mvn &> /dev/null; then
    echo ""
    echo "3️⃣ Maven Wrapper 생성..."
    mvn -N wrapper:wrapper
    echo "✅ Maven Wrapper가 생성되었습니다."
fi

echo ""
echo "🎉 설정이 완료되었습니다!"
echo ""
echo "다음 단계:"
echo "1. PostgreSQL이 실행 중인지 확인: brew services list | grep postgresql"
echo "2. Spring Boot 애플리케이션 실행: ./mvnw spring-boot:run"
echo "3. 프론트엔드 실행: cd .. && npm start"
echo ""
echo "또는 Docker를 사용하려면:"
echo "docker-compose up -d"
echo "./mvnw spring-boot:run" 