// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import MainLayout from "./Layouts/MainLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

// --- Páginas Existentes ---
import Home from "./pages/Home";
import Inventory from "./pages/Inventory";
import EditDevice from "./pages/EditDevice";
import Maintenances from "./pages/Maintenances";
import EditMaintenance from "./pages/EditMaintenance";
import Disposals from "./pages/Disposals";
import UsersCrownP from "./pages/Users_Crown";
import EditCrownUser from "./pages/EditCrownUser";
import Reportes from "./pages/Reportes";

// --- 👇 NUEVAS PÁGINAS (Verifica que estos archivos existan) ---
// Si la pantalla sigue blanca, comenta estas 4 líneas y prueba de nuevo.
import AreasTable from "./components/admin/AreasTable"; 
import UsersSystemTable from "./components/admin/UserSystemTable"; 
import EditUser from "./pages/EditUser"; 
import AuditLog from "./pages/AuditLog"; 

function App() {
  return (
    <Routes>
      {/* Ruta pública: Login */}
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Rutas Protegidas (Layout Principal) */}
      <Route element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route path="/home" element={<Home />} />
        
        {/* Módulos Operativos */}
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/inventory/edit/:id" element={<EditDevice />} />
        
        <Route path="/maintenances" element={<Maintenances />} />
        <Route path="/maintenances/edit/:id" element={<EditMaintenance />} />
        
        <Route path="/disposals" element={<Disposals />} />
        
        <Route path="/users" element={<UsersCrownP />} />
        <Route path="/users/edit/:id" element={<EditCrownUser />} />
        
        <Route path="/reports" element={<Reportes />} />

        {/* 👇 NUEVAS RUTAS ADMINISTRATIVAS */}
        <Route path="/areas" element={<AreasTable />} />
        <Route path="/user-manager" element={<UsersSystemTable />} />
        <Route path="/user-manager/edit/:id" element={<EditUser />} />
        <Route path="/audit" element={<AuditLog />} />

      </Route>

      {/* Cualquier ruta desconocida redirige al login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;