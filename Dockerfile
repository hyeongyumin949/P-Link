# 1단계: 빌드 스테이지
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# 빌드에 필요한 파일들만 먼저 복사 (캐싱 활용)
COPY gradlew .
COPY gradle gradle
COPY build.gradle .
COPY settings.gradle .
COPY src src

# gradlew 실행 권한 부여 및 빌드
RUN chmod +x ./gradlew
# plain.jar 생성 방지 및 순수 bootJar만 생성하도록 빌드
RUN ./gradlew bootJar --no-daemon

# 2단계: 실행 스테이지
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Railway는 PORT 환경 변수를 자동으로 주입해줍니다.
ENV PORT=8080
EXPOSE 8080

# 빌드된 결과물 중 진짜 실행 가능한 jar만 app.jar로 복사
# (이 부분이 "No such file" 에러를 해결하는 핵심입니다!)
COPY --from=builder /app/build/libs/*-SNAPSHOT.jar app.jar

# 애플리케이션 실행
# Railway가 준 PORT 번호를 Spring Boot에 전달합니다.
ENTRYPOINT ["java", "-jar", "app.jar"]