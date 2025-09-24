package com.hrms.server.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {
    
    @Value("${firebase.service-account-file}")
    private String serviceAccountFile;
    
    @PostConstruct
    public void initialize() throws IOException {
        // Remove "classpath:" prefix if present
        String resourcePath = serviceAccountFile.startsWith("classpath:")
            ? serviceAccountFile.substring("classpath:".length())
            : serviceAccountFile;

        ClassPathResource resource = new ClassPathResource(resourcePath);
        InputStream serviceAccount = resource.getInputStream();
        
        FirebaseOptions options = FirebaseOptions.builder()
            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
            .build();
        
        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseApp.initializeApp(options);
        }
    }
    
    @Bean
    public FirebaseAuth firebaseAuth() {
        return FirebaseAuth.getInstance();
    }
}