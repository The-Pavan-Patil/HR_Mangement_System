package com.hrms.server.service;

import com.hrms.server.dto.request.UserRegistrationRequest;
import com.hrms.server.entity.User;
import com.hrms.server.exception.BadRequestException;
import com.hrms.server.exception.ResourceNotFoundException;
import com.hrms.server.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    
    @Autowired
    private UserRepository userRepository;
    
    public User createUser(UserRegistrationRequest request) {
        logger.info("Creating user with UID: {} and email: {}", request.getUid(), request.getEmail());
        
        // Check if user already exists by Firebase UID
        if (userRepository.existsByFirebaseUid(request.getUid())) {
            logger.warn("User with Firebase UID {} already exists", request.getUid());
            throw new BadRequestException("User with this UID already exists");
        }
        
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            logger.warn("User with email {} already exists", request.getEmail());
            throw new BadRequestException("User with this email already exists");
        }
        
        // Create new user
        User user = new User(
            request.getUid(),
            request.getEmail(),
            request.getFirstName(),
            request.getLastName(),
            request.getRole()
        );
        
        User savedUser = userRepository.save(user);
        logger.info("User created successfully with ID: {}", savedUser.getId());
        
        return savedUser;
    }
    
    public User findByFirebaseUid(String firebaseUid) {
        logger.debug("Finding user by Firebase UID: {}", firebaseUid);
        
        return userRepository.findByFirebaseUid(firebaseUid)
            .orElseThrow(() -> {
                logger.error("User not found with UID: {}", firebaseUid);
                return new ResourceNotFoundException("User not found with UID: " + firebaseUid);
            });
    }
    
    public User findByEmail(String email) {
        logger.debug("Finding user by email: {}", email);
        
        return userRepository.findByEmail(email)
            .orElseThrow(() -> {
                logger.error("User not found with email: {}", email);
                return new ResourceNotFoundException("User not found with email: " + email);
            });
    }
    
    public List<User> getAllActiveUsers() {
        logger.debug("Fetching all active users");
        return userRepository.findByIsActiveTrue();
    }
    
    public List<User> getUsersByRole(User.Role role) {
        logger.debug("Fetching users by role: {}", role);
        return userRepository.findActiveUsersByRole(role);
    }
    
    public User updateUser(String firebaseUid, UserRegistrationRequest request) {
        logger.info("Updating user with UID: {}", firebaseUid);
        
        User user = findByFirebaseUid(firebaseUid);
        
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(request.getRole());
        
        User updatedUser = userRepository.save(user);
        logger.info("User updated successfully with ID: {}", updatedUser.getId());
        
        return updatedUser;
    }
    
    public void deactivateUser(String firebaseUid) {
        logger.info("Deactivating user with UID: {}", firebaseUid);
        
        User user = findByFirebaseUid(firebaseUid);
        user.setActive(false);
        userRepository.save(user);
        
        logger.info("User deactivated successfully: {}", user.getEmail());
    }
    
    public boolean userExists(String firebaseUid) {
        return userRepository.existsByFirebaseUid(firebaseUid);
    }
    
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }
}