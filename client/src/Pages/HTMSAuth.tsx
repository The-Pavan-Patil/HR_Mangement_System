import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { firebaseConfig } from '../services/firebase';
import HRDashboard from './HrDashboard';
import AdminDashboard from './AdminDashboard';
import EmployeeDashboard from './EmployeeDashboard';


// Firebase configuration (replace with your config)


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
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

interface FormData {
  email: string;
  password: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

// Role-based page components

// const HRDashboard: React.FC<{ user: UserProfile; onLogout: () => void }> = ({ user, onLogout }) => (
//   <div className="min-h-screen bg-gray-50 p-6">
//     <div className="max-w-6xl mx-auto">
//       <header className="bg-white shadow rounded-lg p-6 mb-6">
//         <div className="flex justify-between items-center">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
//             <p className="text-gray-600 mt-2">Welcome back, {user.firstName} {user.lastName}!</p>
//           </div>
//           <button
//             onClick={onLogout}
//             className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
//           >
//             Logout
//           </button>
//         </div>
//       </header>

//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
//         <div className="bg-indigo-500 text-white p-6 rounded-lg">
//           <h3 className="text-lg font-semibold">Employee Records</h3>
//           <p className="text-3xl font-bold mt-2">245</p>
//         </div>
//         <div className="bg-yellow-500 text-white p-6 rounded-lg">
//           <h3 className="text-lg font-semibold">Leave Requests</h3>
//           <p className="text-3xl font-bold mt-2">15</p>
//         </div>
//         <div className="bg-pink-500 text-white p-6 rounded-lg">
//           <h3 className="text-lg font-semibold">Recruitment</h3>
//           <p className="text-3xl font-bold mt-2">7</p>
//         </div>
//         <div className="bg-teal-500 text-white p-6 rounded-lg">
//           <h3 className="text-lg font-semibold">Performance Reviews</h3>
//           <p className="text-3xl font-bold mt-2">23</p>
//         </div>
//       </div>

//       <div className="bg-white rounded-lg shadow p-6">
//         <h2 className="text-xl font-semibold mb-4">HR Management Features</h2>
//         <div className="space-y-2">
//           <p>• Employee lifecycle management</p>
//           <p>• Leave and attendance tracking</p>
//           <p>• Performance management</p>
//           <p>• Payroll processing</p>
//           <p>• Policy management</p>
//         </div>
//       </div>
//     </div>
//   </div>
// );

const ManagerDashboard: React.FC<{ user: UserProfile; onLogout: () => void }> = ({ user, onLogout }) => (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="max-w-6xl mx-auto">
      <header className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manager Dashboard</h1>
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
          <h3 className="text-lg font-semibold">Team Members</h3>
          <p className="text-3xl font-bold mt-2">12</p>
        </div>
        <div className="bg-orange-500 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold">Pending Approvals</h3>
          <p className="text-3xl font-bold mt-2">5</p>
        </div>
        <div className="bg-green-500 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold">Team Performance</h3>
          <p className="text-3xl font-bold mt-2">87%</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Manager Features</h2>
        <div className="space-y-2">
          <p>• Team management and oversight</p>
          <p>• Approve leave requests</p>
          <p>• Performance reviews</p>
          <p>• Team attendance monitoring</p>
          <p>• Goal setting and tracking</p>
        </div>
      </div>
    </div>
  </div>
);



const RecruiterDashboard: React.FC<{ user: UserProfile; onLogout: () => void }> = ({ user, onLogout }) => (
  <div className="min-h-screen bg-gray-50 p-6">
    <div className="max-w-6xl mx-auto">
      <header className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Recruiter Dashboard</h1>
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-cyan-500 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold">Open Positions</h3>
          <p className="text-3xl font-bold mt-2">8</p>
        </div>
        <div className="bg-emerald-500 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold">Applications</h3>
          <p className="text-3xl font-bold mt-2">45</p>
        </div>
        <div className="bg-amber-500 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold">Interviews Scheduled</h3>
          <p className="text-3xl font-bold mt-2">12</p>
        </div>
        <div className="bg-rose-500 text-white p-6 rounded-lg">
          <h3 className="text-lg font-semibold">Offers Extended</h3>
          <p className="text-3xl font-bold mt-2">3</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recruitment Features</h2>
        <div className="space-y-2">
          <p>• Job posting management</p>
          <p>• Candidate tracking and screening</p>
          <p>• Interview scheduling</p>
          <p>• Offer management</p>
          <p>• Recruitment analytics</p>
        </div>
      </div>
    </div>
  </div>
);

const HRMSAuth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [dbCheckLoading, setDbCheckLoading] = useState(false);
  const [isRegistering] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'EMPLOYEE'
  });

  const fetchUserProfile = async (uid: string) => {
    setDbCheckLoading(true);
    try {
      // Use HTTP Basic Auth instead of Firebase token for user profile endpoints
      const response = await fetch(`/api/users/profile/${uid}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + btoa('user:password123'),
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setUserProfile(result.data);
          console.log('✅ User profile loaded from database:', result.data);
        }
      } else {
        console.error('❌ Failed to fetch user profile:', response.status);
        setError('Failed to load user profile from database');
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      setError('Error connecting to backend service');
    } finally {
      setDbCheckLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        });

        // Only fetch user profile if we're not in the middle of registration
        if (!isRegistering) {
          await fetchUserProfile(user.uid);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isRegistering]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password || ''
      );
      
      // Save user data to backend
      const userData = {
        uid: userCredential.user.uid,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role
      };
      
      console.log('🔄 Saving user to database:', userData);

      // Use HTTP Basic Auth instead of Firebase token for user profile endpoints
      const response = await fetch('/api/users/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa('user:password123')
        },
        body: JSON.stringify(userData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ User saved to database successfully:', result);
        setUserProfile(result.data);
      } else {
        const errorResult = await response.json();
        console.error('❌ Failed to save user to database:', errorResult);
        setError(`Database Error: ${errorResult.message || 'Failed to save user profile'}`);
      }
      
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (isLogin) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      role: 'EMPLOYEE'
    });
  };

  const renderRoleBasedDashboard = () => {
    if (!userProfile) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading user profile...</p>
          </div>
        </div>
      );
    }

    switch (userProfile.role?.toLowerCase()) {
      case 'admin':
        return <AdminDashboard user={userProfile} onLogout={handleLogout} />;
      case 'hr':
        return <HRDashboard user={userProfile} onLogout={handleLogout} />;
      case 'manager':
        return <ManagerDashboard user={userProfile} onLogout={handleLogout} />;
      case 'employee':
        return <EmployeeDashboard user={userProfile} onLogout={handleLogout} />;
      case 'recruiter':
        return <RecruiterDashboard user={userProfile} onLogout={handleLogout} />;
      default:
        return <EmployeeDashboard user={userProfile} onLogout={handleLogout} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user && userProfile) {
    return renderRoleBasedDashboard();
  }

  if (user && dbCheckLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Verifying Profile</h2>
            <p className="text-gray-600">Checking database for user information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isLogin ? 'Sign in to HRMS' : 'Create Account'}
          </h2>
          <p className="text-gray-600 mt-2">
            {isLogin ? 'Welcome back!' : 'Join our HR Management System'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MANAGER">Manager</option>
                  <option value="HR">HR Manager</option>
                  <option value="ADMIN">Admin</option>
                  <option value="RECRUITER">Recruiter</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="john.doe@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button
            onClick={toggleMode}
            className="mt-2 text-blue-600 hover:text-blue-700 font-medium transition duration-200"
          >
            {isLogin ? 'Register New User' : 'Sign In'}
          </button>
        </div>

        {isLogin && (
          <div className="mt-4 text-center">
            <button
              className="text-sm text-blue-600 hover:text-blue-700 transition duration-200"
              onClick={() => alert('Password reset functionality would be implemented here')}
            >
              Forgot your password?
            </button>
          </div>
        )}

        {/* Database Connection Status */}
        <div className="mt-4 text-center">
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            Backend API: http://localhost:8080/api
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRMSAuth;