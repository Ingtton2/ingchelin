#!/bin/bash

# Maven 설치 및 Maven Wrapper 생성 스크립트

echo "🔧 Maven 설치 및 설정"
echo "====================="

# Homebrew 설치 확인
if ! command -v brew &> /dev/null; then
    echo "Homebrew가 설치되어 있지 않습니다."
    echo "Homebrew를 먼저 설치해주세요: https://brew.sh/"
    echo ""
    echo "또는 수동으로 Maven을 설치하세요:"
    echo "1. https://maven.apache.org/download.cgi 에서 Maven 다운로드"
    echo "2. 압축 해제 후 PATH에 추가"
    exit 1
fi

# Maven 설치
echo "Maven을 설치합니다..."
brew install maven

# Maven 버전 확인
echo "Maven 버전을 확인합니다..."
mvn -version

# Maven Wrapper 생성
echo "Maven Wrapper를 생성합니다..."
mvn -N wrapper:wrapper

echo "✅ Maven 설치 및 설정이 완료되었습니다!"
echo ""
echo "이제 다음 명령어로 Spring Boot 애플리케이션을 실행할 수 있습니다:"
echo "./mvnw spring-boot:run" 