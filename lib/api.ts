const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// API Response interface
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

// Request helper function
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();
    
    if (!response.ok) {
      console.error('API Error:', data);
      return {
        success: false,
        message: data.message || 'An error occurred',
        errors: data.errors,
      };
    }
    
    return data;
  } catch (error) {
    console.error('Network Error:', error);
    return {
      success: false,
      message: 'Network error. Please check your connection.',
    };
  }
}

// Auth API functions
export const authAPI = {
  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async login(credentials: { email: string; password: string }) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async forgotPassword(email: string) {
    return apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },
};

// User API functions
export const userAPI = {
  async getProfile() {
    return apiRequest('/users/profile');
  },

  async updateProfile(profileData: any) {
    return apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  async browseUsers(params: {
    search?: string;
    location?: string;
    availability?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    return apiRequest(`/users/browse?${searchParams.toString()}`);
  },

  async getUserById(id: string) {
    return apiRequest(`/users/${id}`);
  },

  async getDashboardStats() {
    return apiRequest('/users/stats/dashboard');
  },
};

// Swap API functions
export const swapAPI = {
  async createSwap(swapData: {
    recipient: string;
    skillOffered: string;
    skillWanted: string;
    message?: string;
  }) {
    return apiRequest('/swaps', {
      method: 'POST',
      body: JSON.stringify(swapData),
    });
  },

  async getSwaps(params: {
    type?: 'incoming' | 'outgoing';
    status?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    return apiRequest(`/swaps?${searchParams.toString()}`);
  },

  async respondToSwap(swapId: string, action: 'accept' | 'reject', rejectionReason?: string) {
    return apiRequest(`/swaps/${swapId}/respond`, {
      method: 'PUT',
      body: JSON.stringify({ action, rejectionReason }),
    });
  },

  async completeSwap(swapId: string) {
    return apiRequest(`/swaps/${swapId}/complete`, {
      method: 'PUT',
    });
  },

  async submitFeedback(swapId: string, rating: number, feedback?: string) {
    return apiRequest(`/swaps/${swapId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ rating, feedback }),
    });
  },

  async cancelSwap(swapId: string) {
    return apiRequest(`/swaps/${swapId}`, {
      method: 'DELETE',
    });
  },
};

// Admin API functions
export const adminAPI = {
  async getUsers() {
    return apiRequest('/admin/users');
  },

  async updateUserStatus(userId: string, status: 'active' | 'banned') {
    return apiRequest(`/admin/user/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  async getReports() {
    return apiRequest('/admin/reports');
  },

  async respondToReport(reportId: string, action: 'resolved' | 'dismissed', adminNotes?: string) {
    return apiRequest(`/admin/report/${reportId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ action, adminNotes }),
    });
  },

  async getStats() {
    return apiRequest('/admin/stats');
  },
};

// Upload API functions
export const uploadAPI = {
  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    
    return fetch(`${API_BASE_URL}/upload/avatar`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    }).then(res => res.json());
  },
};

// Utility functions
export const authUtils = {
  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  },

  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  },

  removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('isLoggedIn');
    }
  },

  isLoggedIn() {
    return !!this.getToken();
  },
};

export default {
  authAPI,
  userAPI,
  swapAPI,
  adminAPI,
  uploadAPI,
  authUtils,
};
