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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    
    @Autowired
    private UserRepository userRepository;
    
    // Basic CRUD Operations
    
    public User createUser(UserRegistrationRequest request) {
        logger.info("Creating user with UID: {} and email: {}", request.getUid(), request.getEmail());
        
        // Validate input
        if (request.getUid() == null || request.getUid().trim().isEmpty()) {
            throw new BadRequestException("Firebase UID cannot be null or empty");
        }
        
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new BadRequestException("Email cannot be null or empty");
        }
        
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
        logger.info("User created successfully with ID: {} and role: {}", 
                   savedUser.getId(), savedUser.getRole());
        
        return savedUser;
    }
    
    public User findByFirebaseUid(String firebaseUid) {
        logger.debug("Finding user by Firebase UID: {}", firebaseUid);
        
        if (firebaseUid == null || firebaseUid.trim().isEmpty()) {
            throw new BadRequestException("Firebase UID cannot be null or empty");
        }
        
        return userRepository.findByFirebaseUid(firebaseUid)
            .orElseThrow(() -> {
                logger.error("User not found with UID: {}", firebaseUid);
                return new ResourceNotFoundException("User not found with UID: " + firebaseUid);
            });
    }
    
    public User findByEmail(String email) {
        logger.debug("Finding user by email: {}", email);
        
        if (email == null || email.trim().isEmpty()) {
            throw new BadRequestException("Email cannot be null or empty");
        }
        
        return userRepository.findByEmail(email)
            .orElseThrow(() -> {
                logger.error("User not found with email: {}", email);
                return new ResourceNotFoundException("User not found with email: " + email);
            });
    }
    
    public User findById(Long id) {
        logger.debug("Finding user by ID: {}", id);
        
        if (id == null) {
            throw new BadRequestException("User ID cannot be null");
        }
        
        return userRepository.findById(id)
            .orElseThrow(() -> {
                logger.error("User not found with ID: {}", id);
                return new ResourceNotFoundException("User not found with ID: " + id);
            });
    }
    
    public List<User> getAllActiveUsers() {
        logger.debug("Fetching all active users");
        List<User> users = userRepository.findByIsActiveTrue();
        logger.debug("Found {} active users", users.size());
        return users;
    }
    
    public List<User> getAllUsers() {
        logger.debug("Fetching all users");
        List<User> users = userRepository.findAll();
        logger.debug("Found {} total users", users.size());
        return users;
    }
    
    public List<User> getUsersByRole(User.Role role) {
        logger.debug("Fetching users by role: {}", role);
        
        if (role == null) {
            throw new BadRequestException("Role cannot be null");
        }
        
        List<User> users = userRepository.findActiveUsersByRole(role);
        logger.debug("Found {} users with role: {}", users.size(), role);
        return users;
    }
    
    public User updateUser(String firebaseUid, UserRegistrationRequest request) {
        logger.info("Updating user with UID: {}", firebaseUid);
        
        User user = findByFirebaseUid(firebaseUid);
        
        // Update fields
        if (request.getFirstName() != null && !request.getFirstName().trim().isEmpty()) {
            user.setFirstName(request.getFirstName().trim());
        }
        
        if (request.getLastName() != null && !request.getLastName().trim().isEmpty()) {
            user.setLastName(request.getLastName().trim());
        }
        
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        
        User updatedUser = userRepository.save(user);
        logger.info("User updated successfully - ID: {}, Name: {} {}, Role: {}", 
                   updatedUser.getId(), updatedUser.getFirstName(), 
                   updatedUser.getLastName(), updatedUser.getRole());
        
        return updatedUser;
    }
    
    public void deactivateUser(String firebaseUid) {
        logger.info("Deactivating user with UID: {}", firebaseUid);
        
        User user = findByFirebaseUid(firebaseUid);
        user.setActive(false);
        userRepository.save(user);
        
        logger.info("User deactivated successfully: {} ({})", user.getEmail(), user.getId());
    }
    
    public void activateUser(String firebaseUid) {
        logger.info("Activating user with UID: {}", firebaseUid);
        
        User user = findByFirebaseUid(firebaseUid);
        user.setActive(true);
        userRepository.save(user);
        
        logger.info("User activated successfully: {} ({})", user.getEmail(), user.getId());
    }
    
    public void deleteUser(String firebaseUid) {
        logger.warn("Attempting to delete user with UID: {}", firebaseUid);
        
        User user = findByFirebaseUid(firebaseUid);
        userRepository.delete(user);
        
        logger.warn("User deleted: {} ({})", user.getEmail(), user.getId());
    }
    
    // Validation Methods
    
    public boolean userExists(String firebaseUid) {
        if (firebaseUid == null || firebaseUid.trim().isEmpty()) {
            return false;
        }
        return userRepository.existsByFirebaseUid(firebaseUid);
    }
    
    public boolean emailExists(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        return userRepository.existsByEmail(email);
    }
    
    // Dashboard-specific Methods
    
    public Map<User.Role, Long> getUserCountByRole() {
        logger.debug("Calculating user count by role");
        
        List<User> allUsers = getAllActiveUsers();
        Map<User.Role, Long> roleCount = allUsers.stream()
            .collect(Collectors.groupingBy(User::getRole, Collectors.counting()));
        
        // Ensure all roles are represented (with 0 count if none exist)
        for (User.Role role : User.Role.values()) {
            roleCount.putIfAbsent(role, 0L);
        }
        
        logger.debug("Role distribution: {}", roleCount);
        return roleCount;
    }
    
    public List<User> getRecentUsers(int days) {
        logger.debug("Fetching users registered in the last {} days", days);
        
        if (days <= 0) {
            throw new BadRequestException("Days must be positive");
        }
        
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(days);
        List<User> recentUsers = getAllActiveUsers().stream()
            .filter(user -> user.getCreatedAt().isAfter(cutoffDate))
            .collect(Collectors.toList());
        
        logger.debug("Found {} users registered in the last {} days", recentUsers.size(), days);
        return recentUsers;
    }
    
    public List<User> getNonAdminUsers() {
        logger.debug("Fetching non-admin users for HR management");
        
        List<User> nonAdminUsers = getAllActiveUsers().stream()
            .filter(user -> user.getRole() != User.Role.ADMIN)
            .collect(Collectors.toList());
        
        logger.debug("Found {} non-admin users", nonAdminUsers.size());
        return nonAdminUsers;
    }
    
    public List<User> getUsersCreatedThisMonth() {
        logger.debug("Fetching users created this month");
        
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1)
                                                      .withHour(0).withMinute(0)
                                                      .withSecond(0).withNano(0);
        
        List<User> thisMonthUsers = getAllActiveUsers().stream()
            .filter(user -> user.getCreatedAt().isAfter(startOfMonth))
            .collect(Collectors.toList());
        
        logger.debug("Found {} users created this month", thisMonthUsers.size());
        return thisMonthUsers;
    }
    
    public List<User> getUsersByRoleAndActiveStatus(User.Role role, boolean isActive) {
        logger.debug("Fetching users by role: {} and active status: {}", role, isActive);
        
        if (role == null) {
            throw new BadRequestException("Role cannot be null");
        }
        
        List<User> users = userRepository.findByRole(role).stream()
            .filter(user -> user.isActive() == isActive)
            .collect(Collectors.toList());
        
        logger.debug("Found {} users with role: {} and active: {}", users.size(), role, isActive);
        return users;
    }
    
    // Statistical Methods
    
    public long getTotalUserCount() {
        long count = userRepository.count();
        logger.debug("Total user count: {}", count);
        return count;
    }
    
    public long getActiveUserCount() {
        long count = getAllActiveUsers().size();
        logger.debug("Active user count: {}", count);
        return count;
    }
    
    public long getInactiveUserCount() {
        long totalCount = getTotalUserCount();
        long activeCount = getActiveUserCount();
        long inactiveCount = totalCount - activeCount;
        logger.debug("Inactive user count: {}", inactiveCount);
        return inactiveCount;
    }
    
    public long getUserCountByRole(User.Role role) {
        if (role == null) {
            return 0;
        }
        
        long count = getUsersByRole(role).size();
        logger.debug("User count for role {}: {}", role, count);
        return count;
    }
    
    public double getUserGrowthRate(int days) {
        logger.debug("Calculating user growth rate for the last {} days", days);
        
        if (days <= 0) {
            throw new BadRequestException("Days must be positive");
        }
        
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(days);
        long recentUsers = getAllUsers().stream()
            .filter(user -> user.getCreatedAt().isAfter(cutoffDate))
            .count();
        
        long totalUsers = getTotalUserCount();
        
        if (totalUsers == 0) {
            return 0.0;
        }
        
        double growthRate = (double) recentUsers / totalUsers * 100;
        logger.debug("User growth rate ({}d): {}%", days, growthRate);
        return growthRate;
    }
    
    // Utility Methods
    
    public List<User> searchUsersByName(String searchTerm) {
        logger.debug("Searching users by name: {}", searchTerm);
        
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            return getAllActiveUsers();
        }
        
        String searchTermLower = searchTerm.toLowerCase().trim();
        
        List<User> matchingUsers = getAllActiveUsers().stream()
            .filter(user -> 
                user.getFirstName().toLowerCase().contains(searchTermLower) ||
                user.getLastName().toLowerCase().contains(searchTermLower) ||
                (user.getFirstName() + " " + user.getLastName()).toLowerCase().contains(searchTermLower)
            )
            .collect(Collectors.toList());
        
        logger.debug("Found {} users matching search term: {}", matchingUsers.size(), searchTerm);
        return matchingUsers;
    }
    
    public List<User> searchUsersByEmail(String emailSearchTerm) {
        logger.debug("Searching users by email: {}", emailSearchTerm);
        
        if (emailSearchTerm == null || emailSearchTerm.trim().isEmpty()) {
            return getAllActiveUsers();
        }
        
        String emailSearchLower = emailSearchTerm.toLowerCase().trim();
        
        List<User> matchingUsers = getAllActiveUsers().stream()
            .filter(user -> user.getEmail().toLowerCase().contains(emailSearchLower))
            .collect(Collectors.toList());
        
        logger.debug("Found {} users matching email search: {}", matchingUsers.size(), emailSearchTerm);
        return matchingUsers;
    }
    
    public Map<String, Object> getUserStatistics() {
        logger.debug("Generating comprehensive user statistics");
        
        List<User> allUsers = getAllUsers();
        List<User> activeUsers = getAllActiveUsers();
        Map<User.Role, Long> roleDistribution = getUserCountByRole();
        
        Map<String, Object> statistics = Map.of(
            "totalUsers", allUsers.size(),
            "activeUsers", activeUsers.size(),
            "inactiveUsers", allUsers.size() - activeUsers.size(),
            "roleDistribution", roleDistribution,
            "recentUsers7Days", getRecentUsers(7).size(),
            "recentUsers30Days", getRecentUsers(30).size(),
            "thisMonthUsers", getUsersCreatedThisMonth().size(),
            "growthRate7Days", getUserGrowthRate(7),
            "growthRate30Days", getUserGrowthRate(30)
        );
        
        logger.debug("Generated user statistics: {}", statistics);
        return statistics;
    }
    
    public boolean isValidRole(String roleName) {
        if (roleName == null || roleName.trim().isEmpty()) {
            return false;
        }
        
        try {
            User.Role.valueOf(roleName.toUpperCase());
            return true;
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid role name provided: {}", roleName);
            return false;
        }
    }
    
    public User.Role parseRole(String roleName) {
        if (!isValidRole(roleName)) {
            throw new BadRequestException("Invalid role: " + roleName);
        }
        
        return User.Role.valueOf(roleName.toUpperCase());
    }
    
    // Batch Operations
    
    public List<User> createMultipleUsers(List<UserRegistrationRequest> requests) {
        logger.info("Creating {} users in batch", requests.size());
        
        if (requests == null || requests.isEmpty()) {
            throw new BadRequestException("User requests list cannot be null or empty");
        }
        
        List<User> createdUsers = requests.stream()
            .map(this::createUser)
            .collect(Collectors.toList());
        
        logger.info("Successfully created {} users in batch", createdUsers.size());
        return createdUsers;
    }
    
    public void deactivateMultipleUsers(List<String> firebaseUids) {
        logger.info("Deactivating {} users in batch", firebaseUids.size());
        
        if (firebaseUids == null || firebaseUids.isEmpty()) {
            throw new BadRequestException("Firebase UIDs list cannot be null or empty");
        }
        
        int deactivatedCount = 0;
        for (String uid : firebaseUids) {
            try {
                deactivateUser(uid);
                deactivatedCount++;
            } catch (Exception e) {
                logger.error("Failed to deactivate user with UID {}: {}", uid, e.getMessage());
            }
        }
        
        logger.info("Successfully deactivated {} out of {} users", deactivatedCount, firebaseUids.size());
    }
    
    public void activateMultipleUsers(List<String> firebaseUids) {
        logger.info("Activating {} users in batch", firebaseUids.size());
        
        if (firebaseUids == null || firebaseUids.isEmpty()) {
            throw new BadRequestException("Firebase UIDs list cannot be null or empty");
        }
        
        int activatedCount = 0;
        for (String uid : firebaseUids) {
            try {
                activateUser(uid);
                activatedCount++;
            } catch (Exception e) {
                logger.error("Failed to activate user with UID {}: {}", uid, e.getMessage());
            }
        }
        
        logger.info("Successfully activated {} out of {} users", activatedCount, firebaseUids.size());
    }
    
    // Administrative Methods
    
    public void cleanupInactiveUsers(int daysInactive) {
        logger.info("Starting cleanup of users inactive for {} days", daysInactive);
        
        if (daysInactive <= 0) {
            throw new BadRequestException("Days inactive must be positive");
        }
        
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysInactive);
        
        List<User> inactiveUsers = getAllUsers().stream()
            .filter(user -> !user.isActive() && user.getUpdatedAt().isBefore(cutoffDate))
            .collect(Collectors.toList());
        
        logger.info("Found {} inactive users older than {} days", inactiveUsers.size(), daysInactive);
        
        // For now, just log the users that would be cleaned up
        // In a real implementation, you might want to archive or delete these users
        inactiveUsers.forEach(user -> 
            logger.info("Would clean up user: {} ({}) - Last updated: {}", 
                       user.getEmail(), user.getId(), user.getUpdatedAt())
        );
    }
    
    public Map<String, Object> generateUserReport() {
        logger.info("Generating comprehensive user report");
        
        List<User> allUsers = getAllUsers();
        List<User> activeUsers = getAllActiveUsers();
        Map<User.Role, Long> roleDistribution = getUserCountByRole();
        
        // Calculate various metrics
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfWeek = now.minusDays(7);
        LocalDateTime startOfMonth = now.withDayOfMonth(1);
        LocalDateTime startOfYear = now.withDayOfYear(1);
        
        Map<String, Object> report = new java.util.HashMap<>();
        report.put("reportGeneratedAt", now.toString());
        report.put("totalUsers", allUsers.size());
        report.put("activeUsers", activeUsers.size());
        report.put("inactiveUsers", allUsers.size() - activeUsers.size());
        report.put("roleDistribution", roleDistribution);
        report.put("weeklyGrowth", allUsers.stream().filter(u -> u.getCreatedAt().isAfter(startOfWeek)).count());
        report.put("monthlyGrowth", allUsers.stream().filter(u -> u.getCreatedAt().isAfter(startOfMonth)).count());
        report.put("yearlyGrowth", allUsers.stream().filter(u -> u.getCreatedAt().isAfter(startOfYear)).count());
        report.put("averageUsersPerDay", calculateAverageUsersPerDay(allUsers));
        report.put("mostCommonRole", getMostCommonRole(roleDistribution));
        report.put("activationRate", calculateActivationRate(allUsers));
        
        logger.info("User report generated successfully");
        return report;
    }

    public User updatePersonalDetails(String firebaseUid, String phone, String address,
            String emergencyName, String emergencyPhone, String emergencyRelationship) {
        logger.info("Updating personal details for user: {}", firebaseUid);

        User user = findByFirebaseUid(firebaseUid);

        if (phone != null) {
            user.setPhone(phone);
        }
        if (address != null) {
            user.setAddress(address);
        }
        if (emergencyName != null) {
            user.setEmergencyContactName(emergencyName);
        }
        if (emergencyPhone != null) {
            user.setEmergencyContactPhone(emergencyPhone);
        }
        if (emergencyRelationship != null) {
            user.setEmergencyContactRelationship(emergencyRelationship);
        }

        User updatedUser = userRepository.save(user);
        logger.info("Personal details updated successfully for user: {}", firebaseUid);

        return updatedUser;
    }
    
    // Private helper methods
    
    private double calculateAverageUsersPerDay(List<User> users) {
        if (users.isEmpty()) {
            return 0.0;
        }
        
        LocalDateTime oldestUser = users.stream()
            .map(User::getCreatedAt)
            .min(LocalDateTime::compareTo)
            .orElse(LocalDateTime.now());
        
        long daysSinceOldest = java.time.Duration.between(oldestUser, LocalDateTime.now()).toDays();
        if (daysSinceOldest == 0) {
            return users.size();
        }
        
        return (double) users.size() / daysSinceOldest;
    }
    
    private User.Role getMostCommonRole(Map<User.Role, Long> roleDistribution) {
        return roleDistribution.entrySet().stream()
            .max(Map.Entry.comparingByValue())
            .map(Map.Entry::getKey)
            .orElse(User.Role.EMPLOYEE);
    }
    
    private double calculateActivationRate(List<User> users) {
        if (users.isEmpty()) {
            return 100.0;
        }
        
        long activeCount = users.stream().mapToLong(u -> u.isActive() ? 1 : 0).sum();
        return (double) activeCount / users.size() * 100.0;
    }
}