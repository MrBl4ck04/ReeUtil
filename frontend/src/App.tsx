import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { ClientDashboard } from './pages/ClientDashboard';
import { Catalog } from './pages/Catalog';
import { Devices } from './pages/Devices';
import { Inventory } from './pages/Inventory';
import { Rules } from './pages/Rules';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          <Route path="/admin" element={
            //<ProtectedRoute requiredRole="admin">
              <Layout>
                <AdminDashboard />
              </Layout>
            //</ProtectedRoute>
          } />
          
          <Route path="/client" element={
            //<ProtectedRoute requiredRole="client">
              <Layout>
                <ClientDashboard />
              </Layout>
            //</ProtectedRoute>
          } />
          
          <Route path="/catalog" element={
            //<ProtectedRoute>
              <Layout>
                <Catalog />
              </Layout>
            //</ProtectedRoute>
          } />
          
          <Route path="/devices" element={
            //<ProtectedRoute>
              <Layout>
                <Devices />
              </Layout>
            //</ProtectedRoute>
          } />
          
          <Route path="/inventory" element={
            //<ProtectedRoute>
              <Layout>
                <Inventory />
              </Layout>
            //</ProtectedRoute>
          } />
          
          <Route path="/rules" element={
            //<ProtectedRoute>
              <Layout>
                <Rules />
              </Layout>
            //</ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
