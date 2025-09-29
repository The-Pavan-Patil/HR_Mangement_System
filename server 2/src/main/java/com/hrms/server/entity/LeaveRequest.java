package com.hrms.server.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leave_requests")
public class LeaveRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private User employee;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leave_type_id", nullable = false)
    private LeaveType leaveType;
    
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;
    
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;
    
    @Column(name = "total_days", nullable = false)
    private Integer totalDays;
    
    @Column(columnDefinition = "TEXT")
    private String reason;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeaveStatus status = LeaveStatus.PENDING;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority urgency = Priority.MEDIUM;
    
    @CreationTimestamp
    @Column(name = "applied_at")
    private LocalDateTime appliedAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;
    
    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;
    
    @Column(name = "review_comments", columnDefinition = "TEXT")
    private String reviewComments;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public LeaveRequest() {}
    
    public LeaveRequest(User employee, LeaveType leaveType, LocalDate startDate, LocalDate endDate, String reason) {
        this.employee = employee;
        this.leaveType = leaveType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.reason = reason;
        this.totalDays = calculateTotalDays(startDate, endDate);
        this.urgency = determineUrgency(startDate);
    }
    
    private Integer calculateTotalDays(LocalDate start, LocalDate end) {
        return (int) (end.toEpochDay() - start.toEpochDay() + 1);
    }
    
    private Priority determineUrgency(LocalDate startDate) {
        LocalDate now = LocalDate.now();
        long daysUntilLeave = startDate.toEpochDay() - now.toEpochDay();
        
        if (daysUntilLeave <= 3) return Priority.HIGH;
        if (daysUntilLeave <= 7) return Priority.MEDIUM;
        return Priority.LOW;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getEmployee() { return employee; }
    public void setEmployee(User employee) { this.employee = employee; }
    
    public LeaveType getLeaveType() { return leaveType; }
    public void setLeaveType(LeaveType leaveType) { this.leaveType = leaveType; }
    
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { 
        this.startDate = startDate;
        if (this.endDate != null) {
            this.totalDays = calculateTotalDays(startDate, this.endDate);
        }
        this.urgency = determineUrgency(startDate);
    }
    
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { 
        this.endDate = endDate;
        if (this.startDate != null) {
            this.totalDays = calculateTotalDays(this.startDate, endDate);
        }
    }
    
    public Integer getTotalDays() { return totalDays; }
    public void setTotalDays(Integer totalDays) { this.totalDays = totalDays; }
    
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    
    public LeaveStatus getStatus() { return status; }
    public void setStatus(LeaveStatus status) { this.status = status; }
    
    public Priority getUrgency() { return urgency; }
    public void setUrgency(Priority urgency) { this.urgency = urgency; }
    
    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }
    
    public User getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(User reviewedBy) { this.reviewedBy = reviewedBy; }
    
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
    
    public String getReviewComments() { return reviewComments; }
    public void setReviewComments(String reviewComments) { this.reviewComments = reviewComments; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public enum LeaveStatus {
        PENDING, APPROVED, REJECTED, CANCELLED
    }
    
    public enum Priority {
        LOW, MEDIUM, HIGH
    }
}