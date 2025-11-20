// src/components/Sidebar.jsx
import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
    Drawer, 
    List, 
    ListItemButton, 
    ListItemIcon, 
    ListItemText, 
    Box, 
    Typography, 
    Divider 
} from "@mui/material";
// Icons
import HomeIcon from "@mui/icons-material/Home";
import DevicesIcon from "@mui/icons-material/Devices"; // Cambiado de InventoryIcon en la referencia anterior
import BuildIcon from "@mui/icons-material/Build";
import PeopleIcon from "@mui/icons-material/People";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'; // Cambiado de SettingsIcon en la referencia anterior
import AssessmentIcon from '@mui/icons-material/Assessment'; // Añadido para Reportes
import DeleteIcon from '@mui/icons-material/Delete'; // Añadido para Bajas
import LogoImg from "../assets/Logo.png"; // Icono Logo
import { AuthContext } from "../context/AuthContext";
import "../components/styles/Sidebar.css"; // 👈 NUEVA IMPORTACIÓN

const Sidebar = ({ open, onClose, variant = 'persistent' }) => { 
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const menuItems = [
    { text: "Inicio", icon: <HomeIcon />, path: "/home" },
    { text: "Mantenimientos", icon: <BuildIcon />, path: "/maintenances" },
    { text: "Equipos", icon: <DevicesIcon />, path: "/inventory" },
    { text: "Usuarios", icon: <PeopleIcon />, path: "/users" },
    { text: "Bajas", icon: <DeleteIcon />, path: "/disposals" },
  ];

  const adminItems = [
    { text: "Reportes", icon: <AssessmentIcon />, path: "/reportes" },
    { text: "Configuración Admin", icon: <AdminPanelSettingsIcon />, path: "/admin-settings" },
  ];

  const isSelected = (path) => location.pathname === path;

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Drawer
      // [CLAVE]: Utiliza el variant='permanent'
      variant={variant} 
      anchor="left"
      open={open}
      // onClose={onClose} // No usado en modo permanente
      // ⚠️ Usamos una clase dinámica para aplicar estilos condicionales/fijos
      className={variant === 'permanent' ? 'sidebar-drawer-permanent' : ''}
      sx={{
        "& .MuiDrawer-paper": {
          // ✅ APLICAR ESTILOS FIJOS USANDO LA VARIABLE CSS
          boxSizing: "border-box",
          width: 'var(--sidebar-width)',
          backgroundColor: '#f5f5f5'
        },
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          cursor: "pointer",
        }}
        onClick={() => navigate("/home")}
      >
        <img src={LogoImg} alt="Logo" style={{ width: "120px", height: "auto" }} />
      </Box>

      <Divider />

      {/* Menú */}
      <List>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            selected={isSelected(item.path)}
            onClick={() => handleNavigation(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
      
      {/* Menú de administración (Admin o Editor) */}
      {user && (user.rol === "ADMIN" || user.rol === "EDITOR") && (
        <List>
          <Divider />
          {adminItems.map((item) => (
            <ListItemButton
              key={item.text}
              selected={isSelected(item.path)}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
      )}
    </Drawer>
  );
};

export default Sidebar;