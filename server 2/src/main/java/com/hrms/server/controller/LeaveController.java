package com.hrms.server.controller;

import com.hrms.server.dto.response.ApiResponse;
import com.hrms.server.entity.LeaveRequest;
import com.hrms.server.service.LeaveService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/leave")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class LeaveController {
    
    private static final Logger logger = LoggerFactory.getLogger(LeaveController.class);
    
    @Autowired
    private LeaveService leaveService;
    
    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllLeaveRequests() {
        logger.info("Fetching all leave requests for HR review");
        
        try {
            Map<String, Object> data = leaveService.getAllLeaveRequests();
            
            ApiResponse<Map<String, Object>> response = ApiResponse.success(
                "Leave requests retrieved successfully", 
                data
            );
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            logger.error("Error fetching leave requests: {}", e.getMessage(), e);
            
            ApiResponse<Map<String, Object>> errorResponse = ApiResponse.error(
                "Failed to retrieve leave requests: " + e.getMessage()
            );
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PutMapping("/requests/{id}/approve")
    public ResponseEntity<ApiResponse<Map<String, Object>>> approveLeaveRequest(
            @PathVariable Long id,
            @RequestBody Map<String, String> reviewData) {
        
        logger.info("Approving leave request with ID: {}", id);
        
        try {
            String reviewComments = reviewData.get("reviewComments");
            LeaveRequest approved = leaveService.approveLeaveRequest(id, reviewComments);
            
            Map<String, Object> responseData = Map.of(
                "id", approved.getId(),
                "status", approved.getStatus().toString().toLowerCase(),
                "reviewComments", approved.getReviewComments() != null ? approved.getReviewComments() : ""
            );
            
            ApiResponse<Map<String, Object>> response = ApiResponse.success(
                "Leave request approved successfully", 
                responseData
            );
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            logger.error("Error approving leave request {}: {}", id, e.getMessage(), e);
            
            ApiResponse<Map<String, Object>> errorResponse = ApiResponse.error(
                "Failed to approve leave request: " + e.getMessage()
            );
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PutMapping("/requests/{id}/reject")
    public ResponseEntity<ApiResponse<Map<String, Object>>> rejectLeaveRequest(
            @PathVariable Long id,
            @RequestBody Map<String, String> reviewData) {
        
        logger.info("Rejecting leave request with ID: {}", id);
        
        try {
            String reviewComments = reviewData.get("reviewComments");
            LeaveRequest rejected = leaveService.rejectLeaveRequest(id, reviewComments);
            
            Map<String, Object> responseData = Map.of(
                "id", rejected.getId(),
                "status", rejected.getStatus().toString().toLowerCase(),
                "reviewComments", rejected.getReviewComments()
            );
            
            ApiResponse<Map<String, Object>> response = ApiResponse.success(
                "Leave request rejected successfully", 
                responseData
            );
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            logger.error("Error rejecting leave request {}: {}", id, e.getMessage(), e);
            
            ApiResponse<Map<String, Object>> errorResponse = ApiResponse.error(
                "Failed to reject leave request: " + e.getMessage()
            );
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }}}
    