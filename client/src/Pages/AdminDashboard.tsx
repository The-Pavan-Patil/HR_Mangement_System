import React from 'react'

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

type Props = {}

const AdminDashboard: React.FC<{ user: UserProfile; onLogout: () => void }> = ({ user, onLogout }) => (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="max-w-6xl mx-auto">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-500 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold">Total Employees</h3>
          <p className="text-3xl font-bold mt-2">245</p>
        </div>
        <div className="bg-green-500 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold">Active Projects</h3>
          <p className="text-3xl font-bold mt-2">12</p>
        </div>
        <div className="bg-purple-500 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold">Pending Approvals</h3>
          <p className="text-3xl font-bold mt-2">8</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Admin Features</h2>
        <div className="space-y-2">
          <p>• Manage all users and roles</p>
          <p>• Access system-wide reports</p>
          <p>• Configure system settings</p>
          <p>• Monitor system performance</p>
          <p>• Manage departments and organizational structure</p>
        </div>
      </div>
    </div>
  </div>
);

export default AdminDashboard