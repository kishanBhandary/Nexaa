package com.nexaa;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class NexaaBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(NexaaBackendApplication.class, args);
        System.out.println("🚀 Nexaa Backend Application started successfully!");
        System.out.println("📡 Server running on: http://localhost:8080/api");
        System.out.println("🔒 Authentication endpoints available at:");
        System.out.println("   • POST /api/auth/signup");
        System.out.println("   • POST /api/auth/signin");
    }
}
