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
import PeopleIcon from '@mui/icons-material/People';
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useTheme } from '@mui/material/styles';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

// --- Componente de Widget (Sin cambios) ---
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
    totalUsers: 0,
    pendingMaintenancesCount: 0,
    warrantyAlertsCount: 0,
  });
  const [warrantyData, setWarrantyData] = useState([]);
  const [warrantyAlertsList, setWarrantyAlertsList] = useState([]);
  const [pendingMaintenancesList, setPendingMaintenancesList] = useState([]);
  
  const navigate = useNavigate();
  const theme = useTheme();

  // 👇 1. SIMPLIFICAMOS LOS COLORES
  const COLORS = {
    Vigentes: theme.palette.success.main,
    Riesgo: theme.palette.warning.main,
    // Ya no necesitamos el color 'Vencidas'
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [devicesRes, maintenancesRes, usersRes] = await Promise.all([
          api.get("/devices/get"),
          api.get("/maintenances/get"),
          api.get("/users/get"),
        ]);

        const devices = devicesRes.data; // Esto ya son solo equipos ACTIVOS
        const maintenances = maintenancesRes.data;
        const users = usersRes.data;

        // --- Lógica de Mantenimientos (Sin cambios) ---
        const pending = maintenances.filter((m) => m.estado === "pendiente");
        setPendingMaintenancesList(pending);

        // --- 👇 2. LÓGICA DE GARANTÍAS MODIFICADA ---
        const today = new Date();
        const ninetyDaysFromNow = new Date();
        ninetyDaysFromNow.setDate(today.getDate() + 90);

        let safeCount = 0; // Vigentes
        let expiringSoonCount = 0; // En Riesgo
        // Ya no contamos 'expiredCount' para el gráfico
        const expiringList = [];

        // Iteramos solo sobre los equipos ACTIVOS
        devices.forEach((d) => {
          if (!d.garantia_fin) {
            safeCount++; // Si no tiene fecha, se considera "Vigente"
          } else {
            const expirationDate = new Date(d.garantia_fin);
            if (expirationDate < today) {
              // Es un equipo activo con garantía vencida.
              // Lo ignoramos del gráfico, como pediste.
            } else if (expirationDate <= ninetyDaysFromNow) {
              // EN RIESGO
              expiringSoonCount++;
              expiringList.push(d); 
            } else {
              // VIGENTE
              safeCount++;
            }
          }
        });
        
        // 👇 3. ENVIAR SOLO 2 CATEGORÍAS AL GRÁFICO
        setWarrantyData([
          { name: 'Vigentes', value: safeCount },
          { name: 'Riesgo (90d)', value: expiringSoonCount },
        ]);
        
        setWarrantyAlertsList(expiringList);

        // El stat del KPI sigue siendo el de "Riesgo"
        setStats({
          totalDevices: devices.length,
          totalUsers: users.length,
          pendingMaintenancesCount: pending.length,
          warrantyAlertsCount: expiringSoonCount,
        });

        setLoading(false);
      } catch (error) {
        console.error("Error cargando dashboard:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
    // 👇 4. ACTUALIZAR DEPENDENCIAS DE useEffect
  }, [theme.palette.success.main, theme.palette.warning.main]); 

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* --- Título (Sin cambios) --- */}
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Panel de Control
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 4 }}>
        Resumen del estado de tu infraestructura TI.
      </Typography>

      {/* --- Widgets de Resumen (KPIs) (Sin cambios) --- */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}> 
          <WidgetCard
            title="Equipos Activos"
            value={stats.totalDevices}
            icon={<DevicesIcon />}
            color={theme.palette.primary.main}
            onClick={() => navigate("/inventory")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <WidgetCard
            title="Usuarios Gestionados"
            value={stats.totalUsers}
            icon={<PeopleIcon />}
            color={theme.palette.secondary.main}
            onClick={() => navigate("/users")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <WidgetCard
            title="Mantenimientos Pendientes"
            value={stats.pendingMaintenancesCount}
            icon={<BuildIcon />}
            color={stats.pendingMaintenancesCount > 0 ? theme.palette.warning.main : theme.palette.success.main}
            onClick={() => navigate("/maintenances")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <WidgetCard
            title="Garantías en Riesgo"
            value={stats.warrantyAlertsCount}
            icon={<WarningIcon />}
            color={stats.warrantyAlertsCount > 0 ? theme.palette.error.main : theme.palette.success.main}
          />
        </Grid>
      </Grid>

      {/* --- Columnas de Contenido --- */}
      <Grid container spacing={3}>
        
        {/* --- Columna 1: Mantenimientos (Sin cambios) --- */}
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 3, height: '100%' }} elevation={3}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Mantenimientos Programados
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {pendingMaintenancesList.length > 0 ? (
              <List disablePadding>
                {pendingMaintenancesList.map((m) => (
                  <ListItem key={m.id} divider
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
        
        {/* --- Columna 2: Alertas de Garantía (Gráfico actualizado) --- */}
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 3, height: '100%', border: 1, borderColor: warrantyAlertsList.length > 0 ? 'error.main' : 'transparent' }} elevation={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: warrantyAlertsList.length > 0 ? 'error.main' : 'text.primary' }}>
              <WarningIcon sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Alertas de Garantía (90 días)
              </Typography>
            </Box>

            {/* --- GRÁFICO (Ahora solo con 2 categorías) --- */}
            <Box sx={{ height: 120, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={warrantyData} // Solo tiene "Vigentes" y "Riesgo"
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={45}
                    innerRadius={30}
                  >
                    {warrantyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name.split(' ')[0]]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            
            <Divider sx={{ my: 2 }} />

            {/* --- Lista de Alertas (Sigue mostrando solo "En Riesgo") --- */}
            {warrantyAlertsList.length > 0 ? (
              <List dense disablePadding>
                {warrantyAlertsList.map((device) => (
                  <ListItem key={device.id} divider
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
              <Typography color="textSecondary" sx={{ textAlign: 'center', pt: 2 }}>
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