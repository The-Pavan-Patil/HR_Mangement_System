# HR Management System

A comprehensive Human Resource Management System built with Spring Boot backend and React frontend, featuring Firebase authentication, role-based access control, and complete HR workflow management.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 👥 User Management
- **Role-based Access Control**: Admin, HR Manager, Manager, Recruiter, Employee roles
- **Firebase Authentication**: Secure authentication with Firebase Admin SDK
- **User Registration & Profile Management**: Complete user lifecycle management
- **Employee Directory**: Search and manage employee information

### 📅 Leave Management
- **Leave Request System**: Employees can submit various types of leave requests
- **HR Approval Workflow**: HR managers can approve/reject leave requests
- **Leave Balance Tracking**: Monitor annual, sick, and personal leave balances
- **Leave History**: Complete audit trail of leave requests

### 💰 Payroll Management
- **Automated Payroll Processing**: Generate payroll for all employees
- **Payslip Generation**: Download detailed payslips in PDF format
- **Salary Components**: Base salary, overtime, bonuses, deductions, taxes
- **Payroll Status Tracking**: Draft → Processed → Paid workflow

### 📄 Document Management
- **Document Upload & Storage**: Secure document management
- **Document Download**: Easy access to important files
- **Document Types**: Support for various HR documents

### 📊 Dashboard & Analytics
- **Admin Dashboard**: System overview, user statistics, role distribution
- **HR Dashboard**: Employee management, leave approvals, payroll processing
- **Employee Dashboard**: Personal information, leave requests, payroll history

### 🕒 Attendance Tracking
- **Daily Attendance**: Check-in/check-out functionality
- **Attendance Reports**: Monthly attendance summaries
- **Overtime Calculation**: Automatic overtime tracking

## 🛠 Tech Stack

### Backend
- **Java 17**
- **Spring Boot 3.5.6**
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database access
- **MySQL** - Primary database
- **Firebase Admin SDK** - Authentication
- **Maven** - Build tool

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool and dev server
- **Axios** - HTTP client

### DevOps & Tools
- **Docker** (optional) - Containerization
- **Git** - Version control
- **Postman** - API testing

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Java 17** or higher
- **Node.js 16** or higher
- **MySQL 8.0** or higher
- **Maven 3.6** or higher
- **Git**

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/hr-management-system.git
cd hr-management-system
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server 2

# Install dependencies
mvn clean install

# Configure database (see Configuration section)

# Run the application
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

### 3. Frontend Setup

```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## ⚙️ Configuration

### Database Configuration

Create a MySQL database and update `server 2/src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/hr_management_db
spring.datasource.username=your_db_username
spring.datasource.password=your_db_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# Firebase Configuration
firebase.config.path=classpath:firebase-service-account.json
```

### Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Authentication and Firestore
3. Generate a service account key and save as `firebase-service-account.json` in `src/main/resources/`
4. Update Firebase configuration in `application.properties`

### Environment Variables

Create `.env` file in the client directory:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

## 📖 Usage

### User Roles & Permissions

1. **Admin**: Full system access, user management, system configuration
2. **HR Manager**: Employee management, leave approvals, payroll processing
3. **Manager**: Team management, limited reporting access
4. **Recruiter**: Recruitment-related functions
5. **Employee**: Personal dashboard, leave requests, document access

### Getting Started

1. **Admin Setup**: First user should be created as Admin
2. **Employee Onboarding**: HR adds employees to the system
3. **Daily Operations**: Employees log in to access their dashboard
4. **HR Operations**: HR managers handle approvals and payroll

## 📚 API Documentation

### Authentication Endpoints

```
POST /api/auth/login - User login
POST /api/auth/register - User registration
POST /api/auth/logout - User logout
```

### User Management

```
GET /api/users - Get all users (Admin only)
POST /api/users/profile - Create new user
PUT /api/users/profile/{firebaseUid} - Update user profile
DELETE /api/users/profile/{firebaseUid} - Deactivate user
```

### Employee Endpoints

```
GET /api/employee/dashboard/{firebaseUid} - Get employee dashboard data
POST /api/employee/leave-request - Submit leave request
PUT /api/employee/personal-details/{firebaseUid} - Update personal details
GET /api/employee/documents/{documentId}/download - Download document
GET /api/employee/payslip/{payrollId}/download - Download payslip
```

### Leave Management

```
GET /api/leave/requests - Get all leave requests (HR only)
PUT /api/leave/requests/{id}/approve - Approve leave request
PUT /api/leave/requests/{id}/reject - Reject leave request
```

### Payroll Management

```
GET /api/payroll/records?period=YYYY-MM - Get payroll records
POST /api/payroll/generate - Generate payroll for period
PUT /api/payroll/{id}/process - Process payroll
PUT /api/payroll/{id}/paid - Mark payroll as paid
GET /api/payroll/{id}/payslip - Download payslip
```

## 🗄️ Database Schema

### Core Tables

- **users**: User accounts and profiles
- **leave_requests**: Leave applications and approvals
- **payroll_records**: Payroll processing data
- **documents**: File storage metadata
- **attendance_records**: Daily attendance data

### Key Relationships

- Users can have multiple leave requests
- Users have associated payroll records
- Leave requests are approved by HR users
- Documents are linked to users

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow Java/Spring Boot best practices
- Use meaningful commit messages
- Write unit tests for new features
- Update documentation as needed
- Ensure code quality with SonarQube (optional)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation for common solutions

## 🔄 Future Enhancements

- [ ] Mobile application
- [ ] Advanced reporting and analytics
- [ ] Integration with third-party HR systems
- [ ] Performance review module
- [ ] Training management system
- [ ] Employee self-service portal
- [ ] Multi-language support
- [ ] API rate limiting and caching

---

**Note**: This is a comprehensive HR management solution designed for small to medium-sized organizations. For large-scale deployments, additional security and performance optimizations may be required.
