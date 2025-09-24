package com.hrms.server.controller;

import com.hrms.server.dto.request.UserRegistrationRequest;
import com.hrms.server.dto.response.ApiResponse;
import com.hrms.server.dto.response.UserResponse;
import com.hrms.server.entity.User;
import com.hrms.server.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"}) // React dev servers
public class UserController {
    
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    
    @Autowired
    private UserService userService;
    
    @PostMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> createUserProfile(
            @Valid @RequestBody UserRegistrationRequest request) {
        
        logger.info("Received user registration request for: {}", request.getEmail());
        
        try {
            User user = userService.createUser(request);
            UserResponse userResponse = new UserResponse(user);
            
            ApiResponse<UserResponse> response = ApiResponse.success(
                "User profile created successfully", 
                userResponse
            );
            
            logger.info("User profile created successfully for: {}", request.getEmail());
            return new ResponseEntity<>(response, HttpStatus.CREATED);
            
        } catch (Exception e) {
            logger.error("Error creating user profile for: {} - {}", request.getEmail(), e.getMessage());
            
            ApiResponse<UserResponse> errorResponse = ApiResponse.error(e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }
    
    @GetMapping("/profile/{uid}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserProfile(@PathVariable String uid) {
        
        logger.info("Received request to get user profile for UID: {}", uid);
        
        try {
            User user = userService.findByFirebaseUid(uid);
            UserResponse userResponse = new UserResponse(user);
            
            ApiResponse<UserResponse> response = ApiResponse.success(
                "User profile retrieved successfully", 
                userResponse
            );
            
            logger.info("User profile retrieved successfully for UID: {}", uid);
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            logger.error("Error retrieving user profile for UID: {} - {}", uid, e.getMessage());
            
            ApiResponse<UserResponse> errorResponse = ApiResponse.error(e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
        }
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        
        logger.info("Received request to get all active users");
        
        try {
            List<User> users = userService.getAllActiveUsers();
            List<UserResponse> userResponses = users.stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
            
            ApiResponse<List<UserResponse>> response = ApiResponse.success(
                "Users retrieved successfully", 
                userResponses
            );
            
            logger.info("Retrieved {} active users", users.size());
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            logger.error("Error retrieving all users: {}", e.getMessage());
            
            ApiResponse<List<UserResponse>> errorResponse = ApiResponse.error(e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/role/{role}")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUsersByRole(@PathVariable String role) {
        
        logger.info("Received request to get users by role: {}", role);
        
        try {
            User.Role userRole = User.Role.valueOf(role.toUpperCase());
            List<User> users = userService.getUsersByRole(userRole);
            List<UserResponse> userResponses = users.stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
            
            ApiResponse<List<UserResponse>> response = ApiResponse.success(
                "Users retrieved successfully for role: " + role, 
                userResponses
            );
            
            logger.info("Retrieved {} users for role: {}", users.size(), role);
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (IllegalArgumentException e) {
            logger.error("Invalid role provided: {}", role);
            
            ApiResponse<List<UserResponse>> errorResponse = ApiResponse.error("Invalid role: " + role);
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
            
        } catch (Exception e) {
            logger.error("Error retrieving users by role {}: {}", role, e.getMessage());
            
            ApiResponse<List<UserResponse>> errorResponse = ApiResponse.error(e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PutMapping("/profile/{uid}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserProfile(
            @PathVariable String uid,
            @Valid @RequestBody UserRegistrationRequest request) {
        
        logger.info("Received request to update user profile for UID: {}", uid);
        
        try {
            User updatedUser = userService.updateUser(uid, request);
            UserResponse userResponse = new UserResponse(updatedUser);
            
            ApiResponse<UserResponse> response = ApiResponse.success(
                "User profile updated successfully", 
                userResponse
            );
            
            logger.info("User profile updated successfully for UID: {}", uid);
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            logger.error("Error updating user profile for UID: {} - {}", uid, e.getMessage());
            
            ApiResponse<UserResponse> errorResponse = ApiResponse.error(e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }
    
    @DeleteMapping("/profile/{uid}")
    public ResponseEntity<ApiResponse<Void>> deactivateUser(@PathVariable String uid) {
        
        logger.info("Received request to deactivate user with UID: {}", uid);
        
        try {
            userService.deactivateUser(uid);
            
            ApiResponse<Void> response = ApiResponse.success(
                "User deactivated successfully", 
                null
            );
            
            logger.info("User deactivated successfully for UID: {}", uid);
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            logger.error("Error deactivating user for UID: {} - {}", uid, e.getMessage());
            
            ApiResponse<Void> errorResponse = ApiResponse.error(e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }
}