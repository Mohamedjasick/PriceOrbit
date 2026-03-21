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

# Startup script that writes properties from env vars then launches the app
RUN echo '#!/bin/sh\n\
mkdir -p /app/config\n\
cat > /app/config/application.properties << EOF\n\
server.port=${PORT:-8080}\n\
spring.data.mongodb.uri=${MONGODB_URI}\n\
spring.data.mongodb.database=priceorbit\n\
jwt.secret=${JWT_SECRET}\n\
jwt.expiration=86400000\n\
cors.allowed.origins=${CORS_ORIGINS:-http://localhost:3000}\n\
spring.application.name=priceorbit\n\
EOF\n\
exec java -Dspring.config.location=optional:classpath:/,/app/config/ -jar /app/app.jar' > /app/start.sh

RUN chmod +x /app/start.sh

EXPOSE 8080
ENTRYPOINT ["/bin/sh", "/app/start.sh"]