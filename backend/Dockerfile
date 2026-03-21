# Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Create application.properties from environment variables at runtime
RUN mkdir -p /app/config
RUN echo 'server.port=${PORT:8080}\n\
spring.data.mongodb.uri=${MONGODB_URI}\n\
spring.data.mongodb.database=priceorbit\n\
jwt.secret=${JWT_SECRET}\n\
jwt.expiration=86400000\n\
cors.allowed.origins=${CORS_ORIGINS:http://localhost:3000}\n\
spring.application.name=priceorbit' > /app/config/application.properties

EXPOSE 8080
ENTRYPOINT ["java", "-Dspring.config.location=classpath:/,/app/config/", "-Dserver.port=${PORT:-8080}", "-jar", "app.jar"]