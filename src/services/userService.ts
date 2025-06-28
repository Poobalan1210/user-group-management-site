import { apiGet, apiPost, apiPut } from '../api/api';

export interface User {
  email: string;
  name: string;
  linkedinUrl?: string;
  githubUrl?: string;
  totalPoints: number;
  totalSubmissions: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  linkedinUrl?: string;
  githubUrl?: string;
  createdAt?: string;
}

export interface UpdateUserRequest {
  name?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

export const UserService = {
  // Create a new user
  createUser: async (userData: CreateUserRequest): Promise<User> => {
    return await apiPost<User>('/users', userData);
  },

  // Get user by email
  getUserByEmail: async (email: string): Promise<User> => {
    return await apiGet<User>(`/users/email/${email}`);
  },

  // Get all users
  getAllUsers: async (): Promise<User[]> => {
    return await apiGet<User[]>('/users');
  },

  // Update user
  updateUser: async (email: string, userData: UpdateUserRequest): Promise<User> => {
    return await apiPut<User>(`/users/email/${email}`, userData);
  }
};