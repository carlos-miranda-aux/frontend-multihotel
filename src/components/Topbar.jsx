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
  Avatar,
  useTheme,
  alpha
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import WarningIcon from "@mui/icons-material/Warning";
import BuildIcon from "@mui/icons-material/Build";
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';

import { AuthContext } from "../context/AuthContext";
import { AlertContext } from "../context/AlertContext";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/CrownLogo.png";

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
  const theme = useTheme();

  const handleProfileClick = (event) => setProfileAnchorEl(event.currentTarget);
  const handleProfileClose = () => setProfileAnchorEl(null);
  
  const handleAlertsClick = (event) => {
      event.preventDefault();
      setAlertsAnchorEl(event.currentTarget);
      setTimeout(() => refreshAlerts(), 100);
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

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const combinedAlerts = [
    ...pendingMaintenancesList.map(m => ({
        id: `m-${m.id}`,
        type: 'Mantenimiento Crítico',
        primary: m.device?.nombre_equipo || 'Equipo Desconocido',
        secondary: `Fecha: ${formatDate(m.fecha_programada)}`,
        icon: <BuildIcon color="warning" />, // Usa color del tema
        path: `/maintenances/edit/${m.id}`
    })),
    ...warrantyAlertsList.map(d => ({
        id: `w-${d.id}`,
        type: 'Garantía por Vencer',
        primary: d.nombre_equipo || 'N/A',
        secondary: `Vence: ${formatDate(d.garantia_fin)}`,
        icon: <WarningIcon color="error" />, // Usa color del tema
        path: `/inventory/edit/${d.id}`
    }))
  ];

  const renderAlertMenu = (
    <Menu
      anchorEl={alertsAnchorEl}
      open={Boolean(alertsAnchorEl)}
      onClose={handleAlertsClose}
      slotProps={{ paper: { sx: { width: 360, maxWidth: '90%', mt: 1 } } }}
    >
      <Typography variant="h6" sx={{ px: 2, pt: 1, pb: 1, fontWeight: 'bold' }}>
        Notificaciones
      </Typography>
      <Divider />
      <List sx={{ maxHeight: 400, overflowY: 'auto' }}>
        {loading ? (
            <MenuItem disabled>Cargando alertas...</MenuItem>
        ) : combinedAlerts.length === 0 ? (
          <ListItemText primary="No hay alertas críticas" secondary="¡Todo en orden!" sx={{ px: 2, py: 1, textAlign: 'center', color: 'text.secondary' }}/>
        ) : (
          combinedAlerts.map(alert => ( 
              <MenuItem key={alert.id} onClick={() => { navigate(alert.path); handleAlertsClose(); }}>
                <ListItemIcon>{alert.icon}</ListItemIcon>
                <ListItemText 
                  primary={<Typography variant="subtitle2" fontWeight="bold">{alert.type}</Typography>}
                  secondary={`${alert.primary} - ${alert.secondary}`}
                />
              </MenuItem>
            ))
        )}
      </List>
    </Menu>
  );

  return (
    <AppBar
      position="static" // O 'fixed' si prefieres que se quede arriba al hacer scroll
      elevation={0}
      sx={{
        backgroundColor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        {/* Izquierda */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton edge="start" color="inherit" onClick={onMenuClick}>
            <MenuIcon />
          </IconButton>
          <Box
            sx={{ display: "flex", alignItems: "center", cursor: "pointer", ml: 1 }}
            onClick={handleLogoClick}
          >
            <img src={Logo} alt="Logo" style={{ height: "32px", width: "auto" }} />
          </Box>
        </Box>

        {/* Derecha */}
        {user && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconButton color="inherit" onClick={handleAlertsClick}>
              <Badge badgeContent={totalAlertCount} color="error">
                <NotificationsIcon />
              </Badge>  
            </IconButton>

            {/* Perfil */}
            <Box
              sx={{ 
                display: "flex", alignItems: "center", cursor: "pointer", gap: 1,
                p: 0.5, pr: 1.5, borderRadius: 20,
                transition: 'background-color 0.2s',
                '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.08) }
              }}
              onClick={handleProfileClick}
            >
              <Avatar 
                  sx={{ 
                    bgcolor: 'primary.main', 
                    width: 32, height: 32, 
                    fontSize: '0.9rem' 
                  }}
                  src={user.avatarUrl} 
              >
                  {user.initials}
              </Avatar>
              <Typography variant="body2" fontWeight="500" sx={{ display: { xs: 'none', sm: 'block' } }}>
                {user.nombre?.split(' ')[0] || user.username}
              </Typography>
            </Box>

            <Menu
              anchorEl={profileAnchorEl}
              open={Boolean(profileAnchorEl)}
              onClose={handleProfileClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleSettings}>
                 <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                 Configuración
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                 <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
                 Cerrar sesión
              </MenuItem>
            </Menu>

            {renderAlertMenu}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;