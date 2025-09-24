import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { auth } from './firebase';
import type { RegisterData, LoginData } from '../types/user';

export const authService = {
  async login(data: LoginData) {
    return await signInWithEmailAndPassword(auth, data.email, data.password);
  },

  async register(data: RegisterData) {
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      data.email, 
      data.password
    );
    
    // Send additional user data to Spring Boot backend
    const userData = {
      uid: userCredential.user.uid,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role
    };
    
    // Call backend API to save user profile
    await this.saveUserProfile(userData);
    
    return userCredential;
  },

  async logout() {
    return await signOut(auth);
  },

  async saveUserProfile(userData: any) {
    const response = await fetch('/api/users/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa('user:password123')
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to save user profile');
    }
    
    return response.json();
  }
};