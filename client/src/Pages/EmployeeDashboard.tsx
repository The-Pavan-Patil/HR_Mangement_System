import React, { useState, useEffect } from 'react';

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

interface EmployeeData {
  personalDetails: {
    employeeId: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
    department: string;
    position: string;
    joinDate: string;
    manager: string;
  };
  salary: {
    currentSalary: number;
    currency: string;
    nextReviewDate: string;
    salaryGrade: string;
  };
  payrolls: Array<{
    id: number;
    period: string;
    baseSalary: number;
    overtime: number;
    bonuses: number;
    deductions: number;
    taxes: number;
    netSalary: number;
    status: string;
    paidDate?: string;
  }>;
  leaveRequests: Array<{
    id: number;
    leaveType: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
    status: string;
    appliedDate: string;
    reviewComments?: string;
  }>;
  leaveBalance: {
    annualLeave: { total: number; used: number; remaining: number };
    sickLeave: { total: number; used: number; remaining: number };
    personalLeave: { total: number; used: number; remaining: number };
  };
  documents: Array<{
    id: number;
    name: string;
    type: string;
    uploadDate: string;
    size: string;
    downloadUrl: string;
  }>;
  attendance: {
    thisMonth: {
      totalDays: number;
      present: number;
      absent: number;
      late: number;
    };
    recentRecords: Array<{
      date: string;
      checkIn: string;
      checkOut: string;
      totalHours: number;
      status: string;
    }>;
  };
}

interface EmployeeDashboardProps {
  user: UserProfile;
  onLogout: () => void;
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ user, onLogout }) => {
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'payroll' | 'leave' | 'personal' | 'documents' | 'attendance'>('overview');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [showPersonalEditModal, setShowPersonalEditModal] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);
  const [newLeaveRequest, setNewLeaveRequest] = useState({
    leaveType: 'ANNUAL',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [personalEditData, setPersonalEditData] = useState({
    phone: '',
    address: '',
    emergencyContact: { name: '', phone: '', relationship: '' }
  });
  const [actionLoading, setActionLoading] = useState<string>('');

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/employee/dashboard/${user.firebaseUid}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + btoa('user:password123'),
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setEmployeeData(result.data);
          console.log('✅ Employee dashboard data loaded successfully');
        } else {
          setError(result.message);
        }
      } else {
        setError('Failed to load employee data');
      }
    } catch (error) {
      console.error('❌ Error fetching employee data:', error);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const submitLeaveRequest = async () => {
    if (!newLeaveRequest.startDate || !newLeaveRequest.endDate || !newLeaveRequest.reason) {
      setError('Please fill in all required fields');
      return;
    }

    setActionLoading('submit-leave');
    try {
      const response = await fetch('http://localhost:8080/api/employee/leave-request', {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa('user:password123'),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          employeeUid: user.firebaseUid,
          ...newLeaveRequest
        })
      });

      if (response.ok) {
        console.log('✅ Leave request submitted successfully');
        setShowLeaveModal(false);
        setNewLeaveRequest({ leaveType: 'ANNUAL', startDate: '', endDate: '', reason: '' });
        await fetchEmployeeData(); // Refresh data
      } else {
        const errorResult = await response.json();
        setError(`Failed to submit leave request: ${errorResult.message}`);
      }
    } catch (error) {
      console.error('❌ Error submitting leave request:', error);
      setError('Error submitting leave request');
    } finally {
      setActionLoading('');
    }
  };

  const updatePersonalDetails = async () => {
    setActionLoading('update-personal');
    try {
      const response = await fetch(`http://localhost:8080/api/employee/personal-details/${user.firebaseUid}`, {
        method: 'PUT',
        headers: {
          'Authorization': 'Basic ' + btoa('user:password123'),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(personalEditData)
      });

      if (response.ok) {
        console.log('✅ Personal details updated successfully');
        setShowPersonalEditModal(false);
        await fetchEmployeeData(); // Refresh data
      } else {
        const errorResult = await response.json();
        setError(`Failed to update personal details: ${errorResult.message}`);
      }
    } catch (error) {
      console.error('❌ Error updating personal details:', error);
      setError('Error updating personal details');
    } finally {
      setActionLoading('');
    }
  };

  const downloadDocument = async (documentId: number, fileName: string) => {
    setActionLoading(`download-${documentId}`);
    try {
      const response = await fetch(`http://localhost:8080/api/employee/documents/${documentId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + btoa('user:password123')
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        setError('Failed to download document');
      }
    } catch (error) {
      console.error('❌ Error downloading document:', error);
      setError('Error downloading document');
    } finally {
      setActionLoading('');
    }
  };

  const downloadPayslip = async (payrollId: number, period: string) => {
    setActionLoading(`download-payslip-${payrollId}`);
    try {
      const response = await fetch(`http://localhost:8080/api/employee/payslip/${payrollId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + btoa('user:password123')
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payslip_${period}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        setError('Failed to download payslip');
      }
    } catch (error) {
      console.error('❌ Error downloading payslip:', error);
      setError('Error downloading payslip');
    } finally {
      setActionLoading('');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateLeaveDays = () => {
    if (!newLeaveRequest.startDate || !newLeaveRequest.endDate) return 0;
    const start = new Date(newLeaveRequest.startDate);
    const end = new Date(newLeaveRequest.endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'processed': return 'bg-blue-100 text-blue-800';
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!employeeData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-red-600">Failed to load employee data</p>
          <button 
            onClick={fetchEmployeeData}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Employee Portal</h1>
              <p className="text-gray-600 mt-2">Welcome back, {user.firstName} {user.lastName}!</p>
              <p className="text-sm text-gray-500">Employee ID: {employeeData.personalDetails.employeeId}</p>
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
            <button onClick={() => setError('')} className="ml-4 text-red-500 hover:text-red-700">×</button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'payroll', label: 'Payroll & Salary' },
                { id: 'leave', label: 'Leave Management' },
                { id: 'personal', label: 'Personal Details' },
                { id: 'documents', label: 'Documents' },
                { id: 'attendance', label: 'Attendance' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-green-500 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold">Leave Balance</h3>
                <p className="text-3xl font-bold mt-2">{employeeData.leaveBalance.annualLeave.remaining}</p>
                <p className="text-sm mt-2 opacity-90">Annual leave days</p>
              </div>
              <div className="bg-blue-500 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold">This Month</h3>
                <p className="text-3xl font-bold mt-2">{employeeData.attendance.thisMonth.present}</p>
                <p className="text-sm mt-2 opacity-90">Days present</p>
              </div>
              <div className="bg-purple-500 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold">Pending Requests</h3>
                <p className="text-3xl font-bold mt-2">
                  {employeeData.leaveRequests.filter(r => r.status === 'pending').length}
                </p>
                <p className="text-sm mt-2 opacity-90">Leave requests</p>
              </div>
              <div className="bg-indigo-500 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold">Current Salary</h3>
                <p className="text-3xl font-bold mt-2">${employeeData.salary.currentSalary.toLocaleString()}</p>
                <p className="text-sm mt-2 opacity-90">Monthly gross</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setShowLeaveModal(true)}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition duration-200"
                >
                  <h3 className="font-semibold text-gray-700">Request Leave</h3>
                  <p className="text-sm text-gray-500 mt-1">Submit a new leave request</p>
                </button>
                
                <button
                  onClick={() => setActiveTab('payroll')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition duration-200"
                >
                  <h3 className="font-semibold text-gray-700">View Payslips</h3>
                  <p className="text-sm text-gray-500 mt-1">Download salary documents</p>
                </button>
                
                <button
                  onClick={() => setActiveTab('documents')}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition duration-200"
                >
                  <h3 className="font-semibold text-gray-700">My Documents</h3>
                  <p className="text-sm text-gray-500 mt-1">Access important files</p>
                </button>
                
                <button
                  onClick={() => {
                    setPersonalEditData({
                      phone: employeeData.personalDetails.phone || '',
                      address: employeeData.personalDetails.address || '',
                      emergencyContact: employeeData.personalDetails.emergencyContact || { name: '', phone: '', relationship: '' }
                    });
                    setShowPersonalEditModal(true);
                  }}
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition duration-200"
                >
                  <h3 className="font-semibold text-gray-700">Update Profile</h3>
                  <p className="text-sm text-gray-500 mt-1">Edit personal information</p>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {employeeData.leaveRequests.slice(0, 3).map((request) => (
                  <div key={request.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">Leave Request - {request.leaveType}</p>
                      <p className="text-sm text-gray-600">
                        {formatDate(request.startDate)} to {formatDate(request.endDate)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                ))}
                
                {employeeData.payrolls.slice(0, 2).map((payroll) => (
                  <div key={payroll.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">Payroll - {payroll.period}</p>
                      <p className="text-sm text-gray-600">Net: ${payroll.netSalary.toLocaleString()}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(payroll.status)}`}>
                      {payroll.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Payroll Tab */}
        {activeTab === 'payroll' && (
          <div className="space-y-6">
            {/* Salary Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Salary Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Current Salary</h3>
                  <p className="text-2xl font-bold text-blue-800">
                    ${employeeData.salary.currentSalary.toLocaleString()} {employeeData.salary.currency}
                  </p>
                  <p className="text-sm text-blue-600 mt-1">Monthly gross salary</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Salary Grade</h3>
                  <p className="text-lg font-bold text-green-800">{employeeData.salary.salaryGrade}</p>
                  <p className="text-sm text-green-600 mt-1">
                    Next Review: {formatDate(employeeData.salary.nextReviewDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Payroll History */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Payroll History</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Base Salary</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overtime</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deductions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Net Salary</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {employeeData.payrolls.map((payroll) => (
                      <tr key={payroll.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{payroll.period}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${payroll.baseSalary.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${payroll.overtime.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${payroll.deductions.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold">${payroll.netSalary.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(payroll.status)}`}>
                            {payroll.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedPayslip(payroll);
                                setShowPayslipModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 text-sm"
                            >
                              View
                            </button>
                            <button
                              onClick={() => downloadPayslip(payroll.id, payroll.period)}
                              disabled={actionLoading === `download-payslip-${payroll.id}`}
                              className="text-green-600 hover:text-green-900 text-sm disabled:opacity-50"
                            >
                              {actionLoading === `download-payslip-${payroll.id}` ? 'Downloading...' : 'Download'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Leave Tab */}
        {activeTab === 'leave' && (
          <div className="space-y-6">
            {/* Leave Balance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(employeeData.leaveBalance).map(([leaveType, balance]) => (
                <div key={leaveType} className="bg-white rounded-lg shadow p-6">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {leaveType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Used</span>
                    <span className="font-medium">{balance.used}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Remaining</span>
                    <span className="font-medium text-green-600">{balance.remaining}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(balance.used / balance.total) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Total: {balance.total} days</p>
                </div>
              ))}
            </div>

            {/* Leave Requests */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">My Leave Requests</h2>
                <button
                  onClick={() => setShowLeaveModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Request Leave
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {employeeData.leaveRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {request.leaveType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            {formatDate(request.startDate)} - {formatDate(request.endDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{request.totalDays}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm max-w-xs truncate">{request.reason}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(request.appliedDate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )} {/* Personal Tab */}
        {activeTab === 'personal' && (
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Basic Details</h3>
                  <div className="space-y-2">
                    <p><span className="text-gray-600">Full Name:</span> {user.firstName} {user.lastName}</p>
                    <p><span className="text-gray-600">Email:</span> {user.email}</p>
                    <p><span className="text-gray-600">Employee ID:</span> {employeeData.personalDetails.employeeId}</p>
                    <p><span className="text-gray-600">Phone:</span> {employeeData.personalDetails.phone || 'Not provided'}</p>
                    <p><span className="text-gray-600">Date of Birth:</span> {employeeData.personalDetails.dateOfBirth ? formatDate(employeeData.personalDetails.dateOfBirth) : 'Not provided'}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-700 mb-3">Work Information</h3>
                  <div className="space-y-2">
                    <p><span className="text-gray-600">Department:</span> {employeeData.personalDetails.department}</p>
                    <p><span className="text-gray-600">Position:</span> {employeeData.personalDetails.position}</p>
                    <p><span className="text-gray-600">Join Date:</span> {formatDate(employeeData.personalDetails.joinDate)}</p>
                    <p><span className="text-gray-600">Manager:</span> {employeeData.personalDetails.manager}</p>
                  </div>
                </div>
              </div>
              
              {employeeData.personalDetails.address && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-700 mb-2">Address</h3>
                  <p className="text-gray-600">{employeeData.personalDetails.address}</p>
                </div>
              )}
              
              {employeeData.personalDetails.emergencyContact && (
                <div className="mt-6">
                  <h3 className="font-medium text-gray-700 mb-2">Emergency Contact</h3>
                  <div className="space-y-1">
                    <p><span className="text-gray-600">Name:</span> {employeeData.personalDetails.emergencyContact.name}</p>
                    <p><span className="text-gray-600">Phone:</span> {employeeData.personalDetails.emergencyContact.phone}</p>
                    <p><span className="text-gray-600">Relationship:</span> {employeeData.personalDetails.emergencyContact.relationship}</p>
                  </div>
                </div>
              )}
              
              <div className="mt-6">
                <button
                  onClick={() => {
                    setPersonalEditData({
                      phone: employeeData.personalDetails.phone || '',
                      address: employeeData.personalDetails.address || '',
                      emergencyContact: employeeData.personalDetails.emergencyContact || { name: '', phone: '', relationship: '' }
                    });
                    setShowPersonalEditModal(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Edit Personal Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">My Documents</h2>
              
              {employeeData.documents.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No documents uploaded yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {employeeData.documents.map((document) => (
                    <div key={document.id} className="border rounded-lg p-4 hover:shadow-md transition duration-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 truncate">{document.name}</h3>
                          <p className="text-sm text-gray-500 capitalize">{document.type}</p>
                        </div>
                        <div className="text-gray-400">
                          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 mb-3">
                        <p>Uploaded: {formatDate(document.uploadDate)}</p>
                        <p>Size: {document.size}</p>
                      </div>
                      
                      <button
                        onClick={() => downloadDocument(document.id, document.name)}
                        disabled={actionLoading === `download-${document.id}`}
                        className="w-full bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                      >
                        {actionLoading === `download-${document.id}` ? 'Downloading...' : 'Download'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            {/* Monthly Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">This Month's Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{employeeData.attendance.thisMonth.totalDays}</div>
                  <div className="text-sm text-blue-800">Total Days</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{employeeData.attendance.thisMonth.present}</div>
                  <div className="text-sm text-green-800">Present</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{employeeData.attendance.thisMonth.absent}</div>
                  <div className="text-sm text-red-800">Absent</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{employeeData.attendance.thisMonth.late}</div>
                  <div className="text-sm text-yellow-800">Late</div>
                </div>
              </div>
            </div>

            {/* Recent Attendance Records */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Attendance Records</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check In</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check Out</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Hours</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {employeeData.attendance.recentRecords.map((record, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium">
                          {formatDate(record.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.checkIn}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.checkOut}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.totalHours}h</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(record.status)}`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Leave Request Modal */}
        {showLeaveModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Request Leave</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                    <select
                      value={newLeaveRequest.leaveType}
                      onChange={(e) => setNewLeaveRequest({...newLeaveRequest, leaveType: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="ANNUAL">Annual Leave</option>
                      <option value="SICK">Sick Leave</option>
                      <option value="PERSONAL">Personal Leave</option>
                      <option value="EMERGENCY">Emergency Leave</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={newLeaveRequest.startDate}
                      onChange={(e) => setNewLeaveRequest({...newLeaveRequest, startDate: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={newLeaveRequest.endDate}
                      onChange={(e) => setNewLeaveRequest({...newLeaveRequest, endDate: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      min={newLeaveRequest.startDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  {newLeaveRequest.startDate && newLeaveRequest.endDate && (
                    <div className="bg-blue-50 p-2 rounded">
                      <p className="text-sm text-blue-800">
                        Total days: {calculateLeaveDays()}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <textarea
                      value={newLeaveRequest.reason}
                      onChange={(e) => setNewLeaveRequest({...newLeaveRequest, reason: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      rows={3}
                      placeholder="Please provide a reason for your leave request..."
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowLeaveModal(false);
                      setNewLeaveRequest({ leaveType: 'ANNUAL', startDate: '', endDate: '', reason: '' });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitLeaveRequest}
                    disabled={actionLoading === 'submit-leave'}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {actionLoading === 'submit-leave' ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payslip Details Modal */}
        {showPayslipModal && selectedPayslip && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Payslip Details - {selectedPayslip.period}</h3>
                  <button
                    onClick={() => setShowPayslipModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800">Earnings</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Base Salary:</span>
                        <span>${selectedPayslip.baseSalary.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Overtime:</span>
                        <span>${selectedPayslip.overtime.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bonuses:</span>
                        <span>${selectedPayslip.bonuses.toLocaleString()}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Gross Total:</span>
                          <span>${(selectedPayslip.baseSalary + selectedPayslip.overtime + selectedPayslip.bonuses).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800">Deductions</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Deductions:</span>
                        <span>-${selectedPayslip.deductions.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxes:</span>
                        <span>-${selectedPayslip.taxes.toLocaleString()}</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total Deductions:</span>
                          <span>-${(selectedPayslip.deductions + selectedPayslip.taxes).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-green-800">Net Salary:</span>
                    <span className="text-xl font-bold text-green-600">${selectedPayslip.netSalary.toLocaleString()}</span>
                  </div>
                  {selectedPayslip.paidDate && (
                    <p className="text-sm text-green-600 mt-1">Paid on: {formatDate(selectedPayslip.paidDate)}</p>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => downloadPayslip(selectedPayslip.id, selectedPayslip.period)}
                    disabled={actionLoading === `download-payslip-${selectedPayslip.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {actionLoading === `download-payslip-${selectedPayslip.id}` ? 'Downloading...' : 'Download PDF'}
                  </button>
                  <button
                    onClick={() => setShowPayslipModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Personal Details Edit Modal */}
        {showPersonalEditModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Personal Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={personalEditData.phone}
                      onChange={(e) => setPersonalEditData({...personalEditData, phone: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      value={personalEditData.address}
                      onChange={(e) => setPersonalEditData({...personalEditData, address: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      rows={3}
                      placeholder="Enter your address"
                    />
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Emergency Contact</h4>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={personalEditData.emergencyContact.name}
                        onChange={(e) => setPersonalEditData({
                          ...personalEditData,
                          emergencyContact: {...personalEditData.emergencyContact, name: e.target.value}
                        })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        placeholder="Contact name"
                      />
                      <input
                        type="tel"
                        value={personalEditData.emergencyContact.phone}
                        onChange={(e) => setPersonalEditData({
                          ...personalEditData,
                          emergencyContact: {...personalEditData.emergencyContact, phone: e.target.value}
                        })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        placeholder="Contact phone"
                      />
                      <input
                        type="text"
                        value={personalEditData.emergencyContact.relationship}
                        onChange={(e) => setPersonalEditData({
                          ...personalEditData,
                          emergencyContact: {...personalEditData.emergencyContact, relationship: e.target.value}
                        })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                        placeholder="Relationship (e.g., Spouse, Parent)"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowPersonalEditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={updatePersonalDetails}
                    disabled={actionLoading === 'update-personal'}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {actionLoading === 'update-personal' ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;  
