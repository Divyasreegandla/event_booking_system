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
      console.log('🔍 Fetched user data:', userData);
      console.log('🔍 Profile picture URL:', userData.profile_picture);
      console.log('🔍 Created at:', userData.created_at);
      
      setUser(userData);
      setUserRole(userData.role);
      localStorage.setItem('userRole', userData.role);
      
      // Store profile picture in localStorage
      if (userData.profile_picture) {
        localStorage.setItem('userProfilePic', userData.profile_picture);
        console.log('✅ Saved profile pic to localStorage:', userData.profile_picture);
      } else {
        localStorage.removeItem('userProfilePic');
        console.log('⚠️ No profile picture in user data');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userProfilePic');
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
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('userRole', role);
      setToken(access_token);
      setUserRole(role);
      
      const userResponse = await getCurrentUser();
      console.log('🔍 Login user data:', userResponse.data);
      console.log('🔍 Profile picture URL:', userResponse.data.profile_picture);
      console.log('🔍 Created at:', userResponse.data.created_at);
      
      setUser(userResponse.data);
      
      if (userResponse.data.profile_picture) {
        localStorage.setItem('userProfilePic', userResponse.data.profile_picture);
        console.log('✅ Saved profile pic to localStorage');
      }
      
      toast.success(`Welcome ${userResponse.data.username}! (${role})`);
      return { ...response.data, user: userResponse.data };
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userProfilePic');
    setToken(null);
    setUser(null);
    setUserRole(null);
    toast.success('Logged out successfully');
  };

  const updateUser = (updatedUser) => {
    console.log('🔍 Updating user in context:', updatedUser);
    setUser(updatedUser);
    if (updatedUser.profile_picture) {
      localStorage.setItem('userProfilePic', updatedUser.profile_picture);
      console.log('✅ Updated profile pic in localStorage:', updatedUser.profile_picture);
    } else {
      localStorage.removeItem('userProfilePic');
    }
    if (updatedUser.role) {
      setUserRole(updatedUser.role);
      localStorage.setItem('userRole', updatedUser.role);
    }
  };

  const isAdmin = () => userRole === 'ADMIN';
  const isOrganizer = () => userRole === 'ORGANIZER';
  const isUser = () => userRole === 'USER';

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser,
      updateUser,
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