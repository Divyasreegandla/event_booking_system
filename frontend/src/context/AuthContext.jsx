import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser, login as loginApi, register as registerApi } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await getCurrentUser();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await registerApi(userData);
      toast.success('Registration successful! Please login.');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await loginApi(email, password);
      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      await fetchUser();
      toast.success('Login successful!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    // Clear all localStorage items
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Clear user state
    setUser(null);
    // Show success message
    toast.success('Logged out successfully');
    // Force reload to clear any cached state
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};