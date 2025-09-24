
export interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'admin' | 'hr' | 'manager' | 'employee' | 'recruiter';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface LoginData {
  email: string;
  password: string;
}