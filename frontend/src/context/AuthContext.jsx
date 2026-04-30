// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser, login as loginApi, register as registerApi } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await getCurrentUser();
      const userData = response.data;
      setUser(userData);
      const role = userData.role || localStorage.getItem('userRole') || 'USER';
      setUserRole(role);
      localStorage.setItem('userRole', role);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      setToken(null);
      setUser(null);
      setUserRole(null);
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
      const message = error.response?.data?.detail || 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await loginApi(email, password);
      const { access_token, role } = response.data;
      
      // Store token and role
      localStorage.setItem('token', access_token);
      localStorage.setItem('userRole', role);
      setToken(access_token);
      setUserRole(role);
      
      // Fetch user data
      const userResponse = await getCurrentUser();
      setUser(userResponse.data);
      
      toast.success(`Welcome ${userResponse.data.username}! (${role})`);
      return { ...response.data, user: userResponse.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    // Clear all localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    
    // Clear all state
    setToken(null);
    setUser(null);
    setUserRole(null);
    
    // Show success message
    toast.success('Logged out successfully');
  };

  const isAdmin = () => userRole === 'ADMIN';
  const isOrganizer = () => userRole === 'ORGANIZER';
  const isUser = () => userRole === 'USER';

  return (
    <AuthContext.Provider value={{ 
      user, 
      userRole, 
      loading, 
      register, 
      login, 
      logout,
      token,
      isAdmin,
      isOrganizer,
      isUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};