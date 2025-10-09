import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Home from "./pages/Home";
import Inventory from "./pages/Inventory";
import Settings from "./pages/Settings.jsx";
import UserManager from "./pages/UserManager.jsx"
import UsersCrownP from "./pages/Users_Crown.jsx";
import Disposals from "./pages/Disposals.jsx";
import Maintenances from "./pages/Maintenances.jsx";
import ProtectedRoute from "./routes/ProtectedRoute";
import MainLayout from "./Layouts/MainLayout.jsx";
import EditDevice from "./pages/EditDevice.jsx";
import EditDisposal from "./pages/EditDisposal.jsx";
import EditMaintenance from "./pages/EditMaintenance.jsx";
import EditUsers from "./pages/EditUser.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/signup" />} />
        <Route path="/signup" element={<SignUp />} />
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
          <Route path="/settings" element={<Settings/>}></Route>
          <Route path="/user-manager" element={<UserManager/>}></Route>
          <Route path="/users" element={<UsersCrownP/>}></Route>
          <Route path="/maintenances" element={<Maintenances/>}></Route>
          <Route path="/disposals" element={<Disposals/>}></Route>
          <Route path="/devices/edit/:id" element={<EditDevice />} />
    
          {/* Más rutas protegidas se agregan aquí */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
