// src/components/Sidebar.jsx
import React, { useContext } from "react";
import {
  Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton, 
  Typography, Box, Avatar, useTheme, alpha, IconButton, Tooltip
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ROLES } from "../config/constants";

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
import LogoutIcon from "@mui/icons-material/Logout";
import SecurityIcon from '@mui/icons-material/Security';

import LogoImg from "../assets/Logo.png"; 

const drawerWidth = 280; 

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user, logout } = useContext(AuthContext);

  const isRoot = user?.rol === ROLES.ROOT;
  const isCorp = user?.rol === ROLES.CORP_VIEWER;
  const isHotelAdmin = user?.rol === ROLES.HOTEL_ADMIN;
  
  // Agrupamos permisos de Admin (Root o Local)
  const isAdmin = isRoot || isHotelAdmin;

  // Secciones del menú
  const menuGroups = [
    {
      title: "PRINCIPAL",
      items: [
        { text: "Dashboard", icon: <DashboardIcon />, path: "/home", show: true },
      ]
    },
    {
      title: "OPERACIÓN",
      items: [
        { text: "Inventario", icon: <ComputerIcon />, path: "/inventory", show: true },
        { text: "Mantenimientos", icon: <BuildIcon />, path: "/maintenances", show: true },
        { text: "Staff", icon: <PeopleIcon />, path: "/users", show: true },
        { text: "Bajas", icon: <DeleteSweepIcon />, path: "/disposals", show: true },
      ]
    },
    {
      title: "ADMINISTRACIÓN",
      items: [
        // Estructura: Solo Admins (Root o Local) pueden editar áreas
        { text: "Estructura", icon: <BusinessIcon />, path: "/areas", show: isAdmin },
        
        // Usuarios Sistema: Root o Hotel Admin gestionan sus accesos
        { text: "Usuarios Sistema", icon: <AdminPanelSettingsIcon />, path: "/user-manager", show: isAdmin },
        
        // Auditoría: Root, Corp Viewer Y AHORA TAMBIÉN Hotel Admin
        { text: "Auditoría", icon: <HistoryEduIcon />, path: "/audit", show: isRoot || isCorp || isHotelAdmin },
        
        // Reportes: Visible para todos
        { text: "Reportes", icon: <AssessmentIcon />, path: "/reports", show: true },
      ]
    }
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
          borderRight: "1px dashed rgba(0, 0, 0, 0.12)", 
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          pb: 2
        },
      }}
    >
      {/* 1. HEADER / LOGO */}
      <Box sx={{ p: 3, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Box component="img" src={LogoImg} alt="Logo" sx={{ height: 45, objectFit: 'contain' }} />
      </Box>

      {/* 2. LISTA DE MENÚ SCROLLEABLE */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", px: 2 }}>
        {menuGroups.map((group, index) => {
          const visibleItems = group.items.filter(i => i.show);
          if (visibleItems.length === 0) return null;

          return (
            <Box key={index} sx={{ mb: 3 }}>
              <Typography 
                variant="caption" 
                sx={{ ml: 2, mb: 1, display: 'block', color: theme.palette.text.disabled, fontWeight: 700, letterSpacing: 1.1 }}
              >
                {group.title}
              </Typography>

              <List disablePadding>
                {visibleItems.map((item) => {
                  const active = location.pathname.startsWith(item.path);
                  return (
                    <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        onClick={() => navigate(item.path)}
                        sx={{
                          borderRadius: '12px',
                          minHeight: 44,
                          backgroundColor: active ? alpha(theme.palette.primary.main, 0.12) : "transparent",
                          color: active ? theme.palette.primary.main : theme.palette.text.secondary,
                          "&:hover": {
                            backgroundColor: active 
                                ? alpha(theme.palette.primary.main, 0.20) 
                                : alpha(theme.palette.text.primary, 0.05),
                          },
                          transition: "all 0.2s ease-in-out"
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40, color: active ? theme.palette.primary.main : theme.palette.text.secondary }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText 
                            primary={item.text} 
                            primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: active ? 600 : 500 }} 
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          );
        })}
      </Box>

      {/* 3. FOOTER / PERFIL DE USUARIO */}
      <Box sx={{ px: 2, mt: 1 }}>
        <Box 
            sx={{ 
                p: 2, borderRadius: '16px', backgroundColor: alpha(theme.palette.primary.main, 0.05),
                display: 'flex', alignItems: 'center', gap: 2, transition: '0.3s',
                '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.1) }
            }}
        >
            <Avatar sx={{ bgcolor: theme.palette.primary.main, color: '#fff', width: 40, height: 40, fontWeight: 'bold', fontSize: '1rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                {user?.nombre ? user.nombre.charAt(0) : "U"}
            </Avatar>
            
            <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                <Typography variant="subtitle2" noWrap fontWeight="bold" sx={{ color: theme.palette.text.primary }}>
                    {user?.nombre || "Usuario"}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {isRoot && <SecurityIcon sx={{ fontSize: 12, color: theme.palette.warning.main }} />}
                    <Typography variant="caption" noWrap sx={{ color: theme.palette.text.secondary }}>
                        {/* Limpiamos el nombre del rol para que se vea mejor */}
                        {user?.rol === ROLES.ROOT ? "Super Admin" : user?.rol?.replace("HOTEL_", "") || "Invitado"}
                    </Typography>
                </Box>
            </Box>

            <Tooltip title="Cerrar Sesión">
                <IconButton onClick={logout} size="small" sx={{ color: theme.palette.error.main }}>
                    <LogoutIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;