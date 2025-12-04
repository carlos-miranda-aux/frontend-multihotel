// src/components/Sidebar.jsx
import React, { useContext } from "react";
import {
  Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton, 
  Typography, Box, Divider, Avatar, useTheme, alpha
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ROLES } from "../config/constants"; // 👈 Importar Roles

// Iconos
import DashboardIcon from "@mui/icons-material/Dashboard";
import ComputerIcon from "@mui/icons-material/Computer";
import PeopleIcon from "@mui/icons-material/People";
import BuildIcon from "@mui/icons-material/Build";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import AssessmentIcon from "@mui/icons-material/Assessment";
import BusinessIcon from '@mui/icons-material/Business';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

const drawerWidth = 260;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user, logout } = useContext(AuthContext);

  // Definición de Roles para facilitar lectura
  const isRoot = user?.rol === ROLES.ROOT;
  const isCorp = user?.rol === ROLES.CORP_VIEWER;
  const isAdmin = user?.rol === ROLES.HOTEL_ADMIN || isRoot;
  // const isAux = user?.rol === ROLES.HOTEL_AUX;

  // Lista de Menús con permisos
  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/home", show: true },
    
    // Módulos Operativos (Visibles para todos, permisos internos controlados por backend)
    { text: "Inventario", icon: <ComputerIcon />, path: "/inventory", show: true },
    { text: "Mantenimientos", icon: <BuildIcon />, path: "/maintenances", show: true },
    { text: "Staff (Empleados)", icon: <PeopleIcon />, path: "/users", show: true },
    { text: "Bajas / Inactivos", icon: <DeleteSweepIcon />, path: "/disposals", show: true },
    
    // Módulos Administrativos
    { 
        text: "Estructura (Áreas)", 
        icon: <BusinessIcon />, 
        path: "/areas", 
        show: isAdmin // Solo Admins pueden tocar la estructura
    },
    { 
        text: "Usuarios del Sistema", 
        icon: <AdminPanelSettingsIcon />, 
        path: "/user-manager", 
        show: isRoot || user?.rol === ROLES.HOTEL_ADMIN 
    },
    
    // Auditoría y Reportes
    { 
        text: "Bitácora (Audit)", 
        icon: <HistoryEduIcon />, 
        path: "/audit", 
        show: isRoot || isCorp 
    },
    { text: "Reportes", icon: <AssessmentIcon />, path: "/reports", show: true },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: theme.palette.background.paper,
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      {/* Header del Sidebar */}
      <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <Avatar 
            sx={{ 
                bgcolor: theme.palette.primary.main, 
                width: 40, height: 40,
                fontWeight: 'bold'
            }}
        >
            {user?.nombre ? user.nombre.charAt(0) : "U"}
        </Avatar>
        <Box sx={{ overflow: "hidden" }}>
            <Typography variant="subtitle1" noWrap fontWeight="bold">
                {user?.nombre || "Usuario"}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap display="block">
                {user?.rol?.replace('_', ' ') || "Invitado"}
            </Typography>
        </Box>
      </Box>

      <Divider />

      <List sx={{ px: 2, pt: 2 }}>
        {menuItems.map((item) => (
          item.show && (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={location.pathname.startsWith(item.path)}
                sx={{
                  borderRadius: 2,
                  "&.Mui-selected": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.2) },
                    "& .MuiListItemIcon-root": { color: theme.palette.primary.main },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: theme.palette.text.secondary }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: location.pathname.startsWith(item.path) ? 'bold' : 'medium' }} 
                />
              </ListItemButton>
            </ListItem>
          )
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      
      <List sx={{ px: 2 }}>
        <ListItem disablePadding>
          <ListItemButton onClick={logout} sx={{ borderRadius: 2, color: theme.palette.error.main }}>
            <ListItemIcon sx={{ minWidth: 40, color: theme.palette.error.main }}>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText primary="Cerrar Sesión" />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;