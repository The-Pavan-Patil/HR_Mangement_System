package com.hrms.server.service;

import com.hrms.server.entity.*;
import com.hrms.server.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class EmployeeDashboardService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmployeeDashboardService.class);
    private final Random random = new Random();
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private PayrollRepository payrollRepository;
    
    @Autowired
    private LeaveRequestRepository leaveRequestRepository;
    
    @Autowired
    private EmployeeDocumentRepository documentRepository;
    
    @Autowired
    private AttendanceRecordRepository attendanceRepository;
    
    public Map<String, Object> getEmployeeDashboardData(String firebaseUid) {
        logger.info("Fetching complete dashboard data for employee: {}", firebaseUid);
        
        User employee = userService.findByFirebaseUid(firebaseUid);
        
        Map<String, Object> dashboardData = new HashMap<>();
        
        // Personal Details
        dashboardData.put("personalDetails", getPersonalDetails(employee));
        
        // Salary Information
        dashboardData.put("salary", getSalaryInfo(employee));
        
        // Payroll Records
        dashboardData.put("payrolls", getPayrollRecords(employee));
        
        // Leave Requests
        dashboardData.put("leaveRequests", getLeaveRequests(employee));
        
        // Leave Balance
        dashboardData.put("leaveBalance", getLeaveBalance(employee));
        
        // Documents
        dashboardData.put("documents", getDocuments(employee));
        
        // Attendance
        dashboardData.put("attendance", getAttendanceData(employee));
        
        logger.info("Dashboard data compiled successfully for employee: {}", employee.getEmail());
        return dashboardData;
    }
    
    private Map<String, Object> getPersonalDetails(User employee) {
        Map<String, Object> details = new HashMap<>();
        details.put("employeeId", "EMP-" + String.format("%05d", employee.getId()));
        details.put("phone", generateMockPhone());
        details.put("address", "123 Main Street, City, State 12345");
        details.put("dateOfBirth", LocalDate.of(1990, 1, 15).toString());
        
        Map<String, String> emergencyContact = new HashMap<>();
        emergencyContact.put("name", "Emergency Contact Name");
        emergencyContact.put("phone", generateMockPhone());
        emergencyContact.put("relationship", "Spouse");
        details.put("emergencyContact", emergencyContact);
        
        details.put("department", getDepartmentByRole(employee.getRole()));
        details.put("position", getPositionByRole(employee.getRole()));
        details.put("joinDate", employee.getCreatedAt().toLocalDate().toString());
        details.put("manager", "Manager Name");
        
        return details;
    }
    
    private Map<String, Object> getSalaryInfo(User employee) {
        Map<String, Object> salary = new HashMap<>();
        salary.put("currentSalary", generateBaseSalary(employee.getRole()));
        salary.put("currency", "USD");
        salary.put("nextReviewDate", LocalDate.now().plusMonths(6).toString());
        salary.put("salaryGrade", "Grade " + (3 + random.nextInt(3)));
        return salary;
    }
    
    private List<Map<String, Object>> getPayrollRecords(User employee) {
        List<PayrollRecord> payrolls = payrollRepository.findByEmployee(employee);
        
        // If no payrolls exist, generate mock data
        if (payrolls.isEmpty()) {
            return generateMockPayrolls(employee);
        }
        
        return payrolls.stream()
            .map(this::convertPayrollToDTO)
            .collect(Collectors.toList());
    }
    
    private List<Map<String, Object>> getLeaveRequests(User employee) {
        List<LeaveRequest> requests = leaveRequestRepository.findByEmployeeOrderByAppliedAtDesc(employee);
        
        // If no leave requests, generate mock data
        if (requests.isEmpty()) {
            return generateMockLeaveRequests(employee);
        }
        
        return requests.stream()
            .map(this::convertLeaveRequestToDTO)
            .collect(Collectors.toList());
    }
    
    private Map<String, Map<String, Integer>> getLeaveBalance(User employee) {
        Map<String, Map<String, Integer>> balance = new HashMap<>();
        
        // Annual Leave
        Map<String, Integer> annualLeave = new HashMap<>();
        annualLeave.put("total", 25);
        annualLeave.put("used", random.nextInt(10));
        annualLeave.put("remaining", 25 - annualLeave.get("used"));
        balance.put("annualLeave", annualLeave);
        
        // Sick Leave
        Map<String, Integer> sickLeave = new HashMap<>();
        sickLeave.put("total", 10);
        sickLeave.put("used", random.nextInt(5));
        sickLeave.put("remaining", 10 - sickLeave.get("used"));
        balance.put("sickLeave", sickLeave);
        
        // Personal Leave
        Map<String, Integer> personalLeave = new HashMap<>();
        personalLeave.put("total", 5);
        personalLeave.put("used", random.nextInt(3));
        personalLeave.put("remaining", 5 - personalLeave.get("used"));
        balance.put("personalLeave", personalLeave);
        
        return balance;
    }
    
    private List<Map<String, Object>> getDocuments(User employee) {
        List<EmployeeDocument> documents = documentRepository.findByEmployeeOrderByUploadDateDesc(employee);
        
        // If no documents, generate mock data
        if (documents.isEmpty()) {
            return generateMockDocuments(employee);
        }
        
        return documents.stream()
            .map(this::convertDocumentToDTO)
            .collect(Collectors.toList());
    }
    
    private Map<String, Object> getAttendanceData(User employee) {
        Map<String, Object> attendance = new HashMap<>();
        
        LocalDate now = LocalDate.now();
        LocalDate startOfMonth = now.withDayOfMonth(1);
        
        List<AttendanceRecord> records = attendanceRepository
            .findByEmployeeAndDateBetweenOrderByDateDesc(employee, startOfMonth, now);
        
        // If no records, generate mock data
        if (records.isEmpty()) {
            records = generateMockAttendance(employee, startOfMonth, now);
        }
        
        // Calculate this month stats
        Map<String, Integer> thisMonth = new HashMap<>();
        thisMonth.put("totalDays", now.getDayOfMonth());
        thisMonth.put("present", (int) records.stream()
            .filter(r -> r.getStatus() == AttendanceRecord.AttendanceStatus.PRESENT).count());
        thisMonth.put("absent", (int) records.stream()
            .filter(r -> r.getStatus() == AttendanceRecord.AttendanceStatus.ABSENT).count());
        thisMonth.put("late", (int) records.stream()
            .filter(r -> r.getStatus() == AttendanceRecord.AttendanceStatus.LATE).count());
        
        attendance.put("thisMonth", thisMonth);
        
        // Recent records (last 10 days)
        List<Map<String, Object>> recentRecords = records.stream()
            .limit(10)
            .map(this::convertAttendanceToDTO)
            .collect(Collectors.toList());
        
        attendance.put("recentRecords", recentRecords);
        
        return attendance;
    }
    
    // Helper methods for mock data generation
    
    private List<Map<String, Object>> generateMockPayrolls(User employee) {
        List<Map<String, Object>> payrolls = new ArrayList<>();
        
        for (int i = 0; i < 6; i++) {
            LocalDate period = LocalDate.now().minusMonths(i);
            String periodStr = period.getYear() + "-" + String.format("%02d", period.getMonthValue());
            
            Map<String, Object> payroll = new HashMap<>();
            payroll.put("id", (long) (i + 1));
            payroll.put("period", periodStr);
            
            double baseSalary = generateBaseSalary(employee.getRole());
            double overtime = random.nextInt(2000);
            double bonuses = random.nextInt(1000);
            double taxes = (baseSalary + overtime + bonuses) * 0.22;
            double otherDeductions = 200 + random.nextInt(300);
            double deductions = taxes + otherDeductions;
            double netSalary = baseSalary + overtime + bonuses - deductions;
            
            payroll.put("baseSalary", baseSalary);
            payroll.put("overtime", overtime);
            payroll.put("bonuses", bonuses);
            payroll.put("taxes", taxes);
            payroll.put("deductions", deductions);
            payroll.put("netSalary", netSalary);
            payroll.put("status", i == 0 ? "processed" : "paid");
            
            if (i > 0) {
                payroll.put("paidDate", period.toString());
            }
            
            payrolls.add(payroll);
        }
        
        return payrolls;
    }
    
    private List<Map<String, Object>> generateMockLeaveRequests(User employee) {
        List<Map<String, Object>> requests = new ArrayList<>();
        
        String[] leaveTypes = {"Annual Leave", "Sick Leave", "Personal Leave"};
        String[] statuses = {"pending", "approved", "rejected"};
        String[] reasons = {"Family vacation", "Medical appointment", "Personal matters"};
        
        for (int i = 0; i < 5; i++) {
            Map<String, Object> request = new HashMap<>();
            request.put("id", (long) (i + 1));
            request.put("leaveType", leaveTypes[random.nextInt(leaveTypes.length)]);
            
            LocalDate startDate = LocalDate.now().plusDays(random.nextInt(30));
            LocalDate endDate = startDate.plusDays(random.nextInt(5) + 1);
            
            request.put("startDate", startDate.toString());
            request.put("endDate", endDate.toString());
            request.put("totalDays", (int) (endDate.toEpochDay() - startDate.toEpochDay() + 1));
            request.put("reason", reasons[random.nextInt(reasons.length)]);
            request.put("status", statuses[random.nextInt(statuses.length)]);
            request.put("appliedDate", LocalDate.now().minusDays(random.nextInt(14)).toString());
            
            if (!request.get("status").equals("pending")) {
                request.put("reviewComments", "Review comments here");
            }
            
            requests.add(request);
        }
        
        return requests;
    }
    
    private List<Map<String, Object>> generateMockDocuments(User employee) {
        List<Map<String, Object>> documents = new ArrayList<>();
        
        String[] docNames = {
            "Employment Contract.pdf",
            "ID Proof.pdf",
            "Address Proof.pdf",
            "Tax Documents.pdf",
            "Resume.pdf"
        };
        
        String[] docTypes = {"Contract", "Identity", "Address", "Tax", "Resume"};
        
        for (int i = 0; i < docNames.length; i++) {
            Map<String, Object> doc = new HashMap<>();
            doc.put("id", (long) (i + 1));
            doc.put("name", docNames[i]);
            doc.put("type", docTypes[i]);
            doc.put("uploadDate", LocalDate.now().minusDays(random.nextInt(365)).toString());
            doc.put("size", (100 + random.nextInt(900)) + " KB");
            doc.put("downloadUrl", "/api/documents/" + (i + 1));
            documents.add(doc);
        }
        
        return documents;
    }
    
    private List<AttendanceRecord> generateMockAttendance(User employee, LocalDate start, LocalDate end) {
        List<AttendanceRecord> records = new ArrayList<>();
        
        for (LocalDate date = start; !date.isAfter(end); date = date.plusDays(1)) {
            // Skip weekends
            if (date.getDayOfWeek().getValue() >= 6) continue;
            
            AttendanceRecord record = new AttendanceRecord();
            record.setEmployee(employee);
            record.setDate(date);
            
            if (random.nextDouble() < 0.95) { // 95% attendance
                LocalTime checkIn = LocalTime.of(9, random.nextInt(30));
                LocalTime checkOut = LocalTime.of(17, 30 + random.nextInt(30));
                
                record.setCheckInTime(checkIn);
                record.setCheckOutTime(checkOut);
                record.setStatus(checkIn.isAfter(LocalTime.of(9, 15)) ? 
                    AttendanceRecord.AttendanceStatus.LATE : 
                    AttendanceRecord.AttendanceStatus.PRESENT);
                record.calculateHours();
            } else {
                record.setStatus(AttendanceRecord.AttendanceStatus.ABSENT);
            }
            
            records.add(attendanceRepository.save(record));
        }
        
        return records;
    }
    
    // DTO Conversion methods
    
    private Map<String, Object> convertPayrollToDTO(PayrollRecord payroll) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", payroll.getId());
        dto.put("period", payroll.getPayPeriod());
        dto.put("baseSalary", payroll.getBaseSalary());
        dto.put("overtime", payroll.getOvertimeAmount());
        dto.put("bonuses", payroll.getBonuses());
        dto.put("taxes", payroll.getTaxDeductions());
        dto.put("deductions", payroll.getTotalDeductions());
        dto.put("netSalary", payroll.getNetSalary());
        dto.put("status", payroll.getStatus().toString().toLowerCase());
        if (payroll.getPaidAt() != null) {
            dto.put("paidDate", payroll.getPaidAt().toLocalDate().toString());
        }
        return dto;
    }
    
    private Map<String, Object> convertLeaveRequestToDTO(LeaveRequest request) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", request.getId());
        dto.put("leaveType", request.getLeaveType().getName());
        dto.put("startDate", request.getStartDate().toString());
        dto.put("endDate", request.getEndDate().toString());
        dto.put("totalDays", request.getTotalDays());
        dto.put("reason", request.getReason());
        dto.put("status", request.getStatus().toString().toLowerCase());
        dto.put("appliedDate", request.getAppliedAt().toLocalDate().toString());
        if (request.getReviewComments() != null) {
            dto.put("reviewComments", request.getReviewComments());
        }
        return dto;
    }
    
    private Map<String, Object> convertDocumentToDTO(EmployeeDocument document) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", document.getId());
        dto.put("name", document.getName());
        dto.put("type", document.getDocumentType());
        dto.put("uploadDate", document.getUploadDate().toLocalDate().toString());
        dto.put("size", document.getFileSize());
        dto.put("downloadUrl", "/api/documents/" + document.getId());
        return dto;
    }
    
    private Map<String, Object> convertAttendanceToDTO(AttendanceRecord record) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("date", record.getDate().toString());
        dto.put("checkIn", record.getCheckInTime() != null ? record.getCheckInTime().toString() : null);
        dto.put("checkOut", record.getCheckOutTime() != null ? record.getCheckOutTime().toString() : null);
        dto.put("totalHours", record.getTotalHours());
        dto.put("status", record.getStatus().toString().toLowerCase());
        return dto;
    }
    
    private double generateBaseSalary(User.Role role) {
        return switch (role) {
            case EMPLOYEE -> 50000 + random.nextInt(30000);
            case MANAGER -> 80000 + random.nextInt(40000);
            case HR -> 60000 + random.nextInt(25000);
            case RECRUITER -> 55000 + random.nextInt(20000);
            default -> 45000 + random.nextInt(15000);
        };
    }
    
    private String getDepartmentByRole(User.Role role) {
        return switch (role) {
            case EMPLOYEE -> "Engineering";
            case MANAGER -> "Management";
            case HR -> "Human Resources";
            case RECRUITER -> "Talent Acquisition";
            default -> "General";
        };
    }
    
    private String getPositionByRole(User.Role role) {
        return switch (role) {
            case EMPLOYEE -> "Software Engineer";
            case MANAGER -> "Team Manager";
            case HR -> "HR Manager";
            case RECRUITER -> "Senior Recruiter";
            default -> "Staff";
        };
    }
    
    private String generateMockPhone() {
        return "+1 " + (200 + random.nextInt(800)) + "-" + 
               (100 + random.nextInt(900)) + "-" + (1000 + random.nextInt(9000));
    }
}