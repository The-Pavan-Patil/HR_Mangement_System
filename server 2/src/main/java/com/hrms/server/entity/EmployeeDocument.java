package com.hrms.server.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "employee_documents")
public class EmployeeDocument {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private User employee;
    
    @Column(nullable = false)
    private String name;
    
    @Column(name = "document_type", nullable = false)
    private String documentType;
    
    @Column(name = "file_path")
    private String filePath;
    
    @Column(name = "file_size")
    private String fileSize;
    
    @CreationTimestamp
    @Column(name = "upload_date")
    private LocalDateTime uploadDate;
    
    // Constructors
    public EmployeeDocument() {}
    
    public EmployeeDocument(User employee, String name, String documentType) {
        this.employee = employee;
        this.name = name;
        this.documentType = documentType;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public User getEmployee() { return employee; }
    public void setEmployee(User employee) { this.employee = employee; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }
    
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    
    public String getFileSize() { return fileSize; }
    public void setFileSize(String fileSize) { this.fileSize = fileSize; }
    
    public LocalDateTime getUploadDate() { return uploadDate; }
    public void setUploadDate(LocalDateTime uploadDate) { this.uploadDate = uploadDate; }
}
