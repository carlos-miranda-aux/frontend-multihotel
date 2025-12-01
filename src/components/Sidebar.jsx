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
    Divider,
    useTheme,
    alpha // Importante para las transparencias
} from "@mui/material";

// Iconos
import HomeIcon from "@mui/icons-material/Home";
import DevicesIcon from "@mui/icons-material/Devices";
import BuildIcon from "@mui/icons-material/Build";
import PeopleIcon from "@mui/icons-material/People";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout'; // Opcional si quieres poner logout abajo

import LogoImg from "../assets/Logo.png";
import { AuthContext } from "../context/AuthContext";

const SIDEBAR_WIDTH = 260; // Un poco más ancho para que respire mejor

const Sidebar = ({ open, variant = 'persistent' }) => { 
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const theme = useTheme();

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

  const isSelected = (path) => location.pathname.startsWith(path);

  // Función para renderizar un item de la lista con el nuevo estilo
  const renderListItem = (item) => {
    const active = isSelected(item.path);

    return (
      <ListItemButton
        key={item.text}
        onClick={() => navigate(item.path)}
        sx={{
          // 1. Márgenes y Redondeo: Efecto botón flotante
          mx: 1.5, // Margen horizontal
          my: 0.5, // Margen vertical entre items
          borderRadius: 2, 
          transition: 'all 0.2s ease-in-out',
          
          // 2. Estilos base (inactivo)
          color: theme.palette.text.secondary,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            color: theme.palette.primary.main,
            transform: 'translateX(4px)', // Pequeña animación al pasar el mouse
            "& .MuiListItemIcon-root": {
               color: theme.palette.primary.main,
            }
          },

          // 3. Estilos ACTIVOS (Seleccionado)
          ...(active && {
            backgroundColor: alpha(theme.palette.primary.main, 0.12), // Fondo suave
            color: theme.palette.primary.main, // Texto morado
            fontWeight: 'bold',
            "& .MuiListItemIcon-root": {
              color: theme.palette.primary.main, // Icono morado
            },
            '&:hover': {
               backgroundColor: alpha(theme.palette.primary.main, 0.18),
            }
          }),
        }}
      >
        <ListItemIcon 
          sx={{ 
            minWidth: 40,
            color: active ? theme.palette.primary.main : theme.palette.text.secondary,
            transition: 'color 0.2s'
          }}
        >
          {item.icon}
        </ListItemIcon>
        <ListItemText 
            primary={item.text} 
            primaryTypographyProps={{ 
                fontSize: '0.9rem', 
                fontWeight: active ? 600 : 500,
                fontFamily: theme.typography.fontFamily
            }} 
        />
        {/* Indicador visual opcional a la derecha si está activo */}
        {active && (
            <Box 
                sx={{ 
                    width: 4, 
                    height: 4, 
                    borderRadius: '50%', 
                    bgcolor: 'primary.main',
                    ml: 1
                }} 
            />
        )}
      </ListItemButton>
    );
  };

  return (
    <Drawer
      variant={variant} 
      anchor="left"
      open={open}
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: SIDEBAR_WIDTH,
          boxSizing: "border-box",
          backgroundColor: "#ffffff", // Fondo blanco limpio
          borderRight: "1px solid rgba(0,0,0,0.08)", // Borde muy sutil
          boxShadow: variant === 'temporary' ? 4 : 'none',
        },
      }}
    >
      {/* --- LOGO AREA --- */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 4, // Más espacio vertical
          cursor: "pointer",
        }}
        onClick={() => navigate("/home")}
      >
        <img 
            src={LogoImg} 
            alt="Logo" 
            style={{ 
                width: "100px", 
                height: "auto", 
                filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))' // Sombra suave al logo
            }} 
        />
      </Box>

      {/* --- MENU PRINCIPAL --- */}
      <Box sx={{ px: 0 }}>
        <Typography variant="caption" sx={{ pl: 3, mb: 1, display: 'block', color: 'text.disabled', fontWeight: 600 }}>
            MENU
        </Typography>
        <List component="nav">
            {menuItems.map((item) => renderListItem(item))}
        </List>
      </Box>
      
      {/* --- MENU ADMIN --- */}
      {user && (user.rol === "ADMIN" || user.rol === "EDITOR") && (
        <Box sx={{ mt: 2 }}>
            <Divider sx={{ my: 2, mx: 3, opacity: 0.6 }} />
            
            <Typography variant="caption" sx={{ pl: 3, mb: 1, display: 'block', color: 'text.disabled', fontWeight: 600 }}>
                ADMINISTRACIÓN
            </Typography>
            <List component="nav">
                {adminItems.map((item) => renderListItem(item))}
            </List>
        </Box>
      )}

      {/* Footer opcional (versión o copyright) */}
      <Box sx={{ mt: 'auto', p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.disabled">
            v1.0.0 &copy; 2025
        </Typography>
      </Box>

    </Drawer>
  );
};

export default Sidebar;