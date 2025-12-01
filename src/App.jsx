// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Inventory from "./pages/Inventory";
import Settings from "./pages/Settings.jsx";
import UsersCrownP from "./pages/Users_Crown.jsx";
import Disposals from "./pages/Disposals.jsx";
import Maintenances from "./pages/Maintenances.jsx";
import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./Layouts/MainLayout.jsx";
import EditDevice from "./pages/EditDevice.jsx";
import EditMaintenance from "./pages/EditMaintenance.jsx";
import EditUsers from "./pages/EditUser.jsx";
import EditCrownUser from "./pages/EditCrownUser.jsx";
import AdminSettings from "./pages/AdminSettings.jsx";
import Reportes from "./pages/Reportes.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />

        {/* Ruta protegida con MainLayout */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute> 
          }
        >
          <Route path="/home" element={<Home />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/settings" element={<Settings/>} />
          <Route path="/users" element={<UsersCrownP />} />
          <Route path="/maintenances" element={<Maintenances />} />
          <Route path="/disposals" element={<Disposals />} />
          <Route path="/inventory/edit/:id" element={<EditDevice />} />
          <Route path="/user-manager/edit/:id" element={<EditUsers />} />
          <Route path="/maintenances/edit/:id" element={<EditMaintenance />} />
          <Route path="/users/edit/:id" element={<EditCrownUser />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/admin-settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;