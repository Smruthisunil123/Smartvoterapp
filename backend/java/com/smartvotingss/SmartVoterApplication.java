package com.smartvotingss;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SmartVoterApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartVoterApplication.class, args);
        System.out.println("✅ SmartVoter Application started successfully!");
    }
}
