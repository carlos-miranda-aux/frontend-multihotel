// src/pages/Home.jsx
import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  List,
  ListItemButton, // 👈 Usamos ListItemButton para interactividad
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
import PieChartIcon from '@mui/icons-material/PieChart'; 
import { useNavigate } from "react-router-dom";
import api from "../api/axios"; 
import { useTheme } from '@mui/material/styles';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertContext } from "../context/AlertContext";
import "../pages/styles/Home.css"; 

/**
 * Tarjeta de Widget (KPIs superiores)
 */
const WidgetCard = ({ title, value, icon, color, onClick }) => {
  const theme = useTheme();
  return (
    <Paper
      onClick={onClick}
      className="widget-card-base"
      sx={{
        borderLeft: `4px solid ${color}`, 
        cursor: onClick ? 'pointer' : 'default',
      }}
      elevation={3}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', mb: 1 }}>
          <Typography variant="h3" component="div" fontWeight="bold" color={theme.palette.text.primary} sx={{ lineHeight: 1.2 }}>
            {value}
          </Typography>
          <Box sx={{ color: color, opacity: 0.7 }}>
            {React.cloneElement(icon, { sx: { fontSize: 60 } })} 
          </Box>
      </Box>
      <Typography color="textSecondary" variant="subtitle1" sx={{ mt: 1, fontWeight: 600 }}>
        {title}
      </Typography>
    </Paper>
  );
};

const Home = () => {
  const {
    loading: alertLoading, 
    warrantyAlertsList,
    pendingMaintenancesList,
    devices
  } = useContext(AlertContext);

  const [stats, setStats] = useState({
    totalDevices: 0,
    totalUsers: 0,
    pendingTasksCount: 0,
    warrantyAlertsCount: 0,
  });
  
  const [warrantyData, setWarrantyData] = useState([]);
  const [deviceTypeData, setDeviceTypeData] = useState([]); 
  const [pageLoading, setPageLoading] = useState(true); 
  
  const navigate = useNavigate();
  const theme = useTheme();

  const COLORS_WARRANTY = {
    Vigentes: theme.palette.success.main,
    Riesgo: theme.palette.warning.main,
  };

  const COLORS_TYPES = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A73698', '#8884d8'];

  useEffect(() => {
    if (!alertLoading) {
      const fetchPageSpecificData = async () => {
        try {
          setPageLoading(true); 
          const [usersRes] = await Promise.all([
            api.get("/users/get?page=1&limit=1"), 
          ]);
          const usersTotal = usersRes.data.totalCount || 0; 
          
          const today = new Date();
          today.setHours(0, 0, 0, 0); 
          const ninetyDaysFromNow = new Date();
          ninetyDaysFromNow.setDate(today.getDate() + 90);
          ninetyDaysFromNow.setHours(0, 0, 0, 0);

          let safeCount = 0; 
          let expiringSoonCount = 0;
          const typeCounts = {};

          devices.forEach((d) => {
            // 1. Garantías
            if (!d.garantia_fin) {
              safeCount++; 
            } else {
              const expirationDate = new Date(d.garantia_fin);
              if (expirationDate < today) {
                 // Vencidas
              } else if (expirationDate >= today && expirationDate <= ninetyDaysFromNow) {
                expiringSoonCount++; 
              } else {
                safeCount++; 
              }
            }

            // 2. Tipos de Equipo
            const typeName = d.tipo?.nombre || "Otros";
            typeCounts[typeName] = (typeCounts[typeName] || 0) + 1;
          });
          
          setWarrantyData([
            { name: 'Vigentes', value: safeCount },
            { name: 'Riesgo (90d)', value: expiringSoonCount },
          ]);

          const typesArray = Object.keys(typeCounts).map(key => ({
            name: key,
            value: typeCounts[key]
          }));
          setDeviceTypeData(typesArray);
          
          setStats({
            totalDevices: devices.length, 
            totalUsers: usersTotal, 
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
  }, [alertLoading, pendingMaintenancesList, warrantyAlertsList, devices]); 

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

      {/* --- KPI Widgets --- */}
      <Grid container spacing={3} sx={{ mb: 4 }}> 
        <Grid item xs={12} sm={6} md={4}> 
          <WidgetCard
            title="Equipos Activos"
            value={stats.totalDevices}
            icon={<DevicesIcon />}
            color={theme.palette.primary.main}
            onClick={() => navigate("/inventory")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <WidgetCard
            title="Usuarios Gestionados"
            value={stats.totalUsers}
            icon={<PeopleIcon />}
            color={theme.palette.secondary.main}
            onClick={() => navigate("/users")}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <WidgetCard
            title="Tareas Pendientes" 
            value={stats.pendingTasksCount}
            icon={<BuildIcon />}
            color={stats.pendingTasksCount > 0 ? theme.palette.warning.main : theme.palette.success.main}
            onClick={() => navigate("/maintenances")}
          />
        </Grid>
      </Grid>

      {/* --- SECCIÓN PRINCIPAL --- */}
      <Grid container spacing={3}>
        
        {/* 1. Tareas Pendientes (OCUPA EL 100% DEL ANCHO) */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, height: '100%', minHeight: 300 }} elevation={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" fontWeight="bold">
                  Tareas Pendientes
                </Typography>
                <Button size="small" onClick={() => navigate("/maintenances")}>Ver todas</Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {pendingMaintenancesList.length > 0 ? (
              <List dense disablePadding>
                {/* Mostramos hasta 5 tareas con navegación directa al hacer clic */}
                {pendingMaintenancesList.slice(0, 5).map((m) => (
                  <ListItemButton 
                    key={`m-${m.id}`} 
                    divider
                    onClick={() => navigate(`/maintenances/edit/${m.id}`)}
                    alignItems="flex-start"
                  >
                    <ListItemIcon sx={{ minWidth: 40, mt: 0.5, color: theme.palette.warning.main }}>
                      <EventBusyIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={<strong>{m.device?.nombre_equipo || m.device?.etiqueta || 'Equipo no encontrado'}</strong>}
                      secondary={`TAREA: ${m.descripcion} — FECHA: ${formatDate(m.fecha_programada)}`}
                    />
                  </ListItemButton>
                ))}
              </List>
            ) : (
              <Typography color="textSecondary" sx={{ textAlign: 'center', pt: 4 }}>
                No hay tareas pendientes. ¡Buen trabajo!
              </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* 2. Gráfico de Garantías (50%) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', minHeight: 350, border: 1, borderColor: warrantyAlertsList.length > 0 ? 'error.main' : 'transparent' }} elevation={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: warrantyAlertsList.length > 0 ? 'error.main' : 'text.primary' }}>
              <WarningIcon sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Garantías (90 días)
              </Typography>
            </Box>
            
            <Box sx={{ height: 200, width: '100%', position: 'relative' }}> 
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={warrantyData}
                    dataKey="value" nameKey="name"
                    cx="50%" cy="50%"
                    outerRadius={70} 
                    innerRadius={50} 
                  >
                    {warrantyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_WARRANTY[entry.name.split(' ')[0]] || theme.palette.grey[400]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
              
              <Box sx={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <Typography variant="h3" fontWeight="bold" 
                  sx={{ 
                    color: stats.warrantyAlertsCount > 0 ? theme.palette.error.main : theme.palette.success.main, 
                    lineHeight: 1.1
                  }}>
                  {stats.warrantyAlertsCount}
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button size="small" onClick={() => navigate("/inventory")}>Ver Inventario</Button>
            </Box>
          </Paper>
        </Grid>

        {/* 3. Gráfico de Tipos de Equipo (50%) */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', minHeight: 350 }} elevation={3}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PieChartIcon sx={{ mr: 1, color: '#A73698' }} />
              <Typography variant="h6" fontWeight="bold">
                Tipos de Equipo
              </Typography>
            </Box>

            <Box sx={{ height: 250, width: '100%' }}> 
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deviceTypeData}
                    dataKey="value" nameKey="name"
                    cx="50%" cy="50%"
                    outerRadius={70}
                    label={(entry) => `${entry.value}`} 
                  >
                    {deviceTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_TYPES[index % COLORS_TYPES.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} equipos`, name]} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        
      </Grid>
    </Box>
  );
};

export default Home;