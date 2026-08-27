package com.heatsafe;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.File;
import java.util.Locale;

@SpringBootApplication
public class HeatSafeApplication {
    public static void main(String[] args) {
        // Enforce English US locale globally for consistent numbers and time formats
        Locale.setDefault(Locale.US);

        // Load .env from current directory, parent directory, or fallback
        try {
            Dotenv dotenv = null;
            if (new File(".env").exists()) {
                dotenv = Dotenv.configure().ignoreIfMissing().load();
            } else if (new File("../.env").exists()) {
                dotenv = Dotenv.configure().directory("../").ignoreIfMissing().load();
            } else {
                dotenv = Dotenv.configure().ignoreIfMissing().load();
            }

            if (dotenv != null) {
                dotenv.entries().forEach(entry -> {
                    // Set as System property if not already explicitly provided in environment
                    if (System.getProperty(entry.getKey()) == null && System.getenv(entry.getKey()) == null) {
                        System.setProperty(entry.getKey(), entry.getValue());
                    }
                });
            }
        } catch (Exception e) {
            System.err.println("Notice: Could not load .env file: " + e.getMessage());
        }

        SpringApplication.run(HeatSafeApplication.class, args);
    }
}
