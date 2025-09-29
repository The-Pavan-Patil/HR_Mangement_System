import React, { useState, useEffect } from "react";

interface PayrollRecord {
  id: number;
  employeeId: number;
  employeeName: string;
  email: string;
  period: string;
  baseSalary: number;
  overtime: number;
  bonuses: number;
  deductions: number;
  taxes: number;
  netSalary: number;
  status: "draft" | "processed" | "paid";
  processedDate: string;
  paidDate?: string;
}

interface PayrollSummary {
  totalEmployees: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  pendingPayrolls: number;
  processedPayrolls: number;
}

interface UserProfile {
  id: number;
  firebaseUid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface HRStats {
  totalEmployees: number;
  activeEmployees: number;
  newHiresThisMonth: number;
  pendingLeaveRequests: number;
  upcomingPerformanceReviews: number;
  employeesByDepartment: {
    [key: string]: number;
  };
  recentActivities: Array<{
    id: number;
    type: string;
    message: string;
    timestamp: string;
    status: string;
  }>;
}

interface LeaveRequest {
  id: number;
  employeeId: number;
  employeeName: string;
  employeeEmail: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  appliedDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  reviewComments?: string;
  urgency: "low" | "medium" | "high";
}

interface LeaveStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  thisMonthRequests: number;
}

interface HRDashboardProps {
  user: UserProfile;
  onLogout: () => void;
}

const HRDashboard: React.FC<HRDashboardProps> = ({ user, onLogout }) => {
  const [stats, setStats] = useState<HRStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    newHiresThisMonth: 0,
    pendingLeaveRequests: 0,
    upcomingPerformanceReviews: 0,
    employeesByDepartment: {},
    recentActivities: [],
  });
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "overview" | "employees" | "activities" | "payroll" | "leave"
  >("overview");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<UserProfile | null>(
    null
  );
  const [actionLoading, setActionLoading] = useState<string>(""); // tracks which action is loading
  const [newEmployee, setNewEmployee] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "EMPLOYEE" as string,
  });
  const [showPayrollTab, setShowPayrollTab] = useState(false);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [payrollSummary, setPayrollSummary] = useState<PayrollSummary>({
    totalEmployees: 0,
    totalGross: 0,
    totalDeductions: 0,
    totalNet: 0,
    pendingPayrolls: 0,
    processedPayrolls: 0,
  });
  const [selectedPeriod, setSelectedPeriod] = useState<string>(
    new Date().toISOString().slice(0, 7)
  ); // YYYY-MM format
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(
    null
  );
  const [payrollLoading, setPayrollLoading] = useState(false);
  const [showLeaveTab, setShowLeaveTab] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveStats, setLeaveStats] = useState<LeaveStats>({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    thisMonthRequests: 0,
  });
  const [showLeaveReviewModal, setShowLeaveReviewModal] = useState(false);
  const [selectedLeaveRequest, setSelectedLeaveRequest] =
    useState<LeaveRequest | null>(null);
  const [reviewComments, setReviewComments] = useState("");
  const [leaveFilter, setLeaveFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");
  const [leaveLoading, setLeaveLoading] = useState(false);

  useEffect(() => {
    fetchHRDashboardData();
  }, []);

  useEffect(() => {
    if (showLeaveTab) {
      fetchLeaveRequests();
    }
  }, [showLeaveTab]);

  useEffect(() => {
    if (showPayrollTab) {
      fetchPayrollData();
    }
  }, [selectedPeriod, showPayrollTab]);

  const fetchHRDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all employees (non-admin users)
      const employeesResponse = await fetch("http://localhost:8080/api/users", {
        method: "GET",
        headers: {
          Authorization: "Basic " + btoa("user:password123"),
          "Content-Type": "application/json",
        },
      });
      if (employeesResponse.ok) {
        const employeesResult = await employeesResponse.json();
        if (employeesResult.success) {
          const allUsers = employeesResult.data;
          // Filter out admin users for HR management
          const employeeUsers = allUsers.filter(
            (u: UserProfile) => u.role !== "ADMIN"
          );
          setEmployees(employeeUsers);

          // Calculate HR-specific statistics
          const currentDate = new Date();
          const firstDayOfMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
          );

          const hrStats: HRStats = {
            totalEmployees: employeeUsers.length,
            activeEmployees: employeeUsers.filter(
              (u: UserProfile) => u.isActive
            ).length,
            newHiresThisMonth: employeeUsers.filter((u: UserProfile) => {
              const createdDate = new Date(u.createdAt);
              return createdDate >= firstDayOfMonth;
            }).length,
            pendingLeaveRequests: Math.floor(Math.random() * 10) + 5, // Mock data
            upcomingPerformanceReviews: Math.floor(Math.random() * 15) + 10, // Mock data
            employeesByDepartment: {
              Engineering: employeeUsers.filter(
                (u: { role: string }) => u.role === "EMPLOYEE"
              ).length,
              Management: employeeUsers.filter(
                (u: { role: string }) => u.role === "MANAGER"
              ).length,
              Recruitment: employeeUsers.filter(
                (u: { role: string }) => u.role === "RECRUITER"
              ).length,
              "Human Resources": employeeUsers.filter(
                (u: { role: string }) => u.role === "HR"
              ).length,
            },
            recentActivities: [
              {
                id: 1,
                type: "registration",
                message: "New employee registered",
                timestamp: new Date().toISOString(),
                status: "completed",
              },
              {
                id: 2,
                type: "leave",
                message: "Leave request submitted",
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                status: "pending",
              },
              {
                id: 3,
                type: "review",
                message: "Performance review completed",
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                status: "completed",
              },
            ],
          };

          setStats(hrStats);
          console.log("✅ HR dashboard data loaded:", {
            hrStats,
            totalEmployees: employeeUsers.length,
          });
        }
      } else {
        setError("Failed to fetch HR dashboard data");
      }
    } catch (error) {
      console.error("❌ Error fetching HR dashboard data:", error);
      setError("Error connecting to backend service");
    } finally {
      setLoading(false);
    }
  };
  // Add these functions after existing handler functions

  const fetchLeaveRequests = async () => {
    setLeaveLoading(true);
    try {
      const response = await fetch("http://localhost:8080/api/leave/requests", {
        method: "GET",
        headers: {
          Authorization: "Basic " + btoa("user:password123"),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setLeaveRequests(result.data.requests);
          setLeaveStats(result.data.stats);
          console.log("✅ Leave requests loaded successfully");
        }
      } else {
        console.error("❌ Failed to fetch leave requests");
        setError("Failed to load leave requests");
      }
    } catch (error) {
      console.error("❌ Error fetching leave requests:", error);
      setError("Error connecting to leave management service");
    } finally {
      setLeaveLoading(false);
    }
  };

  const handleReviewLeave = (leaveRequest: LeaveRequest) => {
    setSelectedLeaveRequest(leaveRequest);
    setReviewComments("");
    setShowLeaveReviewModal(true);
  };

  const approveLeaveRequest = async () => {
    if (!selectedLeaveRequest) return;

    setActionLoading(`approve-${selectedLeaveRequest.id}`);
    try {
      const response = await fetch(
        `http://localhost:8080/api/leave/requests/${selectedLeaveRequest.id}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: "Basic " + btoa("user:password123"),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reviewComments: reviewComments || "Leave request approved",
          }),
        }
      );

      if (response.ok) {
        console.log("✅ Leave request approved successfully");
        setShowLeaveReviewModal(false);
        setSelectedLeaveRequest(null);
        await fetchLeaveRequests(); // Refresh data
      } else {
        const errorResult = await response.json();
        setError(`Failed to approve leave request: ${errorResult.message}`);
      }
    } catch (error) {
      console.error("❌ Error approving leave request:", error);
      setError("Error approving leave request");
    } finally {
      setActionLoading("");
    }
  };

  const rejectLeaveRequest = async () => {
    if (!selectedLeaveRequest) return;

    if (!reviewComments.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    setActionLoading(`reject-${selectedLeaveRequest.id}`);
    try {
      const response = await fetch(
        `http://localhost:8080/api/leave/requests/${selectedLeaveRequest.id}/reject`,
        {
          method: "PUT",
          headers: {
            Authorization: "Basic " + btoa("user:password123"),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reviewComments: reviewComments,
          }),
        }
      );

      if (response.ok) {
        console.log("✅ Leave request rejected successfully");
        setShowLeaveReviewModal(false);
        setSelectedLeaveRequest(null);
        await fetchLeaveRequests(); // Refresh data
      } else {
        const errorResult = await response.json();
        setError(`Failed to reject leave request: ${errorResult.message}`);
      }
    } catch (error) {
      console.error("❌ Error rejecting leave request:", error);
      setError("Error rejecting leave request");
    } finally {
      setActionLoading("");
    }
  };

  const quickApprove = async (leaveId: number) => {
    setActionLoading(`quick-approve-${leaveId}`);
    try {
      const response = await fetch(
        `http://localhost:8080/api/leave/requests/${leaveId}/approve`,
        {
          method: "PUT",
          headers: {
            Authorization: "Basic " + btoa("user:password123"),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reviewComments: "Quick approval",
          }),
        }
      );

      if (response.ok) {
        console.log("✅ Leave request quick approved");
        await fetchLeaveRequests();
      } else {
        setError("Failed to approve leave request");
      }
    } catch (error) {
      console.error("❌ Error in quick approve:", error);
      setError("Error approving leave request");
    } finally {
      setActionLoading("");
    }
  };

  const calculateLeaveDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const filteredLeaveRequests =
    leaveFilter === "all"
      ? leaveRequests
      : leaveRequests.filter((req) => req.status === leaveFilter);

  //new code
  const handleAddEmployee = () => {
    setNewEmployee({
      firstName: "",
      lastName: "",
      email: "",
      role: "EMPLOYEE",
    });
    setShowAddModal(true);
  };

  const handleViewEmployee = (employee: UserProfile) => {
    setSelectedEmployee(employee);
    setShowViewModal(true);
  };

  const handleEditEmployee = (employee: UserProfile) => {
    setSelectedEmployee(employee);
    setNewEmployee({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      role: employee.role,
    });
    setShowEditModal(true);
  };

  const handleDeleteEmployee = async (employee: UserProfile) => {
    if (
      !window.confirm(
        `Are you sure you want to deactivate ${employee.firstName} ${employee.lastName}?`
      )
    ) {
      return;
    }

    setActionLoading(`delete-${employee.id}`);
    try {
      const response = await fetch(
        `http://localhost:8080/api/users/profile/${employee.firebaseUid}`,
        {
          method: "DELETE",
          headers: {
            Authorization: "Basic " + btoa("user:password123"),
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        console.log("✅ Employee deactivated successfully");
        // Refresh the employee list
        await fetchHRDashboardData();
      } else {
        setError("Failed to deactivate employee");
      }
    } catch (error) {
      console.error("❌ Error deactivating employee:", error);
      setError("Error deactivating employee");
    } finally {
      setActionLoading("");
    }
  };

  const handleActivateEmployee = async (employee: UserProfile) => {
    setActionLoading(`activate-${employee.id}`);
    try {
      // Since we don't have a direct activate endpoint, we'll use the update endpoint
      const response = await fetch(
        `http://localhost:8080/api/users/profile/${employee.firebaseUid}`,
        {
          method: "PUT",
          headers: {
            Authorization: "Basic " + btoa("user:password123"),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uid: employee.firebaseUid,
            email: employee.email,
            firstName: employee.firstName,
            lastName: employee.lastName,
            role: employee.role,
          }),
        }
      );

      if (response.ok) {
        console.log("✅ Employee activated successfully");
        // Refresh the employee list
        await fetchHRDashboardData();
      } else {
        setError("Failed to activate employee");
      }
    } catch (error) {
      console.error("❌ Error activating employee:", error);
      setError("Error activating employee");
    } finally {
      setActionLoading("");
    }
  };

  const handleSaveNewEmployee = async () => {
    if (!newEmployee.firstName || !newEmployee.lastName || !newEmployee.email) {
      setError("Please fill in all required fields");
      return;
    }

    setActionLoading("create");
    try {
      // Generate a temporary Firebase UID for demo purposes
      const tempUid =
        "temp-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);

      const response = await fetch("http://localhost:8080/api/users/profile", {
        method: "POST",
        headers: {
          Authorization: "Basic " + btoa("user:password123"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: tempUid,
          email: newEmployee.email,
          firstName: newEmployee.firstName,
          lastName: newEmployee.lastName,
          role: newEmployee.role,
        }),
      });

      if (response.ok) {
        console.log("New employee added successfully");
        setShowAddModal(false);
        // Refresh the employee list
        await fetchHRDashboardData();
      } else {
        const errorResult = await response.json();
        setError(`Failed to add employee: ${errorResult.message}`);
      }
    } catch (error) {
      console.error("❌ Error adding employee:", error);
      setError("Error adding new employee");
    } finally {
      setActionLoading("");
    }
  };

  const handleSaveEditEmployee = async () => {
    if (
      !selectedEmployee ||
      !newEmployee.firstName ||
      !newEmployee.lastName ||
      !newEmployee.email
    ) {
      setError("Please fill in all required fields");
      return;
    }

    setActionLoading("update");
    try {
      const response = await fetch(
        `http://localhost:8080/api/users/profile/${selectedEmployee.firebaseUid}`,
        {
          method: "PUT",
          headers: {
            Authorization: "Basic " + btoa("user:password123"),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uid: selectedEmployee.firebaseUid,
            email: newEmployee.email,
            firstName: newEmployee.firstName,
            lastName: newEmployee.lastName,
            role: newEmployee.role,
          }),
        }
      );

      if (response.ok) {
        console.log("✅ Employee updated successfully");
        setShowEditModal(false);
        setSelectedEmployee(null);
        // Refresh the employee list
        await fetchHRDashboardData();
      } else {
        const errorResult = await response.json();
        setError(`Failed to update employee: ${errorResult.message}`);
      }
    } catch (error) {
      console.error("❌ Error updating employee:", error);
      setError("Error updating employee");
    } finally {
      setActionLoading("");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading HR dashboard...</p>
        </div>
      </div>
    );
  }

  const fetchPayrollData = async () => {
    setPayrollLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/payroll/records?period=${selectedPeriod}`,
        {
          method: "GET",
          headers: {
            Authorization: "Basic " + btoa("user:password123"),
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setPayrollRecords(result.data.records);
          setPayrollSummary(result.data.summary);
          console.log("✅ Payroll data loaded successfully");
        }
      } else {
        console.error("❌ Failed to fetch payroll data");
        setError("Failed to load payroll data");
      }
    } catch (error) {
      console.error("❌ Error fetching payroll data:", error);
      setError("Error connecting to payroll service");
    } finally {
      setPayrollLoading(false);
    }
  };

  const generatePayrollForPeriod = async () => {
    if (
      !window.confirm(
        `Generate payroll for ${selectedPeriod}? This will create payroll records for all active employees.`
      )
    ) {
      return;
    }

    setActionLoading("generate-payroll");
    try {
      const response = await fetch(
        "http://localhost:8080/api/payroll/generate",
        {
          method: "POST",
          headers: {
            Authorization: "Basic " + btoa("user:password123"),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ period: selectedPeriod }),
        }
      );

      if (response.ok) {
        console.log("✅ Payroll generated successfully");
        await fetchPayrollData(); // Refresh data
      } else {
        const errorResult = await response.json();
        setError(`Failed to generate payroll: ${errorResult.message}`);
      }
    } catch (error) {
      console.error("❌ Error generating payroll:", error);
      setError("Error generating payroll");
    } finally {
      setActionLoading("");
    }
  };

  const processPayroll = async (payrollId: number) => {
    setActionLoading(`process-${payrollId}`);
    try {
      const response = await fetch(
        `http://localhost:8080/api/payroll/${payrollId}/process`,
        {
          method: "PUT",
          headers: {
            Authorization: "Basic " + btoa("user:password123"),
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        console.log("✅ Payroll processed successfully");
        await fetchPayrollData(); // Refresh data
      } else {
        setError("Failed to process payroll");
      }
    } catch (error) {
      console.error("❌ Error processing payroll:", error);
      setError("Error processing payroll");
    } finally {
      setActionLoading("");
    }
  };

  const markAsPaid = async (payrollId: number) => {
    setActionLoading(`paid-${payrollId}`);
    try {
      const response = await fetch(
        `http://localhost:8080/api/payroll/${payrollId}/paid`,
        {
          method: "PUT",
          headers: {
            Authorization: "Basic " + btoa("user:password123"),
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        console.log("✅ Payroll marked as paid successfully");
        await fetchPayrollData(); // Refresh data
      } else {
        setError("Failed to mark payroll as paid");
      }
    } catch (error) {
      console.error("❌ Error marking payroll as paid:", error);
      setError("Error updating payroll status");
    } finally {
      setActionLoading("");
    }
  };

  const viewPayslip = (payroll: PayrollRecord) => {
    setSelectedPayslip(payroll);
    setShowPayslipModal(true);
  };

  const downloadPayslip = async (payrollId: number, employeeName: string) => {
    setActionLoading(`download-${payrollId}`);
    try {
      const response = await fetch(
        `http://localhost:8080/api/payroll/${payrollId}/payslip`,
        {
          method: "GET",
          headers: {
            Authorization: "Basic " + btoa("user:password123"),
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `payslip_${employeeName.replace(
          " ",
          "_"
        )}_${selectedPeriod}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        setError("Failed to download payslip");
      }
    } catch (error) {
      console.error("❌ Error downloading payslip:", error);
      setError("Error downloading payslip");
    } finally {
      setActionLoading("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Welcome back, {user.firstName} {user.lastName}!
              </p>
            </div>
            <button
              onClick={onLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
            >
              Logout
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "overview"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("employees")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "employees"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Employee Management
              </button>
              <button
                onClick={() => setActiveTab("activities")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "activities"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Recent Activities
              </button>
              <button
                onClick={() => {
                  setActiveTab("payroll");
                  setShowPayrollTab(true);
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "payroll"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Payroll Management
              </button>
              <button
                onClick={() => {
                  setActiveTab("leave");
                  setShowLeaveTab(true);
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "leave"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Leave Management
              </button>
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* HR Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-indigo-500 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold">Total Employees</h3>
                <p className="text-3xl font-bold mt-2">
                  {stats.totalEmployees}
                </p>
                <p className="text-sm mt-2 opacity-90">Under HR management</p>
              </div>
              <div className="bg-green-500 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold">Active Employees</h3>
                <p className="text-3xl font-bold mt-2">
                  {stats.activeEmployees}
                </p>
                <p className="text-sm mt-2 opacity-90">Currently working</p>
              </div>
              <div className="bg-blue-500 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold">New Hires</h3>
                <p className="text-3xl font-bold mt-2">
                  {stats.newHiresThisMonth}
                </p>
                <p className="text-sm mt-2 opacity-90">This month</p>
              </div>
              <div className="bg-yellow-500 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold">Pending Reviews</h3>
                <p className="text-3xl font-bold mt-2">
                  {stats.upcomingPerformanceReviews}
                </p>
                <p className="text-sm mt-2 opacity-90">Performance reviews</p>
              </div>
            </div>

            {/* Department Distribution and HR Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Department Distribution
                </h2>
                <div className="space-y-3">
                  {Object.entries(stats.employeesByDepartment).map(
                    ([dept, count]) => (
                      <div
                        key={dept}
                        className="flex justify-between items-center"
                      >
                        <span className="text-gray-600">{dept}</span>
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{
                                width: `${Math.min(
                                  (count /
                                    Math.max(
                                      ...Object.values(
                                        stats.employeesByDepartment
                                      )
                                    )) *
                                    100,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <span className="font-semibold text-blue-600 min-w-[2rem]">
                            {count}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">HR Metrics</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Employee Retention</span>
                    <span className="font-semibold text-green-600">94.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      Average Performance Score
                    </span>
                    <span className="font-semibold text-blue-600">4.2/5.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Leave Requests</span>
                    <span className="font-semibold text-yellow-600">
                      {stats.pendingLeaveRequests} pending
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Training Completion</span>
                    <span className="font-semibold text-purple-600">87.5%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* HR Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition duration-200">
                  <h3 className="font-semibold text-gray-700">
                    Add New Employee
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Register a new team member
                  </p>
                </button>
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition duration-200">
                  <h3 className="font-semibold text-gray-700">
                    Review Leave Requests
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {stats.pendingLeaveRequests} pending approvals
                  </p>
                </button>
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition duration-200">
                  <h3 className="font-semibold text-gray-700">
                    Performance Reviews
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Schedule and manage reviews
                  </p>
                </button>
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition duration-200">
                  <h3 className="font-semibold text-gray-700">
                    Payroll Management
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Process monthly payroll
                  </p>
                </button>
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition duration-200">
                  <h3 className="font-semibold text-gray-700">
                    Training Programs
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Assign and track training
                  </p>
                </button>
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition duration-200">
                  <h3 className="font-semibold text-gray-700">
                    Generate Reports
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    HR analytics and insights
                  </p>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Employee Management Tab */}
        {activeTab === "employees" && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Employee Directory</h2>
              <button
                onClick={handleAddEmployee}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add New Employee
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Join Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {employee.firstName.charAt(0)}
                              {employee.lastName.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {employee.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {employee.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            employee.role === "HR"
                              ? "bg-purple-100 text-purple-800"
                              : employee.role === "MANAGER"
                              ? "bg-blue-100 text-blue-800"
                              : employee.role === "RECRUITER"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {employee.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            employee.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {employee.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(employee.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewEmployee(employee)}
                            className="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded hover:bg-indigo-50 transition duration-200"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleEditEmployee(employee)}
                            className="text-yellow-600 hover:text-yellow-900 px-2 py-1 rounded hover:bg-yellow-50 transition duration-200"
                          >
                            Edit
                          </button>
                          {employee.isActive ? (
                            <button
                              onClick={() => handleDeleteEmployee(employee)}
                              disabled={
                                actionLoading === `delete-${employee.id}`
                              }
                              className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50 transition duration-200 disabled:opacity-50"
                            >
                              {actionLoading === `delete-${employee.id}`
                                ? "Deactivating..."
                                : "Deactivate"}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleActivateEmployee(employee)}
                              disabled={
                                actionLoading === `activate-${employee.id}`
                              }
                              className="text-green-600 hover:text-green-900 px-2 py-1 rounded hover:bg-green-50 transition duration-200 disabled:opacity-50"
                            >
                              {actionLoading === `activate-${employee.id}`
                                ? "Activating..."
                                : "Activate"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {employees.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No employees found in the system.
              </div>
            )}
          </div>
        )}

        {/* Activities Tab */}
        {activeTab === "activities" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Recent HR Activities</h2>

            <div className="space-y-4">
              {stats.recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center p-4 border border-gray-200 rounded-lg"
                >
                  <div
                    className={`w-3 h-3 rounded-full mr-4 ${
                      activity.type === "registration"
                        ? "bg-green-500"
                        : activity.type === "leave"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                    }`}
                  ></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.message}
                      </p>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          activity.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : activity.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {activity.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDateTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              {/* Payroll Management Tab */}

              {/* Additional mock activities */}
              <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                <div className="w-3 h-3 rounded-full mr-4 bg-purple-500"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      Training program assigned
                    </p>
                    <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                      in-progress
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDateTime(
                      new Date(Date.now() - 10800000).toISOString()
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                <div className="w-3 h-3 rounded-full mr-4 bg-red-500"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      Payroll processed for March
                    </p>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      completed
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDateTime(
                      new Date(Date.now() - 86400000).toISOString()
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                View All Activities
              </button>
            </div>
          </div>
        )}
        {/* Payroll Management Tab */}
        {activeTab === "payroll" && (
          <div className="space-y-6">
            {/* Payroll Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-500 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold">Total Employees</h3>
                <p className="text-3xl font-bold mt-2">
                  {payrollSummary.totalEmployees}
                </p>
                <p className="text-sm mt-2 opacity-90">In payroll system</p>
              </div>
              <div className="bg-green-500 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold">Total Gross</h3>
                <p className="text-3xl font-bold mt-2">
                  ${payrollSummary.totalGross.toLocaleString()}
                </p>
                <p className="text-sm mt-2 opacity-90">This period</p>
              </div>
              <div className="bg-orange-500 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold">Total Deductions</h3>
                <p className="text-3xl font-bold mt-2">
                  ${payrollSummary.totalDeductions.toLocaleString()}
                </p>
                <p className="text-sm mt-2 opacity-90">Taxes & deductions</p>
              </div>
              <div className="bg-purple-500 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold">Net Payroll</h3>
                <p className="text-3xl font-bold mt-2">
                  ${payrollSummary.totalNet.toLocaleString()}
                </p>
                <p className="text-sm mt-2 opacity-90">To be paid out</p>
              </div>
            </div>

            {/* Payroll Controls */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Payroll Management</h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">
                      Period:
                    </label>
                    <input
                      type="month"
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={generatePayrollForPeriod}
                    disabled={actionLoading === "generate-payroll"}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 transition duration-200 flex items-center"
                  >
                    {actionLoading === "generate-payroll" ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Generate Payroll
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Payroll Status Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-yellow-800">Draft Payrolls</p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {
                          payrollRecords.filter((p) => p.status === "draft")
                            .length
                        }
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-blue-800">Processed</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {
                          payrollRecords.filter((p) => p.status === "processed")
                            .length
                        }
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-green-800">Paid</p>
                      <p className="text-2xl font-bold text-green-900">
                        {
                          payrollRecords.filter((p) => p.status === "paid")
                            .length
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payroll Records Table */}
              {payrollLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Loading payroll data...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Base Salary
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Overtime
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Deductions
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Net Salary
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payrollRecords.map((payroll) => (
                        <tr key={payroll.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {payroll.employeeName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {payroll.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${payroll.baseSalary.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${payroll.overtime.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ${payroll.deductions.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${payroll.netSalary.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                payroll.status === "paid"
                                  ? "bg-green-100 text-green-800"
                                  : payroll.status === "processed"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {payroll.status.charAt(0).toUpperCase() +
                                payroll.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => viewPayslip(payroll)}
                                className="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded hover:bg-indigo-50 transition duration-200"
                              >
                                View
                              </button>
                              <button
                                onClick={() =>
                                  downloadPayslip(
                                    payroll.id,
                                    payroll.employeeName
                                  )
                                }
                                disabled={
                                  actionLoading === `download-${payroll.id}`
                                }
                                className="text-green-600 hover:text-green-900 px-2 py-1 rounded hover:bg-green-50 transition duration-200 disabled:opacity-50"
                              >
                                {actionLoading === `download-${payroll.id}`
                                  ? "Downloading..."
                                  : "Download"}
                              </button>
                              {payroll.status === "draft" && (
                                <button
                                  onClick={() => processPayroll(payroll.id)}
                                  disabled={
                                    actionLoading === `process-${payroll.id}`
                                  }
                                  className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50 transition duration-200 disabled:opacity-50"
                                >
                                  {actionLoading === `process-${payroll.id}`
                                    ? "Processing..."
                                    : "Process"}
                                </button>
                              )}
                              {payroll.status === "processed" && (
                                <button
                                  onClick={() => markAsPaid(payroll.id)}
                                  disabled={
                                    actionLoading === `paid-${payroll.id}`
                                  }
                                  className="text-purple-600 hover:text-purple-900 px-2 py-1 rounded hover:bg-purple-50 transition duration-200 disabled:opacity-50"
                                >
                                  {actionLoading === `paid-${payroll.id}`
                                    ? "Updating..."
                                    : "Mark Paid"}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {payrollRecords.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No payroll records found for {selectedPeriod}. Generate
                      payroll to get started.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        {/* Leave Management Tab */}
        {activeTab === "leave" && (
          <div className="space-y-6">
            {/* Leave Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-500 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold">Total Requests</h3>
                <p className="text-3xl font-bold mt-2">
                  {leaveStats.totalRequests}
                </p>
                <p className="text-sm mt-2 opacity-90">All time</p>
              </div>
              <div className="bg-yellow-500 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold">Pending Review</h3>
                <p className="text-3xl font-bold mt-2">
                  {leaveStats.pendingRequests}
                </p>
                <p className="text-sm mt-2 opacity-90">Awaiting action</p>
              </div>
              <div className="bg-green-500 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold">Approved</h3>
                <p className="text-3xl font-bold mt-2">
                  {leaveStats.approvedRequests}
                </p>
                <p className="text-sm mt-2 opacity-90">This month</p>
              </div>
              <div className="bg-red-500 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold">Rejected</h3>
                <p className="text-3xl font-bold mt-2">
                  {leaveStats.rejectedRequests}
                </p>
                <p className="text-sm mt-2 opacity-90">This month</p>
              </div>
            </div>

            {/* Leave Management Controls */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  Leave Request Management
                </h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">
                      Filter:
                    </label>
                    <select
                      value={leaveFilter}
                      onChange={(e) => setLeaveFilter(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Requests</option>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="text-sm text-gray-600">
                    Showing {filteredLeaveRequests.length} of{" "}
                    {leaveRequests.length} requests
                  </div>
                </div>
              </div>

              {/* Priority Requests Alert */}
              {leaveRequests.filter(
                (r) => r.status === "pending" && r.urgency === "high"
              ).length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">
                        <strong>Urgent:</strong>{" "}
                        {
                          leaveRequests.filter(
                            (r) =>
                              r.status === "pending" && r.urgency === "high"
                          ).length
                        }{" "}
                        high-priority leave requests need immediate attention.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Leave Requests Table */}
              {leaveLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Loading leave requests...</span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Leave Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dates
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Urgency
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applied
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredLeaveRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                                <span className="text-xs font-medium text-gray-700">
                                  {request.employeeName
                                    .split(" ")
                                    .map((n) => n.charAt(0))
                                    .join("")}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {request.employeeName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {request.employeeEmail}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {request.leaveType}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {request.totalDays}{" "}
                            {request.totalDays === 1 ? "day" : "days"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div>{formatDate(request.startDate)}</div>
                            {request.startDate !== request.endDate && (
                              <div className="text-gray-500">
                                to {formatDate(request.endDate)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getUrgencyColor(
                                request.urgency
                              )}`}
                            >
                              {request.urgency.charAt(0).toUpperCase() +
                                request.urgency.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                request.status
                              )}`}
                            >
                              {request.status.charAt(0).toUpperCase() +
                                request.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(request.appliedDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleReviewLeave(request)}
                                className="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded hover:bg-indigo-50 transition duration-200"
                              >
                                Review
                              </button>
                              {request.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => quickApprove(request.id)}
                                    disabled={
                                      actionLoading ===
                                      `quick-approve-${request.id}`
                                    }
                                    className="text-green-600 hover:text-green-900 px-2 py-1 rounded hover:bg-green-50 transition duration-200 disabled:opacity-50"
                                  >
                                    {actionLoading ===
                                    `quick-approve-${request.id}`
                                      ? "Approving..."
                                      : "Quick Approve"}
                                  </button>
                                </>
                              )}
                              {request.reviewedBy && (
                                <span className="text-xs text-gray-400">
                                  by {request.reviewedBy}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredLeaveRequests.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No {leaveFilter !== "all" ? leaveFilter : ""} leave
                      requests found.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Add New Employee
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={newEmployee.firstName}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        firstName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter first name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={newEmployee.lastName}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        lastName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter last name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={newEmployee.role}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="MANAGER">Manager</option>
                    <option value="HR">HR Manager</option>
                    <option value="RECRUITER">Recruiter</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNewEmployee}
                  disabled={actionLoading === "create"}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition duration-200"
                >
                  {actionLoading === "create" ? "Adding..." : "Add Employee"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedEmployee && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Edit Employee
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={newEmployee.firstName}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        firstName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={newEmployee.lastName}
                    onChange={(e) =>
                      setNewEmployee({
                        ...newEmployee,
                        lastName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newEmployee.email}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={newEmployee.role}
                    onChange={(e) =>
                      setNewEmployee({ ...newEmployee, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="MANAGER">Manager</option>
                    <option value="HR">HR Manager</option>
                    <option value="RECRUITER">Recruiter</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedEmployee(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEditEmployee}
                  disabled={actionLoading === "update"}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition duration-200"
                >
                  {actionLoading === "update"
                    ? "Updating..."
                    : "Update Employee"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Employee Modal */}
      {showViewModal && selectedEmployee && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Employee Details
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="h-16 w-16 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xl font-medium text-gray-700">
                      {selectedEmployee.firstName.charAt(0)}
                      {selectedEmployee.lastName.charAt(0)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedEmployee.firstName}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedEmployee.lastName}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedEmployee.email}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <span
                    className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedEmployee.role === "HR"
                        ? "bg-purple-100 text-purple-800"
                        : selectedEmployee.role === "MANAGER"
                        ? "bg-blue-100 text-blue-800"
                        : selectedEmployee.role === "RECRUITER"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {selectedEmployee.role}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <span
                    className={`mt-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedEmployee.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {selectedEmployee.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Join Date
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(selectedEmployee.createdAt)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Employee ID
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedEmployee.id}
                  </p>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedEmployee(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Payslip View Modal - Add this modal at the end before closing div */}
      {showPayslipModal && selectedPayslip && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Payslip - {selectedPayslip.period}
                </h3>
                <button
                  onClick={() => setShowPayslipModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Employee Info */}
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Employee Information
                    </h4>
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {selectedPayslip.employeeName}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedPayslip.email}
                    </p>
                    <p>
                      <span className="font-medium">Employee ID:</span>{" "}
                      {selectedPayslip.employeeId}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Pay Period
                    </h4>
                    <p>
                      <span className="font-medium">Period:</span>{" "}
                      {selectedPayslip.period}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>
                      <span
                        className={`ml-2 px-2 py-1 text-xs rounded-full ${
                          selectedPayslip.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : selectedPayslip.status === "processed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {selectedPayslip.status.charAt(0).toUpperCase() +
                          selectedPayslip.status.slice(1)}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Processed:</span>{" "}
                      {formatDate(selectedPayslip.processedDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Salary Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Earnings */}
                <div className="bg-green-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-4">
                    Earnings
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Base Salary:</span>
                      <span className="font-medium">
                        ${selectedPayslip.baseSalary.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Overtime:</span>
                      <span className="font-medium">
                        ${selectedPayslip.overtime.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bonuses:</span>
                      <span className="font-medium">
                        ${selectedPayslip.bonuses.toLocaleString()}
                      </span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-bold text-green-800">
                      <span>Total Earnings:</span>
                      <span>
                        $
                        {(
                          selectedPayslip.baseSalary +
                          selectedPayslip.overtime +
                          selectedPayslip.bonuses
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="bg-red-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-red-900 mb-4">
                    Deductions
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Tax Deductions:</span>
                      <span className="font-medium">
                        ${selectedPayslip.taxes.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Other Deductions:</span>
                      <span className="font-medium">
                        $
                        {(
                          selectedPayslip.deductions - selectedPayslip.taxes
                        ).toLocaleString()}
                      </span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-bold text-red-800">
                      <span>Total Deductions:</span>
                      <span>
                        ${selectedPayslip.deductions.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Salary */}
              <div className="bg-blue-50 p-6 rounded-lg mt-6">
                <div className="text-center">
                  <h4 className="text-2xl font-bold text-blue-900 mb-2">
                    Net Salary
                  </h4>
                  <p className="text-4xl font-bold text-blue-800">
                    ${selectedPayslip.netSalary.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() =>
                    downloadPayslip(
                      selectedPayslip.id,
                      selectedPayslip.employeeName
                    )
                  }
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Download PDF
                </button>
                <button
                  onClick={() => setShowPayslipModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Leave Review Modal - Add this modal at the end before closing div */}
      {showLeaveReviewModal && selectedLeaveRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-4/5 max-w-3xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Review Leave Request
                </h3>
                <button
                  onClick={() => setShowLeaveReviewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Employee and Leave Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Employee Info */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Employee Information
                  </h4>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {selectedLeaveRequest.employeeName}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedLeaveRequest.employeeEmail}
                    </p>
                    <p>
                      <span className="font-medium">Employee ID:</span>{" "}
                      {selectedLeaveRequest.employeeId}
                    </p>
                  </div>
                </div>

                {/* Leave Details */}
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Leave Details
                  </h4>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Type:</span>{" "}
                      {selectedLeaveRequest.leaveType}
                    </p>
                    <p>
                      <span className="font-medium">Duration:</span>{" "}
                      {selectedLeaveRequest.totalDays} days
                    </p>
                    <p>
                      <span className="font-medium">Start:</span>{" "}
                      {formatDate(selectedLeaveRequest.startDate)}
                    </p>
                    <p>
                      <span className="font-medium">End:</span>{" "}
                      {formatDate(selectedLeaveRequest.endDate)}
                    </p>
                    <p>
                      <span className="font-medium">Applied:</span>{" "}
                      {formatDate(selectedLeaveRequest.appliedDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Leave Reason */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Reason for Leave
                </h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">
                    {selectedLeaveRequest.reason || "No reason provided"}
                  </p>
                </div>
              </div>

              {/* Urgency Indicator */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Priority Level
                </h4>
                <span
                  className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getUrgencyColor(
                    selectedLeaveRequest.urgency
                  )}`}
                >
                  {selectedLeaveRequest.urgency.charAt(0).toUpperCase() +
                    selectedLeaveRequest.urgency.slice(1)}{" "}
                  Priority
                </span>
              </div>

              {/* Review Comments */}
              {selectedLeaveRequest.status === "pending" && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Review Comments
                  </h4>
                  <textarea
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    placeholder="Add your comments here (optional for approval, required for rejection)..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                  />
                </div>
              )}

              {/* Previous Review (if any) */}
              {selectedLeaveRequest.status !== "pending" && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Review History
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                          selectedLeaveRequest.status
                        )}`}
                      >
                        {selectedLeaveRequest.status.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {selectedLeaveRequest.reviewedDate &&
                          formatDate(selectedLeaveRequest.reviewedDate)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <strong>Reviewed by:</strong>{" "}
                      {selectedLeaveRequest.reviewedBy || "System"}
                    </p>
                    {selectedLeaveRequest.reviewComments && (
                      <p className="text-sm text-gray-700 mt-2">
                        <strong>Comments:</strong>{" "}
                        {selectedLeaveRequest.reviewComments}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowLeaveReviewModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-200"
                >
                  Close
                </button>
                {selectedLeaveRequest.status === "pending" && (
                  <>
                    <button
                      onClick={rejectLeaveRequest}
                      disabled={
                        actionLoading === `reject-${selectedLeaveRequest.id}`
                      }
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition duration-200 flex items-center"
                    >
                      {actionLoading === `reject-${selectedLeaveRequest.id}` ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Rejecting...
                        </>
                      ) : (
                        "Reject Request"
                      )}
                    </button>
                    <button
                      onClick={approveLeaveRequest}
                      disabled={
                        actionLoading === `approve-${selectedLeaveRequest.id}`
                      }
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition duration-200 flex items-center"
                    >
                      {actionLoading ===
                      `approve-${selectedLeaveRequest.id}` ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Approving...
                        </>
                      ) : (
                        "Approve Request"
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRDashboard;
