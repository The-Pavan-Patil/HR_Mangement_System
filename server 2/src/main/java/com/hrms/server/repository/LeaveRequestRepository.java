package com.hrms.server.repository;

import com.hrms.server.entity.LeaveRequest;
import com.hrms.server.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    
    List<LeaveRequest> findByStatusOrderByAppliedAtDesc(LeaveRequest.LeaveStatus status);
    
    List<LeaveRequest> findByEmployeeOrderByAppliedAtDesc(User employee);
    
    List<LeaveRequest> findAllByOrderByAppliedAtDesc();
    
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.status = :status ORDER BY lr.urgency DESC, lr.appliedAt ASC")
    List<LeaveRequest> findByStatusOrderByUrgencyDesc(@Param("status") LeaveRequest.LeaveStatus status);
    
    @Query("SELECT COUNT(lr) FROM LeaveRequest lr WHERE lr.status = :status")
    long countByStatus(@Param("status") LeaveRequest.LeaveStatus status);
    
    @Query("SELECT COUNT(lr) FROM LeaveRequest lr WHERE lr.appliedAt >= :startDate")
    long countByAppliedAtAfter(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.urgency = :priority AND lr.status = :status")
    List<LeaveRequest> findByUrgencyAndStatus(@Param("priority") LeaveRequest.Priority priority, 
                                             @Param("status") LeaveRequest.LeaveStatus status);
}
