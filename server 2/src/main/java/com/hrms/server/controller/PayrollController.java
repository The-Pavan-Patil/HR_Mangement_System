package com.hrms.server.controller;

import com.hrms.server.dto.response.ApiResponse;
import com.hrms.server.entity.PayrollRecord;
import com.hrms.server.service.PayrollService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payroll")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class PayrollController {
    
    private static final Logger logger = LoggerFactory.getLogger(PayrollController.class);
    
    @Autowired
    private PayrollService payrollService;
    
    @GetMapping("/records")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPayrollRecords(
            @RequestParam String period) {
        
        logger.info("Fetching payroll records for period: {}", period);
        
        try {
            Map<String, Object> data = payrollService.getPayrollRecords(period);
            
            ApiResponse<Map<String, Object>> response = ApiResponse.success(
                "Payroll records retrieved successfully", 
                data
            );
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            logger.error("Error fetching payroll records: {}", e.getMessage(), e);
            
            ApiResponse<Map<String, Object>> errorResponse = ApiResponse.error(
                "Failed to retrieve payroll records: " + e.getMessage()
            );
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> generatePayroll(
            @RequestBody Map<String, String> request) {
        
        String period = request.get("period");
        logger.info("Generating payroll for period: {}", period);
        
        try {
            List<PayrollRecord> records = payrollService.generatePayrollForPeriod(period);
            
            List<Map<String, Object>> recordDTOs = records.stream()
                .map(this::convertToSimpleDTO)
                .toList();
            
            ApiResponse<List<Map<String, Object>>> response = ApiResponse.success(
                "Payroll generated successfully for " + records.size() + " employees", 
                recordDTOs
            );
            
            return new ResponseEntity<>(response, HttpStatus.CREATED);
            
        } catch (Exception e) {
            logger.error("Error generating payroll: {}", e.getMessage(), e);
            
            ApiResponse<List<Map<String, Object>>> errorResponse = ApiResponse.error(
                "Failed to generate payroll: " + e.getMessage()
            );
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PutMapping("/{id}/process")
    public ResponseEntity<ApiResponse<Map<String, Object>>> processPayroll(@PathVariable Long id) {
        
        logger.info("Processing payroll with ID: {}", id);
        
        try {
            PayrollRecord processed = payrollService.processPayroll(id);
            
            ApiResponse<Map<String, Object>> response = ApiResponse.success(
                "Payroll processed successfully", 
                convertToSimpleDTO(processed)
            );
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            logger.error("Error processing payroll {}: {}", id, e.getMessage(), e);
            
            ApiResponse<Map<String, Object>> errorResponse = ApiResponse.error(
                "Failed to process payroll: " + e.getMessage()
            );
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @PutMapping("/{id}/paid")
    public ResponseEntity<ApiResponse<Map<String, Object>>> markAsPaid(@PathVariable Long id) {
        
        logger.info("Marking payroll {} as paid", id);
        
        try {
            PayrollRecord paid = payrollService.markAsPaid(id);
            
            ApiResponse<Map<String, Object>> response = ApiResponse.success(
                "Payroll marked as paid successfully", 
                convertToSimpleDTO(paid)
            );
            
            return new ResponseEntity<>(response, HttpStatus.OK);
            
        } catch (Exception e) {
            logger.error("Error marking payroll {} as paid: {}", id, e.getMessage(), e);
            
            ApiResponse<Map<String, Object>> errorResponse = ApiResponse.error(
                "Failed to mark payroll as paid: " + e.getMessage()
            );
            return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    @GetMapping("/{id}/payslip")
    public ResponseEntity<byte[]> downloadPayslip(@PathVariable Long id) {
        
        logger.info("Downloading payslip for payroll ID: {}", id);
        
        try {
            // Mock PDF generation - in real implementation, use a PDF library
            String pdfContent = "Mock PDF Payslip Content for Payroll ID: " + id;
            byte[] pdfBytes = pdfContent.getBytes();
            
            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header("Content-Disposition", "attachment; filename=payslip_" + id + ".pdf")
                .body(pdfBytes);
            
        } catch (Exception e) {
            logger.error("Error generating payslip for payroll {}: {}", id, e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
    private Map<String, Object> convertToSimpleDTO(PayrollRecord payroll) {
        return Map.of(
            "id", payroll.getId(),
            "employeeName", payroll.getEmployee().getFirstName() + " " + payroll.getEmployee().getLastName(),
            "period", payroll.getPayPeriod(),
            "netSalary", payroll.getNetSalary(),
            "status", payroll.getStatus().toString().toLowerCase()
        );
    }
}