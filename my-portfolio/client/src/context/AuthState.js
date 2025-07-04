import React, { useReducer } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AuthContext from './AuthContext';
import authReducer from './authReducer';
import setAuthToken from '../utils/setAuthToken';
import {
  REGISTER_SUCCESS,
  REGISTER_FAIL,
  USER_LOADED,
  AUTH_ERROR,
  LOGIN_SUCCESS,
  LOGIN_FAIL,
  LOGOUT,
  CLEAR_ERRORS,
} from './types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AuthState = (props) => {
  const initialState = {
    token: null,
    isAuthenticated: JSON.parse(localStorage.getItem('isAuthenticated')) || false,
    loading: false,
    user: JSON.parse(localStorage.getItem('user')) || null,
    error: null,
  };

  const [state, dispatch] = useReducer(authReducer, initialState);

  // Register User (does NOT automatically log in)
  const register = async (formData) => {
    const config = {
      headers: { 'Content-Type': 'application/json' },
    };
    try {
      const res = await axios.post(`${API_BASE_URL}/api/register`, formData, config);
      // Don't dispatch REGISTER_SUCCESS - just show success message
      toast.success('🎉 Registration successful! Please log in.');
      return { success: true, data: res.data };
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Registration failed. Please try again.';
      dispatch({
        type: REGISTER_FAIL,
        payload: errorMsg,
      });
      toast.error(`🔥 ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  };

  // Login User
  const login = async (formData) => {
    const config = {
      headers: { 'Content-Type': 'application/json' },
    };
    try {
      const res = await axios.post(`${API_BASE_URL}/api/login`, formData, config);
      dispatch({ type: LOGIN_SUCCESS, payload: res.data });
      localStorage.setItem('isAuthenticated', true);
      localStorage.setItem('user', JSON.stringify(res.data.user || res.data));
      toast.success('🚀 Login successful! Welcome back!');
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Login failed. Please check your credentials.';
      dispatch({
        type: LOGIN_FAIL,
        payload: errorMsg,
      });
      toast.error(`😞 ${errorMsg}`);
    }
  };

  // Load User (for dashboard)
  const loadUser = async () => {
    // Since we're not using JWT tokens, we'll load user from the current state
    // This function is called by Dashboard to ensure user data is available
    if (state.user) {
      return state.user;
    }
    return null;
  };

  // Logout
  const logout = () => {
    dispatch({ type: LOGOUT });
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    toast.info('👋 You have been logged out.');
  };

  // Clear Errors
  const clearErrors = () => dispatch({ type: CLEAR_ERRORS });

  const setUser = (userObj) => {
    dispatch({ type: USER_LOADED, payload: userObj });
    localStorage.setItem('user', JSON.stringify(userObj));
  };

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        error: state.error,
        register,
        loadUser,
        login,
        logout,
        clearErrors,
        setUser,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthState; 