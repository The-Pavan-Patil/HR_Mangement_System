package com.hrms.server.controller;

import com.hrms.server.dto.response.ApiResponse;
import com.hrms.server.entity.LeaveRequest;
import com.hrms.server.entity.User;
import com.hrms.server.service.EmployeeDashboardService;
import com.hrms.server.service.LeaveService;
import com.hrms.server.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/employee")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class EmployeeController {

    private static final Logger logger = LoggerFactory.getLogger(EmployeeController.class);

    @Autowired
    private EmployeeDashboardService employeeDashboardService;

    @Autowired
    private LeaveService leaveService;

    @Autowired
    private UserService userService;

    @GetMapping("/dashboard/{firebaseUid}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getEmployeeDashboard(@PathVariable String firebaseUid) {
        logger.info("Fetching dashboard data for employee: {}", firebaseUid);

        try {
            Map<String, Object> dashboardData = employeeDashboardService.getEmployeeDashboardData(firebaseUid);

            ApiResponse<Map<String, Object>> response = ApiResponse.success(
                "Employee dashboard data retrieved successfully",
                dashboardData
            );

            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {
            logger.error("Error fetching dashboard data for employee {}: {}", firebaseUid, e.getMessage(), e);

            ApiResponse<Map<String, Object>> errorResponse = ApiResponse.error(
                "Failed to retrieve employee dashboard data: " + e.getMessage()
            );
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/leave-request")
    public ResponseEntity<ApiResponse<Map<String, Object>>> submitLeaveRequest(@RequestBody Map<String, String> requestData) {
        logger.info("Submitting leave request");

        try {
            String employeeUid = requestData.get("employeeUid");
            String leaveType = requestData.get("leaveType");
            String startDate = requestData.get("startDate");
            String endDate = requestData.get("endDate");
            String reason = requestData.get("reason");

            if (employeeUid == null || leaveType == null || startDate == null || endDate == null || reason == null) {
                throw new IllegalArgumentException("All fields are required");
            }

            LeaveRequest leaveRequest = leaveService.submitLeaveRequest(employeeUid, leaveType, startDate, endDate, reason);

            Map<String, Object> responseData = Map.of(
                "id", leaveRequest.getId(),
                "status", leaveRequest.getStatus().toString().toLowerCase(),
                "message", "Leave request submitted successfully"
            );

            ApiResponse<Map<String, Object>> response = ApiResponse.success(
                "Leave request submitted successfully",
                responseData
            );

            return new ResponseEntity<>(response, HttpStatus.CREATED);

        } catch (Exception e) {
            logger.error("Error submitting leave request: {}", e.getMessage(), e);

            ApiResponse<Map<String, Object>> errorResponse = ApiResponse.error(
                "Failed to submit leave request: " + e.getMessage()
            );
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/personal-details/{firebaseUid}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updatePersonalDetails(
            @PathVariable String firebaseUid,
            @RequestBody Map<String, Object> personalData) {

        logger.info("Updating personal details for employee: {}", firebaseUid);

        try {
            String phone = (String) personalData.get("phone");
            String address = (String) personalData.get("address");
            String emergencyName = null;
            String emergencyPhone = null;
            String emergencyRelationship = null;
            @SuppressWarnings("unchecked")
            Map<String, Object> emergencyContact = (Map<String, Object>) personalData.get("emergencyContact");
            if (emergencyContact != null) {
                emergencyName = (String) emergencyContact.get("name");
                emergencyPhone = (String) emergencyContact.get("phone");
                emergencyRelationship = (String) emergencyContact.get("relationship");
            }

            User updatedUser = userService.updatePersonalDetails(firebaseUid, phone, address,
                emergencyName, emergencyPhone, emergencyRelationship);

            Map<String, Object> responseData = Map.of(
                "id", updatedUser.getId(),
                "message", "Personal details updated successfully"
            );

            ApiResponse<Map<String, Object>> response = ApiResponse.success(
                "Personal details updated successfully", 
                responseData
            );

            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {
            logger.error("Error updating personal details for employee {}: {}", firebaseUid, e.getMessage(), e);

            ApiResponse<Map<String, Object>> errorResponse = ApiResponse.error(
                "Failed to update personal details: " + e.getMessage()
            );
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/documents/{documentId}/download")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long documentId) {
        logger.info("Downloading document with ID: {}", documentId);

        try {
            // Mock PDF generation - in real implementation, retrieve from storage
            String pdfContent = "Mock PDF Document Content for Document ID: " + documentId;
            byte[] pdfBytes = pdfContent.getBytes();

            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header("Content-Disposition", "attachment; filename=document_" + documentId + ".pdf")
                .body(pdfBytes);

        } catch (Exception e) {
            logger.error("Error downloading document {}: {}", documentId, e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/payslip/{payrollId}/download")
    public ResponseEntity<byte[]> downloadPayslip(@PathVariable Long payrollId) {
        logger.info("Downloading payslip for payroll ID: {}", payrollId);

        try {
            // Mock PDF generation - in real implementation, retrieve from storage
            String pdfContent = "Mock PDF Payslip Content for Payroll ID: " + payrollId;
            byte[] pdfBytes = pdfContent.getBytes();

            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header("Content-Disposition", "attachment; filename=payslip_" + payrollId + ".pdf")
                .body(pdfBytes);

        } catch (Exception e) {
            logger.error("Error downloading payslip for payroll {}: {}", payrollId, e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
