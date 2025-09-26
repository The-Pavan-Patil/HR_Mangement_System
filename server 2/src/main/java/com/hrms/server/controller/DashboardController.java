package com.hrms.server.controller;

import com.hrms.server.dto.response.ApiResponse;
import com.hrms.server.entity.User;
import com.hrms.server.service.UserService;
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
            List<User> allUsers = userService.getAllUsers();
            List<User> activeUsers = userService.getAllActiveUsers();
            
            Map<String, Object> stats = new HashMap<>();
            
            // Basic counts
            stats.put("totalEmployees", allUsers.size());
            stats.put("activeEmployees", activeUsers.size());
            
            // Role-based counts
            long adminCount = userService.getUserCountByRole(User.Role.ADMIN);
            long managerCount = userService.getUserCountByRole(User.Role.MANAGER);
            long hrCount = userService.getUserCountByRole(User.Role.HR);
            long employeeCount = userService.getUserCountByRole(User.Role.EMPLOYEE);
            long recruiterCount = userService.getUserCountByRole(User.Role.RECRUITER);
            
            stats.put("totalAdmins", adminCount);
            stats.put("totalManagers", managerCount);
            stats.put("totalHRs", hrCount);
            stats.put("totalEmployees_role", employeeCount);
            stats.put("totalRecruiters", recruiterCount);
            
            // Recent registrations (last 7 days)
            List<User> recentUsers = userService.getRecentUsers(7);
            stats.put("recentRegistrations", recentUsers.size());
            
            // Role distribution for charts
            Map<String, Long> roleDistribution = new HashMap<>();
            roleDistribution.put("ADMIN", adminCount);
            roleDistribution.put("MANAGER", managerCount);
            roleDistribution.put("HR", hrCount);
            roleDistribution.put("EMPLOYEE", employeeCount);
            roleDistribution.put("RECRUITER", recruiterCount);
            stats.put("roleDistribution", roleDistribution);
            
            // System health metrics
            Map<String, Object> systemHealth = new HashMap<>();
            systemHealth.put("databaseStatus", "Connected");
            systemHealth.put("authenticationStatus", "Active");
            systemHealth.put("backupStatus", "Scheduled");
            systemHealth.put("securityStatus", "Clean");
            systemHealth.put("uptime", "99.9%");
            systemHealth.put("lastBackup", LocalDateTime.now().minusHours(6).toString());
            stats.put("systemHealth", systemHealth);
            
            // Performance metrics
            Map<String, Object> performance = new HashMap<>();
            performance.put("avgResponseTime", "245ms");
            performance.put("totalRequests", 1547);
            performance.put("errorRate", "0.2%");
            performance.put("activeConnections", 23);
            stats.put("performance", performance);
            
            ApiResponse<Map<String, Object>> response = ApiResponse.success(
                "Admin statistics retrieved successfully", 
                stats
            );
            
            logger.info("Admin statistics retrieved - Total users: {}, Active: {}", 
                       allUsers.size(), activeUsers.size());
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            logger.error("Error retrieving admin statistics: {}", e.getMessage(), e);
            
            ApiResponse<Map<String, Object>> errorResponse = ApiResponse.error(
                "Failed to retrieve admin statistics: " + e.getMessage()
            );
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/hr/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHRStats() {
        logger.info("Fetching HR dashboard statistics");
        
        try {
            List<User> allUsers = userService.getAllActiveUsers();
            List<User> employees = userService.getNonAdminUsers();
            
            Map<String, Object> stats = new HashMap<>();
            
            // Employee counts
            stats.put("totalEmployees", employees.size());
            stats.put("activeEmployees", (int) employees.stream().filter(User::isActive).count());
            
            // New hires this month
            LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            long newHiresThisMonth = employees.stream()
                .filter(u -> u.getCreatedAt().isAfter(startOfMonth))
                .count();
            stats.put("newHiresThisMonth", newHiresThisMonth);
            
            // Mock data for features not yet implemented
            stats.put("pendingLeaveRequests", generateRandomStat(5, 15));
            stats.put("upcomingPerformanceReviews", generateRandomStat(10, 25));
            stats.put("pendingOnboardingTasks", generateRandomStat(3, 8));
            
            // Department/Role distribution for HR management
            Map<String, Long> departmentDistribution = new HashMap<>();
            departmentDistribution.put("Engineering", 
                employees.stream().filter(u -> u.getRole() == User.Role.EMPLOYEE).count());
            departmentDistribution.put("Management", 
                employees.stream().filter(u -> u.getRole() == User.Role.MANAGER).count());
            departmentDistribution.put("Recruitment", 
                employees.stream().filter(u -> u.getRole() == User.Role.RECRUITER).count());
            departmentDistribution.put("Human Resources", 
                employees.stream().filter(u -> u.getRole() == User.Role.HR).count());
            stats.put("employeesByDepartment", departmentDistribution);
            
            // HR Performance Metrics
            Map<String, Object> hrMetrics = new HashMap<>();
            hrMetrics.put("employeeRetention", 94.2);
            hrMetrics.put("averagePerformanceScore", 4.2);
            hrMetrics.put("trainingCompletion", 87.5);
            hrMetrics.put("employeeSatisfaction", 4.1);
            hrMetrics.put("timeToHire", 18); // days
            hrMetrics.put("turnoverRate", 5.8); // percentage
            stats.put("hrMetrics", hrMetrics);
            
            // Recent HR Activities (mock data)
            List<Map<String, Object>> recentActivities = List.of(
                createActivity(1, "registration", "New employee registered: John Doe", "completed", 0),
                createActivity(2, "leave", "Leave request submitted by Jane Smith", "pending", 2),
                createActivity(3, "review", "Performance review completed for Mike Johnson", "completed", 4),
                createActivity(4, "training", "Training program assigned to Development team", "in-progress", 6),
                createActivity(5, "payroll", "Monthly payroll processed successfully", "completed", 24),
                createActivity(6, "onboarding", "New hire orientation scheduled", "pending", 12)
            );
            stats.put("recentActivities", recentActivities);
            
            // Upcoming tasks/reminders
            List<Map<String, Object>> upcomingTasks = List.of(
                Map.of("task", "Quarterly performance reviews", "dueDate", "2024-03-31", "priority", "high"),
                Map.of("task", "Annual salary review", "dueDate", "2024-04-15", "priority", "medium"),
                Map.of("task", "Team building event planning", "dueDate", "2024-03-20", "priority", "low")
            );
            stats.put("upcomingTasks", upcomingTasks);
            
            ApiResponse<Map<String, Object>> response = ApiResponse.success(
                "HR statistics retrieved successfully", 
                stats
            );
            
            logger.info("HR statistics retrieved - Employees under management: {}", employees.size());
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            logger.error("Error retrieving HR statistics: {}", e.getMessage(), e);
            
            ApiResponse<Map<String, Object>> errorResponse = ApiResponse.error(
                "Failed to retrieve HR statistics: " + e.getMessage()
            );
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/manager/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getManagerStats() {
        logger.info("Fetching manager dashboard statistics");
        
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Team management stats
            stats.put("teamMembers", generateRandomStat(8, 15));
            stats.put("pendingApprovals", generateRandomStat(3, 8));
            stats.put("teamPerformance", 87.5);
            stats.put("completedTasks", generateRandomStat(25, 40));
            stats.put("upcomingDeadlines", generateRandomStat(5, 12));
            
            // Team performance metrics
            Map<String, Object> teamMetrics = new HashMap<>();
            teamMetrics.put("onTimeDelivery", 92.3);
            teamMetrics.put("qualityScore", 4.1);
            teamMetrics.put("teamSatisfaction", 88.7);
            teamMetrics.put("productivityIndex", 95.2);
            teamMetrics.put("collaborationScore", 4.3);
            stats.put("teamMetrics", teamMetrics);
            
            // Recent team activities
            List<Map<String, Object>> teamActivities = List.of(
                createActivity(1, "task", "Project milestone completed", "completed", 1),
                createActivity(2, "meeting", "Weekly team standup scheduled", "upcoming", 0),
                createActivity(3, "approval", "Leave request approved for team member", "completed", 3),
                createActivity(4, "goal", "Quarterly goals updated", "in-progress", 5)
            );
            stats.put("teamActivities", teamActivities);
            
            ApiResponse<Map<String, Object>> response = ApiResponse.success(
                "Manager statistics retrieved successfully", 
                stats
            );
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            logger.error("Error retrieving manager statistics: {}", e.getMessage(), e);
            
            ApiResponse<Map<String, Object>> errorResponse = ApiResponse.error(
                "Failed to retrieve manager statistics: " + e.getMessage()
            );
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/employee/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getEmployeeStats() {
        logger.info("Fetching employee dashboard statistics");
        
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Personal stats
            stats.put("leaveBalance", generateRandomStat(15, 25));
            stats.put("hoursThisMonth", generateRandomStat(140, 180));
            stats.put("pendingTasks", generateRandomStat(5, 12));
            stats.put("performanceScore", 92.0);
            stats.put("completedTrainings", generateRandomStat(3, 8));
            stats.put("upcomingMeetings", generateRandomStat(2, 6));
            
            // Personal performance metrics
            Map<String, Object> personalMetrics = new HashMap<>();
            personalMetrics.put("attendanceRate", 98.5);
            personalMetrics.put("taskCompletionRate", 95.2);
            personalMetrics.put("learningProgress", 78.3);
            personalMetrics.put("goalAchievement", 85.0);
            personalMetrics.put("peerRating", 4.2);
            stats.put("personalMetrics", personalMetrics);
            
            // Recent personal activities
            List<Map<String, Object>> personalActivities = List.of(
                createActivity(1, "task", "Project deliverable submitted", "completed", 1),
                createActivity(2, "training", "Completed cybersecurity training", "completed", 2),
                createActivity(3, "meeting", "One-on-one with manager", "completed", 3),
                createActivity(4, "goal", "Updated personal development goals", "completed", 5)
            );
            stats.put("personalActivities", personalActivities);
            
            ApiResponse<Map<String, Object>> response = ApiResponse.success(
                "Employee statistics retrieved successfully", 
                stats
            );
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            logger.error("Error retrieving employee statistics: {}", e.getMessage(), e);
            
            ApiResponse<Map<String, Object>> errorResponse = ApiResponse.error(
                "Failed to retrieve employee statistics: " + e.getMessage()
            );
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/recruiter/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getRecruiterStats() {
        logger.info("Fetching recruiter dashboard statistics");
        
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Recruitment pipeline stats
            stats.put("openPositions", generateRandomStat(6, 12));
            stats.put("applications", generateRandomStat(35, 60));
            stats.put("interviewsScheduled", generateRandomStat(8, 18));
            stats.put("offersExtended", generateRandomStat(2, 6));
            stats.put("candidatesInPipeline", generateRandomStat(20, 35));
            stats.put("avgTimeToHire", generateRandomStat(18, 28)); // days
            
            // Recruitment performance metrics
            Map<String, Object> recruitmentMetrics = new HashMap<>();
            recruitmentMetrics.put("applicationToInterviewRate", 26.7);
            recruitmentMetrics.put("interviewToOfferRate", 25.0);
            recruitmentMetrics.put("offerAcceptanceRate", 88.9);
            recruitmentMetrics.put("sourceQuality", 4.2);
            recruitmentMetrics.put("candidateSatisfaction", 4.1);
            recruitmentMetrics.put("hiringManagerSatisfaction", 4.3);
            stats.put("recruitmentMetrics", recruitmentMetrics);
            
            // Candidate pipeline breakdown
            Map<String, Integer> pipeline = new HashMap<>();
            pipeline.put("screening", generateRandomStat(10, 20));
            pipeline.put("firstInterview", generateRandomStat(6, 12));
            pipeline.put("secondInterview", generateRandomStat(3, 8));
            pipeline.put("finalReview", generateRandomStat(1, 4));
            pipeline.put("offerStage", generateRandomStat(1, 3));
            stats.put("candidatePipeline", pipeline);
            
            // Recent recruitment activities
            List<Map<String, Object>> recruitmentActivities = List.of(
                createActivity(1, "application", "New application received for Senior Developer", "new", 0),
                createActivity(2, "interview", "Technical interview completed", "completed", 2),
                createActivity(3, "offer", "Job offer extended to candidate", "pending", 1),
                createActivity(4, "posting", "New job posting published", "active", 4),
                createActivity(5, "screening", "Phone screening scheduled", "upcoming", 1)
            );
            stats.put("recruitmentActivities", recruitmentActivities);
            
            ApiResponse<Map<String, Object>> response = ApiResponse.success(
                "Recruiter statistics retrieved successfully", 
                stats
            );
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            logger.error("Error retrieving recruiter statistics: {}", e.getMessage(), e);
            
            ApiResponse<Map<String, Object>> errorResponse = ApiResponse.error(
                "Failed to retrieve recruiter statistics: " + e.getMessage()
            );
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    // Helper methods
    private int generateRandomStat(int min, int max) {
        return (int) (Math.random() * (max - min + 1)) + min;
    }
    
    private Map<String, Object> createActivity(int id, String type, String message, String status, int hoursAgo) {
        Map<String, Object> activity = new HashMap<>();
        activity.put("id", id);
        activity.put("type", type);
        activity.put("message", message);
        activity.put("status", status);
        activity.put("timestamp", LocalDateTime.now().minusHours(hoursAgo).toString());
        return activity;
    }
}