package com.hrms.server.service;

import com.hrms.server.entity.LeaveRequest;
import com.hrms.server.entity.LeaveType;
import com.hrms.server.entity.User;
import com.hrms.server.exception.BadRequestException;
import com.hrms.server.exception.ResourceNotFoundException;
import com.hrms.server.repository.LeaveRequestRepository;
import com.hrms.server.repository.LeaveTypeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@Transactional
public class LeaveService {
    
    private static final Logger logger = LoggerFactory.getLogger(LeaveService.class);
    private final Random random = new Random();
    
    @Autowired
    private LeaveRequestRepository leaveRequestRepository;
    
    @Autowired
    private LeaveTypeRepository leaveTypeRepository;
    
    @Autowired
    private UserService userService;
    
    public Map<String, Object> getAllLeaveRequests() {
        logger.info("Fetching all leave requests for HR review");
        
        // Get real leave requests if any exist, otherwise generate mock data
        List<LeaveRequest> requests = leaveRequestRepository.findAllByOrderByAppliedAtDesc();
        
        if (requests.isEmpty()) {
            requests = generateMockLeaveRequests();
        }
        
        // Calculate statistics
        Map<String, Object> stats = calculateLeaveStats(requests);
        
        // Convert to DTOs
        List<Map<String, Object>> requestDTOs = requests.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
        
        Map<String, Object> result = new HashMap<>();
        result.put("requests", requestDTOs);
        result.put("stats", stats);
        
        logger.info("Retrieved {} leave requests for review", requests.size());
        return result;
    }
    
    public LeaveRequest approveLeaveRequest(Long requestId, String reviewComments) {
        logger.info("Approving leave request with ID: {}", requestId);
        
        LeaveRequest request = leaveRequestRepository.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with ID: " + requestId));
        
        if (request.getStatus() != LeaveRequest.LeaveStatus.PENDING) {
            throw new BadRequestException("Only pending leave requests can be approved");
        }
        
        request.setStatus(LeaveRequest.LeaveStatus.APPROVED);
        request.setReviewedAt(LocalDateTime.now());
        request.setReviewComments(reviewComments != null ? reviewComments : "Approved by HR");
        // Note: In real implementation, set reviewedBy to current logged-in user
        
        LeaveRequest approved = leaveRequestRepository.save(request);
        logger.info("Leave request {} approved for employee {}", 
                   requestId, request.getEmployee().getEmail());
        
        return approved;
    }
    
    public LeaveRequest rejectLeaveRequest(Long requestId, String reviewComments) {
        logger.info("Rejecting leave request with ID: {}", requestId);
        
        if (reviewComments == null || reviewComments.trim().isEmpty()) {
            throw new BadRequestException("Review comments are required for rejection");
        }
        
        LeaveRequest request = leaveRequestRepository.findById(requestId)
            .orElseThrow(() -> new ResourceNotFoundException("Leave request not found with ID: " + requestId));
        
        if (request.getStatus() != LeaveRequest.LeaveStatus.PENDING) {
            throw new BadRequestException("Only pending leave requests can be rejected");
        }
        
        request.setStatus(LeaveRequest.LeaveStatus.REJECTED);
        request.setReviewedAt(LocalDateTime.now());
        request.setReviewComments(reviewComments);
        // Note: In real implementation, set reviewedBy to current logged-in user
        
        LeaveRequest rejected = leaveRequestRepository.save(request);
        logger.info("Leave request {} rejected for employee {}", 
                   requestId, request.getEmployee().getEmail());
        
        return rejected;
    }
    
    public List<LeaveRequest> getPendingLeaveRequests() {
        return leaveRequestRepository.findByStatusOrderByUrgencyDesc(LeaveRequest.LeaveStatus.PENDING);
    }
    
    public List<LeaveRequest> getHighPriorityRequests() {
        return leaveRequestRepository.findByUrgencyAndStatus(
            LeaveRequest.Priority.HIGH, 
            LeaveRequest.LeaveStatus.PENDING
        );
    }

    public LeaveRequest submitLeaveRequest(String employeeUid, String leaveTypeName, String startDate, String endDate, String reason) {
        logger.info("Submitting leave request for employee: {}", employeeUid);

        User employee = userService.findByFirebaseUid(employeeUid);

        // Map short code to full name
        String fullLeaveTypeName = mapLeaveTypeCodeToName(leaveTypeName);

        // Find leave type
        List<LeaveType> leaveTypes = leaveTypeRepository.findAll();
        LeaveType leaveType = leaveTypes.stream()
            .filter(lt -> lt.getName().equals(fullLeaveTypeName))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Leave type not found: " + fullLeaveTypeName));
        
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        
        if (start.isAfter(end)) {
            throw new BadRequestException("Start date cannot be after end date");
        }
        
        long totalDays = java.time.temporal.ChronoUnit.DAYS.between(start, end) + 1;
        
        LeaveRequest leaveRequest = new LeaveRequest(employee, leaveType, start, end, reason);
        leaveRequest.setTotalDays((int) totalDays);
        leaveRequest.setAppliedAt(LocalDateTime.now());
        leaveRequest.setStatus(LeaveRequest.LeaveStatus.PENDING);
        
        LeaveRequest saved = leaveRequestRepository.save(leaveRequest);
        logger.info("Leave request submitted successfully for employee: {}", employee.getEmail());

        return saved;
    }

    private String mapLeaveTypeCodeToName(String code) {
        switch (code.toUpperCase()) {
            case "ANNUAL":
                return "Annual Leave";
            case "SICK":
                return "Sick Leave";
            case "PERSONAL":
                return "Personal Leave";
            case "EMERGENCY":
                return "Emergency Leave";
            default:
                throw new BadRequestException("Invalid leave type: " + code);
        }
    }
    
    private List<LeaveRequest> generateMockLeaveRequests() {
        logger.info("Generating mock leave requests for demo");
        
        List<User> employees = userService.getNonAdminUsers();
        List<LeaveRequest> mockRequests = new ArrayList<>();
        
        // Ensure we have some leave types
        ensureLeaveTypesExist();
        List<LeaveType> leaveTypes = leaveTypeRepository.findByIsActiveTrueOrderByName();
        
        // Generate 10-15 mock leave requests
        int requestCount = 10 + random.nextInt(6);
        
        for (int i = 0; i < requestCount && i < employees.size(); i++) {
            User employee = employees.get(i % employees.size());
            LeaveType leaveType = leaveTypes.get(random.nextInt(leaveTypes.size()));
            
            // Generate random dates
            LocalDate startDate = LocalDate.now().plusDays(random.nextInt(30) - 10); // -10 to +20 days from now
            LocalDate endDate = startDate.plusDays(random.nextInt(5) + 1); // 1-5 days duration
            
            String[] reasons = {
                "Family vacation",
                "Medical appointment",
                "Personal matters",
                "Wedding ceremony",
                "Emergency family situation",
                "Planned medical procedure",
                "Mental health day",
                "Home renovation",
                "Child care responsibilities",
                "Religious observance"
            };
            
            String reason = reasons[random.nextInt(reasons.length)];
            
            LeaveRequest request = new LeaveRequest(employee, leaveType, startDate, endDate, reason);
            
            // Randomly set status and review data for some requests
            double statusRand = random.nextDouble();
            if (statusRand < 0.6) {
                request.setStatus(LeaveRequest.LeaveStatus.PENDING);
            } else if (statusRand < 0.8) {
                request.setStatus(LeaveRequest.LeaveStatus.APPROVED);
                request.setReviewedAt(LocalDateTime.now().minusDays(random.nextInt(5)));
                request.setReviewComments("Approved - adequate coverage arranged");
            } else {
                request.setStatus(LeaveRequest.LeaveStatus.REJECTED);
                request.setReviewedAt(LocalDateTime.now().minusDays(random.nextInt(3)));
                request.setReviewComments("Rejected - insufficient staffing during requested period");
            }
            
            // Set applied date to sometime in the past
            request.setAppliedAt(LocalDateTime.now().minusDays(random.nextInt(14)));
            
            mockRequests.add(leaveRequestRepository.save(request));
        }
        
        logger.info("Generated {} mock leave requests", mockRequests.size());
        return mockRequests;
    }
    
    private void ensureLeaveTypesExist() {
        if (leaveTypeRepository.count() == 0) {
            logger.info("Creating default leave types");
            
            leaveTypeRepository.saveAll(List.of(
                new LeaveType("Annual Leave", "Yearly vacation allowance", 25),
                new LeaveType("Sick Leave", "Medical leave for illness", 10),
                new LeaveType("Personal Leave", "Personal time off", 5),
                new LeaveType("Maternity Leave", "Maternity/Paternity leave", 90),
                new LeaveType("Emergency Leave", "Urgent family situations", 3),
                new LeaveType("Bereavement Leave", "Leave for family loss", 5)
            ));
        }
    }
    
    private Map<String, Object> calculateLeaveStats(List<LeaveRequest> requests) {
        Map<String, Object> stats = new HashMap<>();
        
        long totalRequests = requests.size();
        long pendingRequests = requests.stream()
            .filter(r -> r.getStatus() == LeaveRequest.LeaveStatus.PENDING)
            .count();
        long approvedRequests = requests.stream()
            .filter(r -> r.getStatus() == LeaveRequest.LeaveStatus.APPROVED)
            .count();
        long rejectedRequests = requests.stream()
            .filter(r -> r.getStatus() == LeaveRequest.LeaveStatus.REJECTED)
            .count();
        
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        long thisMonthRequests = requests.stream()
            .filter(r -> r.getAppliedAt().isAfter(startOfMonth))
            .count();
        
        stats.put("totalRequests", totalRequests);
        stats.put("pendingRequests", pendingRequests);
        stats.put("approvedRequests", approvedRequests);
        stats.put("rejectedRequests", rejectedRequests);
        stats.put("thisMonthRequests", thisMonthRequests);
        
        return stats;
    }
    
    private Map<String, Object> convertToDTO(LeaveRequest request) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", request.getId());
        dto.put("employeeId", request.getEmployee().getId());
        dto.put("employeeName", request.getEmployee().getFirstName() + " " + request.getEmployee().getLastName());
        dto.put("employeeEmail", request.getEmployee().getEmail());
        dto.put("leaveType", request.getLeaveType().getName());
        dto.put("startDate", request.getStartDate().toString());
        dto.put("endDate", request.getEndDate().toString());
        dto.put("totalDays", request.getTotalDays());
        dto.put("reason", request.getReason());
        dto.put("status", request.getStatus().toString().toLowerCase());
        dto.put("urgency", request.getUrgency().toString().toLowerCase());
        dto.put("appliedDate", request.getAppliedAt().toLocalDate().toString());
        
        if (request.getReviewedBy() != null) {
            dto.put("reviewedBy", request.getReviewedBy().getFirstName() + " " + request.getReviewedBy().getLastName());
        }
        if (request.getReviewedAt() != null) {
            dto.put("reviewedDate", request.getReviewedAt().toLocalDate().toString());
        }
        if (request.getReviewComments() != null) {
            dto.put("reviewComments", request.getReviewComments());
        }
        
        return dto;
    }
}
