import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ClientLayout } from './components/ClientLayout';
import { AdminLayout } from './components/AdminLayout';

// Páginas de autenticación
import { Login } from './pages/Login';
import { Register } from './pages/Register';

// Páginas de cliente
import { ClientDashboard } from './pages/client/ClientDashboard';
import { Sales } from './pages/client/Sales';
import { Purchases } from './pages/client/Purchases';
import { Repairs } from './pages/client/Repairs';
import { Recycle } from './pages/client/Recycle';
import { Reviews } from './pages/client/Reviews';
import { CreateReview } from './pages/client/CreateReview';
import { EditReview } from './pages/client/EditReview';
import { Notifications } from './pages/client/Notifications';

// Páginas de administrador
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { RulesManagement } from './pages/admin/RulesManagement';
import { RepairsManagement } from './pages/admin/RepairsManagement';
import { RecycleManagement } from './pages/admin/RecycleManagement';
import DashboardsView from './pages/admin/DashboardsView';
import { SalesManagement } from './pages/admin/SalesManagement';
import { CustomerSatisfaction } from './pages/admin/CustomerSatisfaction';
import { EmployeesManagement } from './pages/admin/EmployeesManagement';
import { UsersManagement } from './pages/admin/UsersManagement';
import { OSIManagement } from './pages/admin/OSIManagement';
import { SystemLogs } from './pages/admin/SystemLogs';

// Crear cliente de React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Rutas de cliente - CON PROTECCIÓN */}
            <Route path="/client" element={
              <ProtectedRoute requiredRole="client">
                <ClientLayout>
                  <ClientDashboard />
                </ClientLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/client/ventas" element={
              <ProtectedRoute requiredRole="client">
                <ClientLayout>
                  <Sales />
                </ClientLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/client/compras" element={
              <ProtectedRoute requiredRole="client">
                <ClientLayout>
                  <Purchases />
                </ClientLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/client/reparaciones" element={
              <ProtectedRoute requiredRole="client">
                <ClientLayout>
                  <Repairs />
                </ClientLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/client/reciclar" element={
              <ProtectedRoute requiredRole="client">
                <ClientLayout>
                  <Recycle />
                </ClientLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/client/resenas" element={
              <ProtectedRoute requiredRole="client">
                <ClientLayout>
                  <Reviews />
                </ClientLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/client/resenas/nuevo" element={
              <ProtectedRoute requiredRole="client">
                <ClientLayout>
                  <CreateReview />
                </ClientLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/client/resenas/nuevo/:vendedorId" element={
              <ProtectedRoute requiredRole="client">
                <ClientLayout>
                  <CreateReview />
                </ClientLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/client/resenas/editar/:id" element={
              <ProtectedRoute requiredRole="client">
                <ClientLayout>
                  <EditReview />
                </ClientLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/client/notificaciones" element={
              <ProtectedRoute requiredRole="client">
                <ClientLayout>
                  <Notifications />
                </ClientLayout>
              </ProtectedRoute>
            } />
            
            {/* Rutas de administrador - CON PROTECCIÓN */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/reglas" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <RulesManagement />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/reparaciones" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <RepairsManagement />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/reciclaje" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <RecycleManagement />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/dashboards" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <DashboardsView />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/ventas" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <SalesManagement />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/satisfaccion" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <CustomerSatisfaction />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/empleados" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <EmployeesManagement />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/usuarios" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <UsersManagement />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/osi" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <OSIManagement />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/logs" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <SystemLogs />
                </AdminLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
        <Toaster position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;