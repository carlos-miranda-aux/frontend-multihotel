// src/pages/Home.jsx
import React, { useContext, useEffect, useState } from "react";
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
import { AlertContext } from "../context/AlertContext";

// ... (WidgetCard sigue igual)
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
  const {
    loading: alertLoading, 
    warrantyAlertsList,
    pendingMaintenancesList,
    devices // 👈 CORRECCIÓN: Obtenemos devices del contexto
  } = useContext(AlertContext);

  const [stats, setStats] = useState({
    totalDevices: 0,
    totalUsers: 0,
    pendingTasksCount: 0,
    warrantyAlertsCount: 0,
  });
  const [warrantyData, setWarrantyData] = useState([]);
  const [pageLoading, setPageLoading] = useState(true); 
  
  const navigate = useNavigate();
  const theme = useTheme();

  const COLORS = {
    Vigentes: theme.palette.success.main,
    Riesgo: theme.palette.warning.main,
  };

  useEffect(() => {
    // Solo ejecutamos esto cuando el contexto (alertLoading) haya terminado
    if (!alertLoading) {
      
      const fetchPageSpecificData = async () => {
        try {
          setPageLoading(true); 

          // 👈 CORRECCIÓN: Quitamos la llamada a /devices/get (viene del context)
          // y leemos la respuesta paginada de /users/get
          const [usersRes] = await Promise.all([
            // api.get("/devices/get"), // 👈 ELIMINADA
            api.get("/users/get?page=1&limit=1"), // Solo necesitamos el totalCount
          ]);
          
          const usersTotal = usersRes.data.totalCount || 0; // 👈 CORRECCIÓN

          // --- Lógica de Garantías (para el gráfico) ---
          const today = new Date();
          today.setHours(0, 0, 0, 0); 

          const ninetyDaysFromNow = new Date();
          ninetyDaysFromNow.setDate(today.getDate() + 90);
          ninetyDaysFromNow.setHours(0, 0, 0, 0);

          let safeCount = 0; 
          let expiringSoonCount = 0;

          devices.forEach((d) => { // 👈 CORRECCIÓN: 'devices' es del contexto
            if (!d.garantia_fin) {
              safeCount++; 
            } else {
              const expirationDate = new Date(d.garantia_fin);
              if (expirationDate < today) {
                // Vencida, ignorar
              } else if (expirationDate >= today && expirationDate <= ninetyDaysFromNow) {
                expiringSoonCount++; // En Riesgo
              } else {
                safeCount++; // Vigente
              }
            }
          });
          
          setWarrantyData([
            { name: 'Vigentes', value: safeCount },
            { name: 'Riesgo (90d)', value: expiringSoonCount },
          ]);
          
          // Calcular KPIs
          setStats({
            totalDevices: devices.length, // 👈 CORRECCIÓN: 'devices' es del contexto
            totalUsers: usersTotal, // 👈 CORRECCIÓN
            pendingTasksCount: pendingMaintenancesList.length,
            warrantyAlertsCount: warrantyAlertsList.length,
          });

          setPageLoading(false); 

        } catch (error) {
           console.error("Error cargando datos de Home:", error);
           setPageLoading(false);
        }
      };

      fetchPageSpecificData();
    }
  }, [alertLoading, pendingMaintenancesList, warrantyAlertsList, devices]); // 👈 'devices' añadido


  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (alertLoading || pageLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Panel de Control
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 4 }}>
        Resumen del estado de tu infraestructura TI.
      </Typography>

      {/* --- Widgets de Resumen (KPIs) --- */}
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
            title="Tareas Pendientes" 
            value={stats.pendingTasksCount}
            icon={<BuildIcon />}
            color={stats.pendingTasksCount > 0 ? theme.palette.warning.main : theme.palette.success.main}
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

      {/* --- Columnas de Contenido (Listas de Alertas) --- */}
      <Grid container spacing={3}>
        
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 3, height: '100%' }} elevation={3}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Tareas Pendientes
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {pendingMaintenancesList.length > 0 ? (
              <List dense disablePadding>
                {pendingMaintenancesList.map((m) => (
                  <ListItem key={`m-${m.id}`} divider
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
                      secondary={`TAREA: ${m.descripcion} (Prog: ${formatDate(m.fecha_programada)})`}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="textSecondary" sx={{ textAlign: 'center', pt: 4 }}>
                No hay tareas pendientes. ¡Buen trabajo!
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

            <Box sx={{ height: 120, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={warrantyData}
                    dataKey="value" nameKey="name"
                    cx="50%" cy="50%"
                    outerRadius={45} innerRadius={30}
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

            {/* Lista de Alertas */}
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