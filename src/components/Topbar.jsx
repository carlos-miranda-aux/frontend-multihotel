// src/components/Topbar.jsx
import React, { useContext, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Badge,
  Menu,
  MenuItem,
  Divider,
  List,
  ListItemText,
  ListItemIcon,
  // useTheme, <-- ELIMINADO para evitar crash
  ListItemButton,
  Avatar,
  Button
} from "@mui/material";
// Import ALL icons used
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import WarningIcon from "@mui/icons-material/Warning";
import BuildIcon from "@mui/icons-material/Build";
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import AccessTimeIcon from '@mui/icons-material/AccessTime'; 
import { AuthContext } from "../context/AuthContext";
import { AlertContext } from "../context/AlertContext";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/CrownLogo.png";

// Renombrado a TopBar para consistencia (importado en MainLayout)
const TopBar = ({ onMenuClick }) => { 
  const { user, logout } = useContext(AuthContext);
  const { 
    totalAlertCount,
    warrantyAlertsList, 
    pendingMaintenancesList, 
    loading, 
    refreshAlerts 
  } = useContext(AlertContext);

  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [alertsAnchorEl, setAlertsAnchorEl] = useState(null);
  const navigate = useNavigate();

  // ... (handlers de perfil y navegación)
  const handleProfileClick = (event) => setProfileAnchorEl(event.currentTarget);
  const handleProfileClose = () => setProfileAnchorEl(null);
  
  const handleAlertsClick = (event) => {
      refreshAlerts(); 
      setAlertsAnchorEl(event.currentTarget);
  };
  const handleAlertsClose = () => setAlertsAnchorEl(null);


  const handleLogout = () => {
    logout();
    handleProfileClose();
  };
  
  const handleSettings = () => {
    navigate("/settings");
    handleProfileClose();
  };
  
  const handleLogoClick = () => navigate("/home");

  // Helper para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Combina las dos listas de alertas para mostrar en el menú desplegable
  const combinedAlerts = [
    // Mantenimientos Críticos (5 Días Hábiles)
    ...pendingMaintenancesList.map(m => ({
        id: `m-${m.id}`,
        type: 'Mantenimiento Crítico',
        primary: m.device?.nombre_equipo || m.device?.etiqueta || 'Equipo Desconocido',
        secondary: `Fecha: ${formatDate(m.fecha_programada)} - ${m.descripcion?.substring(0, 25) || ''}...`,
        // USANDO COLOR HARDCODEADO (Warning/Orange)
        icon: <BuildIcon sx={{ color: '#ff9800' }} />, 
        path: `/maintenances/edit/${m.id}`
    })),
    // Garantías por Vencer (90 días)
    ...warrantyAlertsList.map(d => ({
        id: `w-${d.id}`,
        type: 'Garantía por Vencer',
        primary: d.nombre_equipo || d.etiqueta || 'N/A',
        secondary: `Vence: ${formatDate(d.garantia_fin)}`,
        // USANDO COLOR HARDCODEADO (Error/Red)
        icon: <WarningIcon sx={{ color: '#f44336' }} />, 
        path: `/inventory/edit/${d.id}`
    }))
  ];

  // Ordenar por tipo (mantenimiento primero, luego garantía)
  combinedAlerts.sort((a, b) => {
      if (a.type === 'Mantenimiento Crítico' && b.type !== 'Mantenimiento Crítico') return -1;
      if (a.type !== 'Mantenimiento Crítico' && b.type === 'Mantenimiento Crítico') return 1;
      return 0;
  });

  const renderAlertMenu = (
    <Menu
      anchorEl={alertsAnchorEl}
      open={Boolean(alertsAnchorEl)}
      onClose={handleAlertsClose}
      sx={{ '.MuiMenu-paper': { width: 360, maxWidth: '90%' } }}
    >
      <Typography variant="h6" sx={{ px: 2, pt: 1, pb: 1 }}>
        Notificaciones ({totalAlertCount})
      </Typography>
      <Divider />
      <List sx={{ maxHeight: 400, overflowY: 'auto' }}>
        {loading ? (
            <MenuItem disabled>Cargando alertas...</MenuItem>
        ) : combinedAlerts.length === 0 ? (
          <ListItemText primary="No hay alertas críticas" secondary="¡Todo en orden!" sx={{ px: 2, py: 1 }}/>
        ) : (
          <>
            {combinedAlerts.map(alert => ( 
              <MenuItem key={alert.id} onClick={() => { 
                navigate(alert.path); 
                handleAlertsClose(); 
              }}>
                <ListItemIcon>{alert.icon}</ListItemIcon>
                <ListItemText 
                  primary={<Typography variant="subtitle2" fontWeight="bold">{alert.type}</Typography>}
                  secondary={
                    <React.Fragment>
                        <Typography 
                            component="span"
                            variant="body2"
                            color="text.primary"
                        >
                            {alert.primary}
                        </Typography>
                        <br/>
                        {alert.secondary}
                    </React.Fragment>
                  }
                />
              </MenuItem>
            ))}
          </>
        )}
      </List>
      <Divider />
    </Menu>
  );

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#fff",
        color: "#222",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Izquierda: Logo + Menu lateral */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton edge="start" color="inherit" onClick={onMenuClick}>
            <MenuIcon />
          </IconButton>
          <Box
            sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}
            onClick={handleLogoClick}
          >
            <img src={Logo} alt="SIMET Logo" style={{ height: "40px" }} />
          </Box>
        </Box>

        {/* Derecha: Alertas + Perfil (MODIFICADO) */}
        {user && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            
            {/* Icono de alertas (Actualizado) */}
            <IconButton color="inherit" onClick={handleAlertsClick}>
              <Badge badgeContent={totalAlertCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Perfil (MODIFICADO: Muestra Nombre y Avatar con Imagen) */}
            <Box
              sx={{ display: "flex", alignItems: "center", cursor: "pointer", gap: 1 }}
              onClick={handleProfileClick}
            >
              <Avatar 
                  sx={{ bgcolor: "#9D3194" }}
                  src={user.avatarUrl} 
              >
                  {user.initials}
              </Avatar>
              <Box>
                {/* Muestra el nombre completo, o username si el nombre no existe */}
                {user.nombre || user.username}
              </Box>
            </Box>

            {/* Menú desplegable de Perfil (Sin cambios) */}
            <Menu
              anchorEl={profileAnchorEl}
              open={Boolean(profileAnchorEl)}
              onClose={handleProfileClose}
            >
              <MenuItem onClick={handleSettings}>
                 <ListItemIcon>
                    <SettingsIcon fontSize="small" />
                 </ListItemIcon>
                 Configuraciones
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                 <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                 </ListItemIcon>
                 Cerrar sesión
              </MenuItem>
            </Menu>

            {/* Menú desplegable de Alertas */}
            {renderAlertMenu}

          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;