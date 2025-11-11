// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button
} from "@mui/material";
import DevicesIcon from "@mui/icons-material/Devices";
import BuildIcon from "@mui/icons-material/Build";
import WarningIcon from "@mui/icons-material/Warning";
import EventBusyIcon from '@mui/icons-material/EventBusy';
import PeopleIcon from '@mui/icons-material/People'; // 👈 1. IMPORTAR NUEVO ICONO
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useTheme } from '@mui/material/styles';

// --- Componente de Widget (sin cambios) ---
const WidgetCard = ({ title, value, icon, color, onClick }) => (
  <Paper
    onClick={onClick}
    sx={{
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      height: 140,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s ease',
      '&:hover': {
        transform: onClick ? 'translateY(-4px)' : 'none',
        boxShadow: 6,
      },
    }}
    elevation={3}
  >
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ mr: 2, color: color }}>
        {React.cloneElement(icon, { sx: { fontSize: 40 } })}
      </Box>
      <Box>
        <Typography variant="h4" component="div" fontWeight="bold">
          {value}
        </Typography>
        <Typography color="textSecondary" variant="subtitle1" noWrap>
          {title}
        </Typography>
      </Box>
    </Box>
  </Paper>
);

// --- Componente Principal del Home ---
const Home = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDevices: 0,
    totalUsers: 0, // 👈 2. AÑADIR NUEVO ESTADO
    pendingMaintenancesCount: 0,
    warrantyAlertsCount: 0,
  });
  const [warrantyAlertsList, setWarrantyAlertsList] = useState([]);
  const [pendingMaintenancesList, setPendingMaintenancesList] = useState([]);
  
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // 👇 3. AÑADIR /users/get A LA LLAMADA
        const [devicesRes, maintenancesRes, usersRes] = await Promise.all([
          api.get("/devices/get"),
          api.get("/maintenances/get"),
          api.get("/users/get"), // (Usuarios Crown)
        ]);

        const devices = devicesRes.data;
        const maintenances = maintenancesRes.data;
        const users = usersRes.data; // 👈 4. OBTENER USUARIOS

        // ... (lógica de mantenimientos y garantías sin cambios)
        const pending = maintenances.filter((m) => m.estado === "pendiente");
        const today = new Date();
        const ninetyDaysFromNow = new Date();
        ninetyDaysFromNow.setDate(today.getDate() + 90);
        const expiringWarranties = devices.filter((d) => {
          if (!d.garantia_fin) return false;
          const expirationDate = new Date(d.garantia_fin);
          return expirationDate > today && expirationDate <= ninetyDaysFromNow;
        });

        // 👇 5. ACTUALIZAR EL ESTADO CON EL CONTEO DE USUARIOS
        setStats({
          totalDevices: devices.length,
          totalUsers: users.length, // <-- AÑADIDO
          pendingMaintenancesCount: pending.length,
          warrantyAlertsCount: expiringWarranties.length,
        });

        setWarrantyAlertsList(expiringWarranties);
        setPendingMaintenancesList(pending);
        setLoading(false);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // ... (función formatDate sin cambios)
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };


  if (loading) {
    // ... (spinner de carga sin cambios)
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* ... (Títulos sin cambios) ... */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Panel de Control
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 4 }}>
        Resumen del estado de tu infraestructura TI.
      </Typography>


      {/* --- Widgets de Resumen (KPIs) --- */}
      {/* 👇 6. AJUSTAR EL GRID DE 4 A 3 COLUMNAS (md={4} -> md={3}) 👇 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        
        <Grid item xs={12} md={3}> 
          <WidgetCard
            title="Equipos Activos"
            value={stats.totalDevices}
            icon={<DevicesIcon />}
            color={theme.palette.primary.main}
            onClick={() => navigate("/inventory")}
          />
        </Grid>

        {/* --- WIDGET NUEVO --- */}
        <Grid item xs={12} md={3}>
          <WidgetCard
            title="Usuarios Gestionados"
            value={stats.totalUsers}
            icon={<PeopleIcon />}
            color={theme.palette.secondary.main} // O el color que prefieras
            onClick={() => navigate("/users")}
          />
        </Grid>
        {/* --- FIN WIDGET NUEVO --- */}

        <Grid item xs={12} md={3}>
          <WidgetCard
            title="Mantenimientos Pendientes"
            value={stats.pendingMaintenancesCount}
            icon={<BuildIcon />}
            color={stats.pendingMaintenancesCount > 0 ? theme.palette.warning.main : theme.palette.success.main}
            onClick={() => navigate("/maintenances")}
          />
        </Grid>
        
        <Grid item xs={12} md={3}>
          <WidgetCard
            title="Garantías en Riesgo"
            value={stats.warrantyAlertsCount}
            icon={<WarningIcon />}
            color={stats.warrantyAlertsCount > 0 ? theme.palette.error.main : theme.palette.success.main}
          />
        </Grid>
      </Grid>

      {/* --- Columnas de Contenido (sin cambios) --- */}
      <Grid container spacing={3}>
        
        {/* --- Columna 1: Mantenimientos Programados --- */}
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 3, height: '100%' }} elevation={3}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Mantenimientos Programados
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {pendingMaintenancesList.length > 0 ? (
              <List disablePadding>
                {pendingMaintenancesList.map((m) => (
                  <ListItem 
                    key={m.id} 
                    divider
                    secondaryAction={
                      <Button size="small" variant="outlined" onClick={() => navigate(`/maintenances/edit/${m.id}`)}>
                        Gestionar
                      </Button>
                    }
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: theme.palette.warning.main }}>
                      <EventBusyIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={<strong>{m.device?.etiqueta || 'Equipo no encontrado'}</strong>}
                      secondary={`Programado: ${formatDate(m.fecha_programada)} - ${m.descripcion}`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="textSecondary" sx={{ textAlign: 'center', pt: 4 }}>
                No hay mantenimientos pendientes. ¡Buen trabajo!
              </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* --- Columna 2: Alertas de Garantía --- */}
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 3, height: '100%', border: 1, borderColor: stats.warrantyAlertsCount > 0 ? 'error.main' : 'transparent' }} elevation={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: stats.warrantyAlertsCount > 0 ? 'error.main' : 'text.primary' }}>
              <WarningIcon sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Alertas de Garantía (90 días)
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {warrantyAlertsList.length > 0 ? (
              <List disablePadding>
                {warrantyAlertsList.map((device) => (
                  <ListItem 
                    key={device.id} 
                    divider
                    secondaryAction={
                      <Button size="small" variant="outlined" color="error" onClick={() => navigate(`/inventory/edit/${device.id}`)}>
                        Ver
                      </Button>
                    }
                  >
                    <ListItemText
                      primary={<strong>{device.nombre_equipo || device.etiqueta}</strong>}
                      secondary={`Vence: ${formatDate(device.garantia_fin)} (Serie: ${device.numero_serie})`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="textSecondary" sx={{ textAlign: 'center', pt: 4 }}>
                No hay garantías próximas a vencer.
              </Typography>
            )}
          </Paper>
        </Grid>
        
      </Grid>
    </Box>
  );
};

export default Home;