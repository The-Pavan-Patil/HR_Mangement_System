package com.hrms.server.service;

import com.hrms.server.entity.PayrollRecord;
import com.hrms.server.entity.User;
import com.hrms.server.exception.BadRequestException;
import com.hrms.server.exception.ResourceNotFoundException;
import com.hrms.server.repository.PayrollRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
@Transactional
public class PayrollService {
    
    private static final Logger logger = LoggerFactory.getLogger(PayrollService.class);
    private final Random random = new Random();
    
    @Autowired
    private PayrollRepository payrollRepository;
    
    @Autowired
    private UserService userService;
    
    public Map<String, Object> getPayrollRecords(String period) {
        logger.info("Fetching payroll records for period: {}", period);
        
        List<PayrollRecord> records = payrollRepository.findByPayPeriodOrderByEmployeeLastName(period);
        
        // Calculate summary
        Map<String, Object> summary = calculatePayrollSummary(records);
        
        // Convert to DTOs
        List<Map<String, Object>> recordDTOs = records.stream()
            .map(this::convertToDTO)
            .toList();
        
        Map<String, Object> result = new HashMap<>();
        result.put("records", recordDTOs);
        result.put("summary", summary);
        
        logger.info("Found {} payroll records for period {}", records.size(), period);
        return result;
    }
    
    public List<PayrollRecord> generatePayrollForPeriod(String period) {
        logger.info("Generating payroll for period: {}", period);
        
        List<User> activeEmployees = userService.getNonAdminUsers(); // Exclude admins from payroll
        List<PayrollRecord> generatedRecords = new ArrayList<>();
        
        for (User employee : activeEmployees) {
            // Check if payroll already exists for this employee and period
            if (payrollRepository.existsByEmployeeAndPayPeriod(employee, period)) {
                logger.warn("Payroll already exists for employee {} in period {}", 
                           employee.getEmail(), period);
                continue;
            }
            
            // Generate mock payroll data
            BigDecimal baseSalary = generateBaseSalary(employee.getRole());
            PayrollRecord payroll = new PayrollRecord(employee, period, baseSalary);
            
            // Add mock overtime and bonuses
            payroll.setOvertimeAmount(generateRandomAmount(0, 2000));
            payroll.setBonuses(generateRandomAmount(0, 1000));
            
            // Calculate taxes (simplified calculation)
            BigDecimal grossSalary = baseSalary.add(payroll.getOvertimeAmount()).add(payroll.getBonuses());
            payroll.setTaxDeductions(grossSalary.multiply(BigDecimal.valueOf(0.22))); // 22% tax rate
            payroll.setOtherDeductions(generateRandomAmount(100, 500)); // Health insurance, etc.
            
            payroll.calculateNetSalary();
            
            PayrollRecord saved = payrollRepository.save(payroll);
            generatedRecords.add(saved);
        }
        
        logger.info("Generated {} payroll records for period {}", generatedRecords.size(), period);
        return generatedRecords;
    }
    
    public PayrollRecord processPayroll(Long payrollId) {
        logger.info("Processing payroll with ID: {}", payrollId);
        
        PayrollRecord payroll = payrollRepository.findById(payrollId)
            .orElseThrow(() -> new ResourceNotFoundException("Payroll record not found with ID: " + payrollId));
        
        if (payroll.getStatus() != PayrollRecord.PayrollStatus.DRAFT) {
            throw new BadRequestException("Only draft payrolls can be processed");
        }
        
        payroll.setStatus(PayrollRecord.PayrollStatus.PROCESSED);
        payroll.setProcessedAt(LocalDateTime.now());
        
        PayrollRecord processed = payrollRepository.save(payroll);
        logger.info("Payroll {} processed successfully for employee {}", 
                   payrollId, payroll.getEmployee().getEmail());
        
        return processed;
    }
    
    public PayrollRecord markAsPaid(Long payrollId) {
        logger.info("Marking payroll {} as paid", payrollId);
        
        PayrollRecord payroll = payrollRepository.findById(payrollId)
            .orElseThrow(() -> new ResourceNotFoundException("Payroll record not found with ID: " + payrollId));
        
        if (payroll.getStatus() != PayrollRecord.PayrollStatus.PROCESSED) {
            throw new BadRequestException("Only processed payrolls can be marked as paid");
        }
        
        payroll.setStatus(PayrollRecord.PayrollStatus.PAID);
        payroll.setPaidAt(LocalDateTime.now());
        
        PayrollRecord paid = payrollRepository.save(payroll);
        logger.info("Payroll {} marked as paid for employee {}", 
                   payrollId, payroll.getEmployee().getEmail());
        
        return paid;
    }
    
    private Map<String, Object> calculatePayrollSummary(List<PayrollRecord> records) {
        Map<String, Object> summary = new HashMap<>();
        
        BigDecimal totalGross = records.stream()
            .map(r -> r.getBaseSalary().add(r.getOvertimeAmount()).add(r.getBonuses()))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalDeductions = records.stream()
            .map(PayrollRecord::getTotalDeductions)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalNet = records.stream()
            .map(PayrollRecord::getNetSalary)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        long pendingCount = records.stream()
            .filter(r -> r.getStatus() == PayrollRecord.PayrollStatus.DRAFT)
            .count();
        
        long processedCount = records.stream()
            .filter(r -> r.getStatus() != PayrollRecord.PayrollStatus.DRAFT)
            .count();
        
        summary.put("totalEmployees", records.size());
        summary.put("totalGross", totalGross);
        summary.put("totalDeductions", totalDeductions);
        summary.put("totalNet", totalNet);
        summary.put("pendingPayrolls", pendingCount);
        summary.put("processedPayrolls", processedCount);
        
        return summary;
    }
    
    private Map<String, Object> convertToDTO(PayrollRecord payroll) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", payroll.getId());
        dto.put("employeeId", payroll.getEmployee().getId());
        dto.put("employeeName", payroll.getEmployee().getFirstName() + " " + payroll.getEmployee().getLastName());
        dto.put("email", payroll.getEmployee().getEmail());
        dto.put("period", payroll.getPayPeriod());
        dto.put("baseSalary", payroll.getBaseSalary());
        dto.put("overtime", payroll.getOvertimeAmount());
        dto.put("bonuses", payroll.getBonuses());
        dto.put("deductions", payroll.getTotalDeductions());
        dto.put("taxes", payroll.getTaxDeductions());
        dto.put("netSalary", payroll.getNetSalary());
        dto.put("status", payroll.getStatus().toString().toLowerCase());
        dto.put("processedDate", payroll.getCreatedAt().toString());
        if (payroll.getPaidAt() != null) {
            dto.put("paidDate", payroll.getPaidAt().toString());
        }
        return dto;
    }
    
    private BigDecimal generateBaseSalary(User.Role role) {
        // Generate realistic salaries based on role
        return switch (role) {
            case EMPLOYEE -> BigDecimal.valueOf(50000 + random.nextInt(30000));
            case MANAGER -> BigDecimal.valueOf(80000 + random.nextInt(40000));
            case HR -> BigDecimal.valueOf(60000 + random.nextInt(25000));
            case RECRUITER -> BigDecimal.valueOf(55000 + random.nextInt(20000));
            default -> BigDecimal.valueOf(45000 + random.nextInt(15000));
        };
    }
    
    private BigDecimal generateRandomAmount(int min, int max) {
        return BigDecimal.valueOf(min + random.nextInt(max - min + 1));
    }
}