package com.hrms.server.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payroll_records")
public class PayrollRecord {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private User employee;
    
    @Column(name = "pay_period", nullable = false)
    private String payPeriod; // YYYY-MM format
    
    @Column(name = "base_salary", nullable = false, precision = 15, scale = 2)
    private BigDecimal baseSalary;
    
    @Column(name = "overtime_amount", precision = 15, scale = 2)
    private BigDecimal overtimeAmount = BigDecimal.ZERO;
    
    @Column(name = "bonuses", precision = 15, scale = 2)
    private BigDecimal bonuses = BigDecimal.ZERO;
    
    @Column(name = "tax_deductions", precision = 15, scale = 2)
    private BigDecimal taxDeductions = BigDecimal.ZERO;
    
    @Column(name = "other_deductions", precision = 15, scale = 2)
    private BigDecimal otherDeductions = BigDecimal.ZERO;
    
    @Column(name = "total_deductions", precision = 15, scale = 2)
    private BigDecimal totalDeductions = BigDecimal.ZERO;
    
    @Column(name = "net_salary", nullable = false, precision = 15, scale = 2)
    private BigDecimal netSalary;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PayrollStatus status = PayrollStatus.DRAFT;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "processed_at")
    private LocalDateTime processedAt;
    
    @Column(name = "paid_at")
    private LocalDateTime paidAt;
    
    // Constructors
    public PayrollRecord() {}
    
    public PayrollRecord(User employee, String payPeriod, BigDecimal baseSalary) {
        this.employee = employee;
        this.payPeriod = payPeriod;
        this.baseSalary = baseSalary;
        this.calculateNetSalary();
    }
    
    // Calculate net salary based on earnings and deductions
    public void calculateNetSalary() {
        BigDecimal totalEarnings = baseSalary.add(overtimeAmount).add(bonuses);
        this.totalDeductions = taxDeductions.add(otherDeductions);
        this.netSalary = totalEarnings.subtract(totalDeductions);
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getEmployee() { return employee; }
    public void setEmployee(User employee) { this.employee = employee; }
    
    public String getPayPeriod() { return payPeriod; }
    public void setPayPeriod(String payPeriod) { this.payPeriod = payPeriod; }
    
    public BigDecimal getBaseSalary() { return baseSalary; }
    public void setBaseSalary(BigDecimal baseSalary) { 
        this.baseSalary = baseSalary;
        calculateNetSalary();
    }
    
    public BigDecimal getOvertimeAmount() { return overtimeAmount; }
    public void setOvertimeAmount(BigDecimal overtimeAmount) { 
        this.overtimeAmount = overtimeAmount;
        calculateNetSalary();
    }
    
    public BigDecimal getBonuses() { return bonuses; }
    public void setBonuses(BigDecimal bonuses) { 
        this.bonuses = bonuses;
        calculateNetSalary();
    }
    
    public BigDecimal getTaxDeductions() { return taxDeductions; }
    public void setTaxDeductions(BigDecimal taxDeductions) { 
        this.taxDeductions = taxDeductions;
        calculateNetSalary();
    }
    
    public BigDecimal getOtherDeductions() { return otherDeductions; }
    public void setOtherDeductions(BigDecimal otherDeductions) { 
        this.otherDeductions = otherDeductions;
        calculateNetSalary();
    }
    
    public BigDecimal getTotalDeductions() { return totalDeductions; }
    public void setTotalDeductions(BigDecimal totalDeductions) { this.totalDeductions = totalDeductions; }
    
    public BigDecimal getNetSalary() { return netSalary; }
    public void setNetSalary(BigDecimal netSalary) { this.netSalary = netSalary; }
    
    public PayrollStatus getStatus() { return status; }
    public void setStatus(PayrollStatus status) { this.status = status; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }
    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }
    
    public enum PayrollStatus {
        DRAFT, PROCESSED, PAID
    }
}
