import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import AccountSettings from './pages/settings/AccountSettings';
import ProfileSettings from './pages/settings/ProfileSettings';
import 'antd/dist/reset.css';
import './App.css';

// Define a PrivateRoute component for protected routes
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  // Check multiple authentication factors
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const hasToken = !!localStorage.getItem('accessToken');
  const hasUser = !!localStorage.getItem('user');
  
  // Only allow access if all authentication checks pass
  if (!isAuthenticated || !hasToken || !hasUser) {
    console.log('Authentication check failed, redirecting to login');
    // Clear any potentially incomplete auth data
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#52c41a', // Green color for garden theme
          borderRadius: 4,
          colorBgContainer: '#ffffff',
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <PrivateRoute>
                <AccountSettings />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <ProfileSettings />
              </PrivateRoute>
            } 
          />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
