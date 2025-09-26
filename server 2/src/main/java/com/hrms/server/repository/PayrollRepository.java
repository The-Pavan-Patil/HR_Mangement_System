package com.hrms.server.repository;

import com.hrms.server.entity.PayrollRecord;
import com.hrms.server.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRepository extends JpaRepository<PayrollRecord, Long> {
    
    List<PayrollRecord> findByPayPeriodOrderByEmployeeLastName(String payPeriod);
    
    Optional<PayrollRecord> findByEmployeeAndPayPeriod(User employee, String payPeriod);
    
    List<PayrollRecord> findByStatus(PayrollRecord.PayrollStatus status);
    
    @Query("SELECT pr FROM PayrollRecord pr WHERE pr.payPeriod = :period AND pr.status = :status")
    List<PayrollRecord> findByPayPeriodAndStatus(@Param("period") String period, 
                                                @Param("status") PayrollRecord.PayrollStatus status);
    
    @Query("SELECT COUNT(pr) FROM PayrollRecord pr WHERE pr.payPeriod = :period")
    long countByPayPeriod(@Param("period") String period);
    
    @Query("SELECT SUM(pr.netSalary) FROM PayrollRecord pr WHERE pr.payPeriod = :period")
    java.math.BigDecimal sumNetSalaryByPayPeriod(@Param("period") String period);
    
    boolean existsByEmployeeAndPayPeriod(User employee, String payPeriod);
}
