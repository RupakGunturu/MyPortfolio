import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import PortfolioPage from './pages/PortfolioPage';
import AuthState from './context/AuthState';
import setAuthToken from './utils/setAuthToken';
import PrivateRoute from './components/PrivateRoute';
import AuthContext from './context/AuthContext';

if (localStorage.token) {
  setAuthToken(localStorage.token);
}

function DebugUser() {
  const { user } = useContext(AuthContext);
  useEffect(() => {
    console.log('GLOBAL USER CONTEXT:', user);
  }, [user]);
  return null;
}

const AppRouter = () => {
  return (
    <AuthState>
      <Router>
        <DebugUser />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route path="/portfolio/:username" element={<PortfolioPage />} />
        </Routes>
      </Router>
    </AuthState>
  );
};

export default AppRouter; 