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
import { RepairNew } from './pages/client/RepairNew';
import { RepairDetail } from './pages/client/RepairDetail';
import { Recycle } from './pages/client/Recycle';
import { RecycleNew } from './pages/client/RecycleNew';
import { RecycleDetail } from './pages/client/RecycleDetail';
import { Reviews } from './pages/client/Reviews';
import { Notifications } from './pages/client/Notifications';

// Páginas de administrador
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { RulesManagement } from './pages/admin/RulesManagement';
import { RepairsManagement } from './pages/admin/RepairsManagement';
import { RecycleManagement } from './pages/admin/RecycleManagement';
import { DashboardsView } from './pages/admin/DashboardsView';
import { SalesManagement } from './pages/admin/SalesManagement';
import { CustomerSatisfaction } from './pages/admin/CustomerSatisfaction';
import { EmployeesManagement } from './pages/admin/EmployeesManagement';
import { UsersManagement } from './pages/admin/UsersManagement';
import { OSIManagement } from './pages/admin/OSIManagement';

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
            <Route path="/" element={<Navigate to="/client" replace />} />
            
            {/* Rutas de cliente - SIN PROTECCIÓN */}
            <Route path="/client" element={
              <ClientLayout>
                <ClientDashboard />
              </ClientLayout>
            } />
            
            <Route path="/client/ventas" element={
              <ClientLayout>
                <Sales />
              </ClientLayout>
            } />
            
            <Route path="/client/compras" element={
              <ClientLayout>
                <Purchases />
              </ClientLayout>
            } />
            
            <Route path="/client/reparaciones" element={
              <ClientLayout>
                <Repairs />
              </ClientLayout>
            } />
            
            <Route path="/client/reparaciones/nuevo" element={
              <ClientLayout>
                <RepairNew />
              </ClientLayout>
            } />
            
            <Route path="/client/reparaciones/:id" element={
              <ClientLayout>
                <RepairDetail />
              </ClientLayout>
            } />
            
            <Route path="/client/reciclar" element={
              <ClientLayout>
                <Recycle />
              </ClientLayout>
            } />
            
            <Route path="/client/reciclar/nuevo" element={
              <ClientLayout>
                <RecycleNew />
              </ClientLayout>
            } />
            
            <Route path="/client/reciclar/:id" element={
              <ClientLayout>
                <RecycleDetail />
              </ClientLayout>
            } />
            
            <Route path="/client/resenas" element={
              <ClientLayout>
                <Reviews />
              </ClientLayout>
            } />
            
            <Route path="/client/notificaciones" element={
              <ClientLayout>
                <Notifications />
              </ClientLayout>
            } />
            
            {/* Rutas de administrador - SIN PROTECCIÓN */}
            <Route path="/admin" element={
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            } />
            
            <Route path="/admin/reglas" element={
              <AdminLayout>
                <RulesManagement />
              </AdminLayout>
            } />
            
            <Route path="/admin/reparaciones" element={
              <AdminLayout>
                <RepairsManagement />
              </AdminLayout>
            } />
            
            <Route path="/admin/reciclaje" element={
              <AdminLayout>
                <RecycleManagement />
              </AdminLayout>
            } />
            
            <Route path="/admin/dashboards" element={
              <AdminLayout>
                <DashboardsView />
              </AdminLayout>
            } />
            
            <Route path="/admin/ventas" element={
              <AdminLayout>
                <SalesManagement />
              </AdminLayout>
            } />
            
            <Route path="/admin/satisfaccion" element={
              <AdminLayout>
                <CustomerSatisfaction />
              </AdminLayout>
            } />
            
            <Route path="/admin/empleados" element={
              <AdminLayout>
                <EmployeesManagement />
              </AdminLayout>
            } />
            
            <Route path="/admin/usuarios" element={
              <AdminLayout>
                <UsersManagement />
              </AdminLayout>
            } />
            
            <Route path="/admin/osi" element={
              <AdminLayout>
                <OSIManagement />
              </AdminLayout>
            } />
          </Routes>
        </Router>
        <Toaster position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;