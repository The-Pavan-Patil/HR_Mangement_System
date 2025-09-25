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
    recentActivities: []
  });
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'activities'>('overview');

  useEffect(() => {
    fetchHRDashboardData();
  }, []);

  const fetchHRDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all employees (non-admin users)
      const employeesResponse = await fetch('http://localhost:8080/api/users', {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + btoa('user:password123'),
          'Content-Type': 'application/json'
        }
      });

      if (employeesResponse.ok) {
        const employeesResult = await employeesResponse.json();
        if (employeesResult.success) {
          const allUsers = employeesResult.data;
          // Filter out admin users for HR management
          const employeeUsers = allUsers.filter((u: UserProfile) => u.role !== 'ADMIN');
          setEmployees(employeeUsers);
          
          // Calculate HR-specific statistics
          const currentDate = new Date();
          const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          
          const hrStats: HRStats = {
            totalEmployees: employeeUsers.length,
            activeEmployees: employeeUsers.filter((u: UserProfile) => u.isActive).length,
            newHiresThisMonth: employeeUsers.filter((u: UserProfile) => {
              const createdDate = new Date(u.createdAt);
              return createdDate >= firstDayOfMonth;
            }).length,
            pendingLeaveRequests: Math.floor(Math.random() * 10) + 5, // Mock data
            upcomingPerformanceReviews: Math.floor(Math.random() * 15) + 10, // Mock data
            employeesByDepartment: {
              'Engineering': employeeUsers.filter((u: { role: string; }) => u.role === 'EMPLOYEE').length,
              'Management': employeeUsers.filter((u: { role: string; }) => u.role === 'MANAGER').length,
              'Recruitment': employeeUsers.filter((u: { role: string; }) => u.role === 'RECRUITER').length,
              'Human Resources': employeeUsers.filter((u: { role: string; }) => u.role === 'HR').length,
            },
            recentActivities: [
              {
                id: 1,
                type: 'registration',
                message: 'New employee registered',
                timestamp: new Date().toISOString(),
                status: 'completed'
              },
              {
                id: 2,
                type: 'leave',
                message: 'Leave request submitted',
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                status: 'pending'
              },
              {
                id: 3,
                type: 'review',
                message: 'Performance review completed',
                timestamp: new Date(Date.now() - 7200000).toISOString(),
                status: 'completed'
              }
            ]
          };
          
          setStats(hrStats);
          console.log('✅ HR dashboard data loaded:', { hrStats, totalEmployees: employeeUsers.length });
        }
      } else {
        setError('Failed to fetch HR dashboard data');
      }
    } catch (error) {
      console.error('❌ Error fetching HR dashboard data:', error);
      setError('Error connecting to backend service');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
              <p className="text-gray-600 mt-2">Welcome back, {user.firstName} {user.lastName}!</p>
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
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('employees')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'employees'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Employee Management
              </button>
              <button
                onClick={() => setActiveTab('activities')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'activities'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Recent Activities
              </button>
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* HR Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-indigo-500 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold">Total Employees</h3>
                <p className="text-3xl font-bold mt-2">{stats.totalEmployees}</p>
                <p className="text-sm mt-2 opacity-90">Under HR management</p>
              </div>
              <div className="bg-green-500 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold">Active Employees</h3>
                <p className="text-3xl font-bold mt-2">{stats.activeEmployees}</p>
                <p className="text-sm mt-2 opacity-90">Currently working</p>
              </div>
              <div className="bg-blue-500 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold">New Hires</h3>
                <p className="text-3xl font-bold mt-2">{stats.newHiresThisMonth}</p>
                <p className="text-sm mt-2 opacity-90">This month</p>
              </div>
              <div className="bg-yellow-500 text-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold">Pending Reviews</h3>
                <p className="text-3xl font-bold mt-2">{stats.upcomingPerformanceReviews}</p>
                <p className="text-sm mt-2 opacity-90">Performance reviews</p>
              </div>
            </div>

            {/* Department Distribution and HR Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Department Distribution</h2>
                <div className="space-y-3">
                  {Object.entries(stats.employeesByDepartment).map(([dept, count]) => (
                    <div key={dept} className="flex justify-between items-center">
                      <span className="text-gray-600">{dept}</span>
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ 
                              width: `${Math.min((count / Math.max(...Object.values(stats.employeesByDepartment))) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="font-semibold text-blue-600 min-w-[2rem]">{count}</span>
                      </div>
                    </div>
                  ))}
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
                    <span className="text-gray-600">Average Performance Score</span>
                    <span className="font-semibold text-blue-600">4.2/5.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Leave Requests</span>
                    <span className="font-semibold text-yellow-600">{stats.pendingLeaveRequests} pending</span>
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
                  <h3 className="font-semibold text-gray-700">Add New Employee</h3>
                  <p className="text-sm text-gray-500 mt-1">Register a new team member</p>
                </button>
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition duration-200">
                  <h3 className="font-semibold text-gray-700">Review Leave Requests</h3>
                  <p className="text-sm text-gray-500 mt-1">{stats.pendingLeaveRequests} pending approvals</p>
                </button>
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition duration-200">
                  <h3 className="font-semibold text-gray-700">Performance Reviews</h3>
                  <p className="text-sm text-gray-500 mt-1">Schedule and manage reviews</p>
                </button>
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition duration-200">
                  <h3 className="font-semibold text-gray-700">Payroll Management</h3>
                  <p className="text-sm text-gray-500 mt-1">Process monthly payroll</p>
                </button>
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition duration-200">
                  <h3 className="font-semibold text-gray-700">Training Programs</h3>
                  <p className="text-sm text-gray-500 mt-1">Assign and track training</p>
                </button>
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition duration-200">
                  <h3 className="font-semibold text-gray-700">Generate Reports</h3>
                  <p className="text-sm text-gray-500 mt-1">HR analytics and insights</p>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Employee Management Tab */}
        {activeTab === 'employees' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Employee Directory</h2>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200">
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
                              {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500">ID: {employee.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{employee.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          employee.role === 'HR' ? 'bg-purple-100 text-purple-800' :
                          employee.role === 'MANAGER' ? 'bg-blue-100 text-blue-800' :
                          employee.role === 'RECRUITER' ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {employee.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {employee.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(employee.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-indigo-600 hover:text-indigo-900 px-2 py-1 rounded">
                            View
                          </button>
                          <button className="text-yellow-600 hover:text-yellow-900 px-2 py-1 rounded">
                            Edit
                          </button>
                          {employee.isActive ? (
                            <button className="text-red-600 hover:text-red-900 px-2 py-1 rounded">
                              Deactivate
                            </button>
                          ) : (
                            <button className="text-green-600 hover:text-green-900 px-2 py-1 rounded">
                              Activate
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
        {activeTab === 'activities' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Recent HR Activities</h2>
            
            <div className="space-y-4">
              {stats.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center p-4 border border-gray-200 rounded-lg">
                  <div className={`w-3 h-3 rounded-full mr-4 ${
                    activity.type === 'registration' ? 'bg-green-500' :
                    activity.type === 'leave' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                        activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDateTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Additional mock activities */}
              <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                <div className="w-3 h-3 rounded-full mr-4 bg-purple-500"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">Training program assigned</p>
                    <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                      in-progress
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDateTime(new Date(Date.now() - 10800000).toISOString())}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                <div className="w-3 h-3 rounded-full mr-4 bg-red-500"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">Payroll processed for March</p>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      completed
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDateTime(new Date(Date.now() - 86400000).toISOString())}
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
      </div>
    </div>
  );
};

export default HRDashboard;