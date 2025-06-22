import React from 'react';
import AppRouter from './AppRouter';
import AuthState from './context/AuthState';
import './App.css';

function App() {
  return (
    <AuthState>
      <AppRouter />
    </AuthState>
  );
}

export default App;
