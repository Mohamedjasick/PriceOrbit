package com.priceorbit;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// ✅ @SpringBootApplication = the magic annotation that starts everything
// It tells Spring Boot: "this is the main class, boot up from here"
@SpringBootApplication
public class PriceOrbitApplication {

    public static void main(String[] args) {
        // ✅ This single line starts your entire backend server
        SpringApplication.run(PriceOrbitApplication.class, args);
        System.out.println("🚀 PriceOrbit Backend is running at http://localhost:8080");
    }
}
