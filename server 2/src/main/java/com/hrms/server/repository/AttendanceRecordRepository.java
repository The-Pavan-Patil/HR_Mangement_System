package com.hrms.server.repository;

import com.hrms.server.entity.AttendanceRecord;
import com.hrms.server.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    
    List<AttendanceRecord> findByEmployeeAndDateBetweenOrderByDateDesc(
        User employee, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT COUNT(ar) FROM AttendanceRecord ar WHERE ar.employee = :employee " +
           "AND ar.date BETWEEN :startDate AND :endDate AND ar.status = :status")
    long countByEmployeeAndDateRangeAndStatus(@Param("employee") User employee,
                                              @Param("startDate") LocalDate startDate,
                                              @Param("endDate") LocalDate endDate,
                                              @Param("status") AttendanceRecord.AttendanceStatus status);
}