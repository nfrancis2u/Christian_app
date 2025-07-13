import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Posts from './pages/Posts';
import Prayers from './pages/Prayers';
import Messages from './pages/Messages';
import Groups from './pages/Groups';
import Verses from './pages/Verses';
import Settings from './pages/Settings';
import './App.css';

const queryClient = new QueryClient();

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return !user ? children : <Navigate to="/dashboard" />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <div className="App min-h-screen bg-gray-50">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } />
                <Route path="/register" element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Navbar />
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/profile/:id?" element={
                  <ProtectedRoute>
                    <Navbar />
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/posts" element={
                  <ProtectedRoute>
                    <Navbar />
                    <Posts />
                  </ProtectedRoute>
                } />
                <Route path="/prayers" element={
                  <ProtectedRoute>
                    <Navbar />
                    <Prayers />
                  </ProtectedRoute>
                } />
                <Route path="/messages/*" element={
                  <ProtectedRoute>
                    <Navbar />
                    <Messages />
                  </ProtectedRoute>
                } />
                <Route path="/groups/*" element={
                  <ProtectedRoute>
                    <Navbar />
                    <Groups />
                  </ProtectedRoute>
                } />
                <Route path="/verses" element={
                  <ProtectedRoute>
                    <Navbar />
                    <Verses />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Navbar />
                    <Settings />
                  </ProtectedRoute>
                } />
              </Routes>
              
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
            </div>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;