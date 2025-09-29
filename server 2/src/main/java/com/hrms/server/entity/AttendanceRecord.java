package com.hrms.server.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "attendance_records")
public class AttendanceRecord {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private User employee;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @Column(name = "check_in_time")
    private LocalTime checkInTime;
    
    @Column(name = "check_out_time")
    private LocalTime checkOutTime;
    
    @Column(name = "total_hours")
    private Double totalHours;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status = AttendanceStatus.PRESENT;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Constructors
    public AttendanceRecord() {}
    
    public AttendanceRecord(User employee, LocalDate date, LocalTime checkIn, LocalTime checkOut) {
        this.employee = employee;
        this.date = date;
        this.checkInTime = checkIn;
        this.checkOutTime = checkOut;
        this.calculateHours();
    }
    
    public void calculateHours() {
        if (checkInTime != null && checkOutTime != null) {
            this.totalHours = (checkOutTime.toSecondOfDay() - checkInTime.toSecondOfDay()) / 3600.0;
        }
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getEmployee() { return employee; }
    public void setEmployee(User employee) { this.employee = employee; }
    
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    
    public LocalTime getCheckInTime() { return checkInTime; }
    public void setCheckInTime(LocalTime checkInTime) { 
        this.checkInTime = checkInTime;
        calculateHours();
    }
    
    public LocalTime getCheckOutTime() { return checkOutTime; }
    public void setCheckOutTime(LocalTime checkOutTime) { 
        this.checkOutTime = checkOutTime;
        calculateHours();
    }
    
    public Double getTotalHours() { return totalHours; }
    public void setTotalHours(Double totalHours) { this.totalHours = totalHours; }
    
    public AttendanceStatus getStatus() { return status; }
    public void setStatus(AttendanceStatus status) { this.status = status; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    
    public enum AttendanceStatus {
        PRESENT, ABSENT, LATE, HALF_DAY, HOLIDAY
    }
}