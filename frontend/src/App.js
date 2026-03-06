import React from "react";
import "./App.css";
import LandingPage from "./LandingPage.tsx";
import Login from "./components/Login.tsx";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";

// Owner Pages
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import AddPropertyPage from "./pages/owner/AddPropertyPage";
import RegisterTenantPage from "./pages/owner/RegisterTenantPage";
import ManageInventoryPage from "./pages/owner/ManageInventoryPage";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Owner Routes */}
            <Route
              path="/owner"
              element={
                <ProtectedRoute allowedRoles={['owner']}>
                  <OwnerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner/add-property"
              element={
                <ProtectedRoute allowedRoles={['owner']}>
                  <AddPropertyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner/register-tenant"
              element={
                <ProtectedRoute allowedRoles={['owner']}>
                  <RegisterTenantPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner/manage-inventory"
              element={
                <ProtectedRoute allowedRoles={['owner']}>
                  <ManageInventoryPage />
                </ProtectedRoute>
              }
            />

            {/* General Dashboard Redirect */}
            <Route
              path="/dashboard"
              element={<Navigate to="/login" replace />}
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;
