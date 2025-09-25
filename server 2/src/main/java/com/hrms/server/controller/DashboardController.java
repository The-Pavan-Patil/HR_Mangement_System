package com.hrms.controller;

import com.hrms.dto.response.ApiResponse;
import com.hrms.entity.User;
import com.hrms.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class DashboardController {
    
    private static final Logger logger = LoggerFactory.getLogger(DashboardController.class);
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/admin/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAdminStats() {
        logger.info("Fetching admin dashboard statistics");
        
        try {
            List<User> allUsers = userService.getAllActiveUsers();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalEmployees", allUsers.size());
            stats.put("activeEmployees", allUsers.stream().mapToInt(u -> u.isActive() ? 1 : 0).sum());
            stats.put("totalAdmins", allUsers.stream().mapToInt(u -> u.getRole() == User.Role.ADMIN ? 1 : 0).sum());
            stats.put("totalManagers", allUsers.stream().mapToInt(u -> u.getRole() == User.Role.MANAGER ? 1 : 0).sum());
            stats.put("totalHRs", allUsers.stream().mapToInt(u -> u.getRole() == User.Role.HR ? 1 : 0).sum());
            stats.put("totalRecruiters", allUsers.stream().mapToInt(u -> u.getRole() == User.Role.RECRUITER ? 1 : 0).sum());
            
            // Calculate recent registrations (last 7 days)
            LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
            int recentRegistrations = (int) allUsers.stream()
                .filter(u -> u.getCreatedAt().isAfter(sevenDaysAgo))
                .count();
            stats.put("recentRegistrations", recentRegistrations);
            
            // Role distribution
            Map<String, Integer> roleDistribution = new HashMap<>();
            for (User.Role role : User.Role.values()) {
                int count = (int) allUsers.stream().filter(u -> u.getRole() == role).count();
                roleDistribution.put(role.toString(), count);
            }
            stats.put("roleDistribution", roleDistribution);
            
            // System health metrics
            Map<String, Object> systemHealth = new HashMap<>();
            systemHealth.put("databaseStatus", "Connected");
            systemHealth.put("authenticationStatus", "Active");
            systemHealth.put("backupStatus", "Scheduled");
            systemHealth.put("securityStatus", "Clean");
            systemHealth.put("uptime", "99.9%");
            stats.put("systemHealth", systemHealth);
            
            ApiResponse<Map<String, Object>> response = ApiResponse.success(
                "Admin statistics retrieved successfully", 
                stats
            );
            
            logger.info("Admin statistics retrieved successfully: {} total users", allUsers.size());
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            logger.error("Error retrieving admin statistics: {}", e.getMessage());
            
            ApiResponse<Map<String, Object>> errorResponse = ApiResponse.error(e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/hr/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHRStats() {
        logger.info("Fetching HR dashboard statistics");
        
        try {
            List<User> allUsers = userService.getAllActiveUsers();
            // Filter out admin users for HR management
            List<User> employees = allUsers.stream()
                .filter(u -> u.getRole() != User.Role.ADMIN)
                .collect(Collectors.toList());
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalEmployees", employees.size());
            stats.put("activeEmployees", employees.stream().mapToInt(u -> u.isActive() ? 1 : 0).sum());
            
            // Calculate new hires this month
            LocalDateTime firstDayOfMonth = LocalDateTime.now().withDayOfMonth(1);
            int newHiresThisMonth = (int) employees.stream()
                .filter(u -> u.getCreatedAt().isAfter(firstDayOfMonth))
                .count();
            stats.put("newHiresThisMonth", newHiresThisMonth);
            
            // Mock data for features not yet implemented
            stats.put("pendingLeaveRequests", 7);
            stats.put("upcomingMeetings", 3);
            
            // Personal metrics
            Map<String, Object> personalMetrics = new HashMap<>();
            personalMetrics.put("attendanceRate", 98.5);
            personalMetrics.put("taskCompletionRate", 95.2);
            personalMetrics.put("learningProgress", 78.3);
            personalMetrics.put("goalAchievement", 85.0);
            stats.put("personalMetrics", personalMetrics);
            
            ApiResponse<Map<String, Object>> response = ApiResponse.success(
                "Employee statistics retrieved successfully", 
                stats
            );
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            logger.error("Error retrieving employee statistics: {}", e.getMessage());
            
            ApiResponse<Map<String, Object>> errorResponse = ApiResponse.error(e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/recruiter/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRecruiterStats() {
        logger.info("Fetching recruiter dashboard statistics");
        
        try {
            // Mock data for recruiter dashboard
            Map<String, Object> stats = new HashMap<>();
            stats.put("openPositions", 8);
            stats.put("applications", 45);
            stats.put("interviewsScheduled", 12);
            stats.put("offersExtended", 3);
            stats.put("candidatesInPipeline", 28);
            stats.put("avgTimeToHire", 21); // days
            
            // Recruitment metrics
            Map<String, Object> recruitmentMetrics = new HashMap<>();
            recruitmentMetrics.put("applicationToInterviewRate", 26.7);
            recruitmentMetrics.put("interviewToOfferRate", 25.0);
            recruitmentMetrics.put("offerAcceptanceRate", 88.9);
            recruitmentMetrics.put("sourceQuality", 4.2);
            stats.put("recruitmentMetrics", recruitmentMetrics);
            
            // Pipeline status
            Map<String, Integer> pipeline = new HashMap<>();
            pipeline.put("screening", 15);
            pipeline.put("firstInterview", 8);
            pipeline.put("secondInterview", 3);
            pipeline.put("finalReview", 2);
            stats.put("candidatePipeline", pipeline);
            
            ApiResponse<Map<String, Object>> response = ApiResponse.success(
                "Recruiter statistics retrieved successfully", 
                stats
            );
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            logger.error("Error retrieving recruiter statistics: {}", e.getMessage());
            
            ApiResponse<Map<String, Object>> errorResponse = ApiResponse.error(e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
PerformanceReviews", 12);
            
            // Department distribution
            Map<String, Integer> departmentDistribution = new HashMap<>();
            departmentDistribution.put("Engineering", (int) employees.stream().filter(u -> u.getRole() == User.Role.EMPLOYEE).count());
            departmentDistribution.put("Management", (int) employees.stream().filter(u -> u.getRole() == User.Role.MANAGER).count());
            departmentDistribution.put("Recruitment", (int) employees.stream().filter(u -> u.getRole() == User.Role.RECRUITER).count());
            departmentDistribution.put("Human Resources", (int) employees.stream().filter(u -> u.getRole() == User.Role.HR).count());
            stats.put("employeesByDepartment", departmentDistribution);
            
            // HR Metrics
            Map<String, Object> hrMetrics = new HashMap<>();
            hrMetrics.put("employeeRetention", 94.2);
            hrMetrics.put("averagePerformanceScore", 4.2);
            hrMetrics.put("trainingCompletion", 87.5);
            stats.put("hrMetrics", hrMetrics);
            
            // Recent activities (mock data)
            Map<String, Object> activity1 = new HashMap<>();
            activity1.put("id", 1);
            activity1.put("type", "registration");
            activity1.put("message", "New employee registered");
            activity1.put("timestamp", LocalDateTime.now().toString());
            activity1.put("status", "completed");
            
            Map<String, Object> activity2 = new HashMap<>();
            activity2.put("id", 2);
            activity2.put("type", "leave");
            activity2.put("message", "Leave request submitted");
            activity2.put("timestamp", LocalDateTime.now().minusHours(1).toString());
            activity2.put("status", "pending");
            
            Map<String, Object> activity3 = new HashMap<>();
            activity3.put("id", 3);
            activity3.put("type", "review");
            activity3.put("message", "Performance review completed");
            activity3.put("timestamp", LocalDateTime.now().minusHours(2).toString());
            activity3.put("status", "completed");
            
            stats.put("recentActivities", List.of(activity1, activity2, activity3));
            
            ApiResponse<Map<String, Object>> response = ApiResponse.success(
                "HR statistics retrieved successfully", 
                stats
            );
            
            logger.info("HR statistics retrieved successfully: {} employees under management", employees.size());
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            logger.error("Error retrieving HR statistics: {}", e.getMessage());
            
            ApiResponse<Map<String, Object>> errorResponse = ApiResponse.error(e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/manager/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getManagerStats() {
        logger.info("Fetching manager dashboard statistics");
        
        try {
            // Mock data for manager dashboard
            Map<String, Object> stats = new HashMap<>();
            stats.put("teamMembers", 12);
            stats.put("pendingApprovals", 5);
            stats.put("teamPerformance", 87.5);
            stats.put("completedTasks", 34);
            stats.put("upcomingDeadlines", 8);
            
            // Team performance breakdown
            Map<String, Object> teamStats = new HashMap<>();
            teamStats.put("onTimeDelivery", 92.3);
            teamStats.put("qualityScore", 4.1);
            teamStats.put("teamSatisfaction", 88.7);
            teamStats.put("productivityIndex", 95.2);
            stats.put("teamMetrics", teamStats);
            
            ApiResponse<Map<String, Object>> response = ApiResponse.success(
                "Manager statistics retrieved successfully", 
                stats
            );
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            logger.error("Error retrieving manager statistics: {}", e.getMessage());
            
            ApiResponse<Map<String, Object>> errorResponse = ApiResponse.error(e.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/employee/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getEmployeeStats() {
        logger.info("Fetching employee dashboard statistics");
        
        try {
            // Mock data for employee dashboard
            Map<String, Object> stats = new HashMap<>();
            stats.put("leaveBalance", 18);
            stats.put("hoursThisMonth", 156);
            stats.put("pendingTasks", 7);
            stats.put("performanceScore", 92.0);
            stats.put("completedTrainings", 5);
            stats.put("upcoming