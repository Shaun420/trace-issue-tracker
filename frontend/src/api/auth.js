import api from './axiosInstance';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/users/login/', { email, password });
    if (response.data.tokens) {
      localStorage.setItem('token', response.data.tokens.access);
      localStorage.setItem('refresh_token', response.data.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser: () => {
    const user = JSON.parse(localStorage.getItem('user'));
	return user ? JSON.parse(user) : null;
  },

  refreshToken: async () => {
    const refresh = localStorage.getItem('refresh_token');
    const response = await api.post('/users/refresh/', { refresh });
    localStorage.setItem('token', response.data.access);
    return response.data.access;
  }
};