import React from 'react';
import AppRouter from './AppRouter';
import AuthState from './context/AuthState';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  return (
    <AuthState>
      <AppRouter />
      <ToastContainer />
    </AuthState>
  );
}

export default App;
