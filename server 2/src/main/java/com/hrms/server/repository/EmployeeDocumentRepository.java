package com.hrms.server.repository;

import com.hrms.server.entity.EmployeeDocument;
import com.hrms.server.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployeeDocumentRepository extends JpaRepository<EmployeeDocument, Long> {
    
    List<EmployeeDocument> findByEmployeeOrderByUploadDateDesc(User employee);
    
    List<EmployeeDocument> findByEmployeeAndDocumentType(User employee, String documentType);
}