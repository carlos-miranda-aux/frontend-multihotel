import React, { useContext } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider // Asegúrate de que Divider esté importado
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import WarningIcon from "@mui/icons-material/Warning";
import BuildIcon from "@mui/icons-material/Build";
import EventNoteIcon from '@mui/icons-material/EventNote';
import { AuthContext } from "../context/AuthContext";
import { AlertContext } from "../context/AlertContext";
import Logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

const TopBar = ({ onMenuClick }) => {
  const { user, logout } = useContext(AuthContext);
  // Usar el contexto de alertas
  const { totalAlertCount, warrantyAlertsList, pendingMaintenancesList, pendingRevisionsList } = useContext(AlertContext);

  const [profileAnchorEl, setProfileAnchorEl] = React.useState(null);
  const [alertsAnchorEl, setAlertsAnchorEl] = React.useState(null);
  const navigate = useNavigate();

  const handleProfileClick = (event) => setProfileAnchorEl(event.currentTarget);
  const handleProfileClose = () => setProfileAnchorEl(null);
  
  const handleAlertsClick = (event) => setAlertsAnchorEl(event.currentTarget);
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
  }

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

        {/* Derecha: Alertas + Perfil */}
        {user && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            
            {/* Icono de alertas (Actualizado) */}
            <IconButton color="inherit" onClick={handleAlertsClick}>
              <Badge badgeContent={totalAlertCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Perfil (Sin cambios) */}
            <Box
              sx={{ display: "flex", alignItems: "center", cursor: "pointer", gap: 1 }}
              onClick={handleProfileClick}
            >
              <Avatar sx={{ bgcolor: "#9D3194" }}>
                {user.username ? user.username[0].toUpperCase() : "U"}
              </Avatar>
              <Box>{user.username || user.nombre}</Box>
            </Box>

            {/* Menú desplegable de Perfil (Sin cambios) */}
            <Menu
              anchorEl={profileAnchorEl}
              open={Boolean(profileAnchorEl)}
              onClose={handleProfileClose}
            >
              <MenuItem onClick={handleSettings}>Configuraciones</MenuItem>
              <MenuItem onClick={handleLogout}>Cerrar sesión</MenuItem>
            </Menu>

            {/* Menú desplegable de Alertas */}
            <Menu
              anchorEl={alertsAnchorEl}
              open={Boolean(alertsAnchorEl)}
              onClose={handleAlertsClose}
              sx={{ '.MuiMenu-paper': { width: 360, maxWidth: '90%' } }}
            >
              <Typography variant="h6" sx={{ px: 2, pt: 1, pb: 1 }}>
                Notificaciones
              </Typography>
              <Divider />
              <List sx={{ maxHeight: 400, overflowY: 'auto' }}>
                {totalAlertCount === 0 ? (
                  <ListItem>
                    <ListItemText primary="No hay alertas nuevas" secondary="¡Todo en orden!" />
                  </ListItem>
                ) : (
                  <>
                    {/* Alertas de Garantía */}
                    {(warrantyAlertsList || []).map(device => ( // Protección || []
                      <MenuItem key={`w-${device.id}`} onClick={() => { navigate(`/inventory/edit/${device.id}`); handleAlertsClose(); }}>
                        <ListItemIcon><WarningIcon color="error" /></ListItemIcon>
                        <ListItemText primary="Garantía por Vencer" secondary={`${device.etiqueta} - Vence: ${formatDate(device.garantia_fin)}`} />
                      </MenuItem>
                    ))}
                    {/* Alertas de Mantenimiento */}
                    {(pendingMaintenancesList || []).map(maint => ( // Protección || []
                      <MenuItem key={`m-${maint.id}`} onClick={() => { navigate(`/maintenances/edit/${maint.id}`); handleAlertsClose(); }}>
                        <ListItemIcon><BuildIcon color="warning" /></ListItemIcon>
                        {/* 👇 --- INICIA LA CORRECCIÓN --- 👇 */}
                        <ListItemText 
                          primary="Mantenimiento Pendiente" 
                          secondary={`${maint.device?.etiqueta || 'N/A'} - ${maint.descripcion?.substring(0, 25) || ''}...`} 
                        />
                        {/* 👆 --- TERMINA LA CORRECCIÓN --- 👆 */}
                      </MenuItem>
                    ))}
                    {/* Alertas de Revisión */}
                    {(pendingRevisionsList || []).map(device => ( // Protección || []
                      <MenuItem key={`r-${device.id}`} onClick={() => { navigate(`/inventory/edit/${device.id}`); handleAlertsClose(); }}>
                        <ListItemIcon><EventNoteIcon color="warning" /></ListItemIcon>
                        <ListItemText primary="Revisión Vencida" secondary={`${device.etiqueta} - Venció: ${formatDate(device.fecha_proxima_revision)}`} />
                      </MenuItem>
                    ))}
                  </>
                )}
              </List>
            </Menu>

          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;