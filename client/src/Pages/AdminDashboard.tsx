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

interface AdminStats {
  totalEmployees: number;
  activeEmployees: number;
  totalAdmins: number;
  totalManagers: number;
  totalHRs: number;
  totalRecruiters: number;
  recentRegistrations: number;
}

interface AdminDashboardProps {
  user: UserProfile;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [stats, setStats] = useState<AdminStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    totalAdmins: 0,
    totalManagers: 0,
    totalHRs: 0,
    totalRecruiters: 0,
    recentRegistrations: 0
  });
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all users
      const usersResponse = await fetch('http://localhost:8080/api/users', {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + btoa('user:password123'),
          'Content-Type': 'application/json'
        }
      });

      if (usersResponse.ok) {
        const usersResult = await usersResponse.json();
        if (usersResult.success) {
          const users = usersResult.data;
          setAllUsers(users);
          
          // Calculate statistics
          const stats: AdminStats = {
            totalEmployees: users.length,
            activeEmployees: users.filter((u: UserProfile) => u.isActive).length,
            totalAdmins: users.filter((u: UserProfile) => u.role === 'ADMIN').length,
            totalManagers: users.filter((u: UserProfile) => u.role === 'MANAGER').length,
            totalHRs: users.filter((u: UserProfile) => u.role === 'HR').length,
            totalRecruiters: users.filter((u: UserProfile) => u.role === 'RECRUITER').length,
            recentRegistrations: users.filter((u: UserProfile) => {
              const createdDate = new Date(u.createdAt);
              const sevenDaysAgo = new Date();
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
              return createdDate > sevenDaysAgo;
            }).length
          };
          
          setStats(stats);
          console.log('✅ Admin dashboard data loaded:', { stats, totalUsers: users.length });
        }
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('❌ Error fetching admin dashboard data:', error);
      setError('Error connecting to backend service');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = selectedRole === 'ALL' 
    ? allUsers 
    : allUsers.filter(u => u.role === selectedRole);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-blue-500 text-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold">Total Employees</h3>
            <p className="text-3xl font-bold mt-2">{stats.totalEmployees}</p>
            <p className="text-sm mt-2 opacity-90">All registered users</p>
          </div>
          <div className="bg-green-500 text-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold">Active Employees</h3>
            <p className="text-3xl font-bold mt-2">{stats.activeEmployees}</p>
            <p className="text-sm mt-2 opacity-90">Currently active users</p>
          </div>
          <div className="bg-purple-500 text-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold">New Registrations</h3>
            <p className="text-3xl font-bold mt-2">{stats.recentRegistrations}</p>
            <p className="text-sm mt-2 opacity-90">Last 7 days</p>
          </div>
          <div className="bg-orange-500 text-white p-6 rounded-lg">
            <h3 className="text-lg font-semibold">System Health</h3>
            <p className="text-3xl font-bold mt-2">99.9%</p>
            <p className="text-sm mt-2 opacity-90">Uptime status</p>
          </div>
        </div>

        {/* Role Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Role Distribution</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Employees</span>
                <span className="font-semibold text-blue-600">
                  {allUsers.filter(u => u.role === 'EMPLOYEE').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Managers</span>
                <span className="font-semibold text-green-600">{stats.totalManagers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">HR Managers</span>
                <span className="font-semibold text-purple-600">{stats.totalHRs}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Recruiters</span>
                <span className="font-semibold text-orange-600">{stats.totalRecruiters}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Admins</span>
                <span className="font-semibold text-red-600">{stats.totalAdmins}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">System Overview</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Database Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Connected</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Authentication</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Backup Status</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Scheduled</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Security Scan</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Clean</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">User Management</h2>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Roles</option>
              <option value="EMPLOYEE">Employees</option>
              <option value="MANAGER">Managers</option>
              <option value="HR">HR Managers</option>
              <option value="RECRUITER">Recruiters</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
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
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                        user.role === 'HR' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'MANAGER' ? 'bg-blue-100 text-blue-800' :
                        user.role === 'RECRUITER' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found for the selected role.
            </div>
          )}
        </div>

        {/* Admin Features */}
        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Admin Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition duration-200">
              <h3 className="font-semibold text-gray-700">User Management</h3>
              <p className="text-sm text-gray-500 mt-1">Manage user roles and permissions</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition duration-200">
              <h3 className="font-semibold text-gray-700">System Reports</h3>
              <p className="text-sm text-gray-500 mt-1">Access comprehensive system reports</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition duration-200">
              <h3 className="font-semibold text-gray-700">Security Settings</h3>
              <p className="text-sm text-gray-500 mt-1">Configure security and compliance</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition duration-200">
              <h3 className="font-semibold text-gray-700">Database Management</h3>
              <p className="text-sm text-gray-500 mt-1">Monitor and maintain database</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-500 hover:bg-red-50 transition duration-200">
              <h3 className="font-semibold text-gray-700">System Monitoring</h3>
              <p className="text-sm text-gray-500 mt-1">Real-time system performance</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition duration-200">
              <h3 className="font-semibold text-gray-700">Backup & Recovery</h3>
              <p className="text-sm text-gray-500 mt-1">Manage data backup and recovery</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;