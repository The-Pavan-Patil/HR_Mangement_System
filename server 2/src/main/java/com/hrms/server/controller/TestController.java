package com.hrms.server.controller;

import com.hrms.server.dto.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class TestController {
    
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> healthCheck() {
        Map<String, Object> data = new HashMap<>();
        data.put("status", "UP");
        data.put("timestamp", LocalDateTime.now());
        data.put("message", "Backend is running successfully");
        data.put("database", "Connected");
        
        ApiResponse<Map<String, Object>> response = ApiResponse.success(
            "Health check passed", 
            data
        );
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/auth")
    public ResponseEntity<ApiResponse<Map<String, String>>> authTest() {
        Map<String, String> data = new HashMap<>();
        data.put("authentication", "SUCCESS");
        data.put("message", "HTTP Basic Auth is working");
        
        ApiResponse<Map<String, String>> response = ApiResponse.success(
            "Authentication test passed", 
            data
        );
        
        return ResponseEntity.ok(response);
    }
}