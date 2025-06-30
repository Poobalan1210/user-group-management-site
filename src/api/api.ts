import axios from 'axios';
import { AuthService } from '../auth/auth';

const API_BASE_URL = import.meta.env.API_ENDPOINT;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add authentication token to requests
apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await AuthService.getJwtToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  return config;
});

export const apiGet = <T>(url: string, params?: object) => {
  return apiClient.get<T>(url, { params }).then(res => res.data);
};


export const apiPost = <T>(url: string, data?: object) => {
  return apiClient.post<T>(url, data).then(res => res.data);
};


export const apiPut = <T>(url: string, data?: object) => {
  return apiClient.put<T>(url, data).then(res => res.data);
};


export const apiDelete = <T>(url: string) => {
  return apiClient.delete<T>(url).then(res => res.data);
};