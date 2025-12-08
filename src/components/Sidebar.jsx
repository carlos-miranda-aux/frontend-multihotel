import React, { useContext } from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Typography, Box, useTheme, alpha } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ROLES } from "../config/constants";

// Iconos
import DashboardIcon from "@mui/icons-material/Dashboard";
import ComputerIcon from "@mui/icons-material/Computer";
import PeopleIcon from "@mui/icons-material/People";
import BuildIcon from "@mui/icons-material/Build";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import AssessmentIcon from "@mui/icons-material/Assessment";
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import LogoImg from "../assets/simetv2.png"; 

const drawerWidth = 280; 

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { user } = useContext(AuthContext);

  const isRoot = user?.rol === ROLES.ROOT;
  const isHotelAdmin = user?.rol === ROLES.HOTEL_ADMIN;
  // Solo Root y Admin ven configuraciones maestras
  const canConfig = isRoot || isHotelAdmin;

  const menuGroups = [
    {
      title: "PRINCIPAL",
      items: [
        { text: "Inicio", icon: <DashboardIcon />, path: "/home", show: true },
      ]
    },
    {
      title: "OPERACIÓN",
      items: [
        { text: "Inventario", icon: <ComputerIcon />, path: "/inventory", show: true },
        { text: "Mantenimientos", icon: <BuildIcon />, path: "/maintenances", show: true },
        { text: "Usuarios", icon: <PeopleIcon />, path: "/users", show: true },
        { text: "Bajas", icon: <DeleteSweepIcon />, path: "/disposals", show: true },
      ]
    },
    {
      title: "ADMINISTRACIÓN",
      items: [
        // 1. Configuraciones Maestras (Contiene Hoteles, Áreas, Usuarios Sist, etc.)
        { text: "Configuraciones Maestras", icon: <SettingsSuggestIcon />, path: "/admin-settings", show: canConfig },
        // 2. Bitácora de Cambios
        { text: "Bitácora de Cambios", icon: <HistoryEduIcon />, path: "/audit", show: canConfig || user?.rol === ROLES.CORP_VIEWER },
        // 3. Reportes
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
          display: "flex", flexDirection: "column", pb: 2
        },
      }}
    >
      <Box sx={{ p: 2.5, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Box component="img" src={LogoImg} alt="Logo" sx={{ height: 90, objectFit: 'contain' }} />
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: "auto", px: 2 }}>
        {menuGroups.map((group, index) => {
          const visibleItems = group.items.filter(i => i.show);
          if (visibleItems.length === 0) return null;

          return (
            <Box key={index} sx={{ mb: 3 }}>
              <Typography variant="caption" sx={{ ml: 2, mb: 1, display: 'block', color: theme.palette.text.disabled, fontWeight: 700, letterSpacing: 1.1 }}>
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
                          borderRadius: '12px', minHeight: 44,
                          backgroundColor: active ? alpha(theme.palette.primary.main, 0.12) : "transparent",
                          color: active ? theme.palette.primary.main : theme.palette.text.secondary,
                          "&:hover": { backgroundColor: active ? alpha(theme.palette.primary.main, 0.20) : alpha(theme.palette.text.primary, 0.05) },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40, color: active ? theme.palette.primary.main : theme.palette.text.secondary }}>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: active ? 600 : 500 }} />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          );
        })}
      </Box>
    </Drawer>
  );
};

export default Sidebar;