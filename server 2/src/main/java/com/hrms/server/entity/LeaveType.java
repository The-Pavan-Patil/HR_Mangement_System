package com.hrms.server.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "leave_types")
public class LeaveType {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String name;
    
    private String description;
    
    @Column(name = "max_days_per_year")
    private Integer maxDaysPerYear;
    
    @Column(name = "carry_forward_allowed")
    private Boolean carryForwardAllowed = false;
    
    @Column(name = "requires_approval")
    private Boolean requiresApproval = true;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    // Constructors
    public LeaveType() {}
    
    public LeaveType(String name, String description, Integer maxDaysPerYear) {
        this.name = name;
        this.description = description;
        this.maxDaysPerYear = maxDaysPerYear;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Integer getMaxDaysPerYear() { return maxDaysPerYear; }
    public void setMaxDaysPerYear(Integer maxDaysPerYear) { this.maxDaysPerYear = maxDaysPerYear; }
    
    public Boolean getCarryForwardAllowed() { return carryForwardAllowed; }
    public void setCarryForwardAllowed(Boolean carryForwardAllowed) { this.carryForwardAllowed = carryForwardAllowed; }
    
    public Boolean getRequiresApproval() { return requiresApproval; }
    public void setRequiresApproval(Boolean requiresApproval) { this.requiresApproval = requiresApproval; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
}