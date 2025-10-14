// components/Sidebar.jsx
import React, { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, Divider } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import BuildIcon from "@mui/icons-material/Build";
import DevicesIcon from "@mui/icons-material/Devices";
import PeopleIcon from "@mui/icons-material/People";
import DeleteIcon from "@mui/icons-material/Delete";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EventNoteIcon from '@mui/icons-material/EventNote'; // 👈 Nueva importación de icono
import LogoImg from "../assets/logo.png";
import { AuthContext } from "../context/AuthContext";

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const menuItems = [
    { text: "Home", icon: <HomeIcon />, path: "/home" },
    { text: "Mantenimientos", icon: <BuildIcon />, path: "/maintenances" },
    { text: "Equipos", icon: <DevicesIcon />, path: "/inventory" },
    { text: "Usuarios", icon: <PeopleIcon />, path: "/users" },
    { text: "Bajas", icon: <DeleteIcon />, path: "/disposals" },
  ];

  const adminItems = [
    { text: "Configuración Admin", icon: <AdminPanelSettingsIcon />, path: "/admin-settings" },
    { text: "Bitácora de Cambios", icon: <EventNoteIcon />, path: "/audit-log" }, // 👈 Nuevo enlace
  ];

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: 240,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: 240,
          boxSizing: "border-box",
          backgroundColor: "#f5f5f5",
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
            selected={location.pathname === item.path}
            onClick={() => navigate(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItemButton>
        ))}
      </List>
      
      {/* Mostramos el menú de administración solo si el usuario es ADMIN o EDITOR */}
      {user && (user.rol === "ADMIN" || user.rol === "EDITOR") && (
        <List>
          <Divider />
          {adminItems.map((item) => (
            <ListItemButton
              key={item.text}
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
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