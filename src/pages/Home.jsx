// src/pages/Home.jsx
import React, { useContext, useEffect, useState } from "react";
import {
  Box, Grid, Paper, Typography, CircularProgress, List, ListItemButton,
  ListItemText, Divider, Button, useTheme
} from "@mui/material";

// Iconos
import DevicesIcon from "@mui/icons-material/Devices";
import BuildIcon from "@mui/icons-material/Build";
import EventBusyIcon from '@mui/icons-material/EventBusy';
import PeopleIcon from "@mui/icons-material/People";
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'; 
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import AssessmentIcon from '@mui/icons-material/Assessment'; 
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import { useNavigate } from "react-router-dom";
import api from "../api/axios"; 
import { AlertContext } from "../context/AlertContext";

// Gráficos
import { 
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';

const WidgetCard = ({ title, value, icon, color, onClick, subtitle }) => {
  const theme = useTheme();
  return (
    <Paper onClick={onClick} elevation={2}
      sx={{
        p: 3, minHeight: 150, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        transition: 'all 0.2s ease', cursor: onClick ? 'pointer' : 'default',
        borderLeft: `4px solid ${color}`, backgroundColor: 'background.paper',
        '&:hover': onClick ? { transform: 'translateY(-4px)', boxShadow: theme.shadows[6] } : {}
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h3" fontWeight="bold" color="text.primary" sx={{ lineHeight: 1.2 }}>{value}</Typography>
          <Box sx={{ color: color, opacity: 0.8 }}>{React.cloneElement(icon, { sx: { fontSize: 40 } })}</Box>
      </Box>
      <Box>
        <Typography variant="subtitle2" fontWeight="600" color="text.secondary">{title}</Typography>
        {subtitle && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>{subtitle}</Typography>}
      </Box>
    </Paper>
  );
};

const Home = () => {
  const { 
    loading: alertLoading, 
    dashboardStats, // <--- DATOS PRE-CALCULADOS
    pendingMaintenancesList, 
    totalPendingMaintenancesCount 
  } = useContext(AlertContext);

  const [totalUsers, setTotalUsers] = useState(0);
  const [currentMonthName, setCurrentMonthName] = useState("");
  
  const navigate = useNavigate();
  const theme = useTheme();

  // Colores
  const COLORS = { Vigentes: theme.palette.success.main, Riesgo: theme.palette.warning.main, Expiradas: theme.palette.error.dark };
  const COLORS_PANDA = { ConPanda: theme.palette.success.main, SinPanda: theme.palette.error.main };

  useEffect(() => {
    const now = new Date();
    setCurrentMonthName(now.toLocaleString('es-MX', { month: 'long' }));
    
    // Obtenemos solo el conteo de usuarios (rápido)
    const fetchUsers = async () => {
        try {
            const res = await api.get("/users/get?page=1&limit=1");
            setTotalUsers(res.data.totalCount || 0);
        } catch (e) { console.error(e); }
    };
    fetchUsers();
  }, []);

  if (alertLoading) {
    return <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress /></Box>;
  }

  // Desestructuración segura de los datos del backend
  const { kpis, warrantyStats } = dashboardStats || {};
  
  // Datos para Gráfico de Barras (Garantías)
  const warrantyBarData = [{
    name: 'Total Equipos',
    Vigentes: warrantyStats?.safe || 0,
    Riesgo: warrantyStats?.risk || 0,
    Expiradas: warrantyStats?.expired || 0
  }];

  // Datos para Gráfico de Pastel (Panda)
  const pandaData = [
    { name: 'Con Panda', value: kpis?.devicesWithPanda || 0 },
    { name: 'Sin Panda', value: kpis?.devicesWithoutPanda || 0 }
  ];

  const pandaColor = (kpis?.devicesWithoutPanda > 0) ? theme.palette.error.main : theme.palette.success.main;
  const warrantyBorderColor = (warrantyStats?.expired > 0 || warrantyStats?.risk > 0) ? COLORS.Riesgo : theme.palette.divider;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">Panel de Control</Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>Resumen administrativo del inventario.</Typography>
      
      {/* TARJETAS KPI */}
      <Grid container spacing={3} sx={{ mb: 3 }}> 
        <Grid item xs={12} sm={6} md={3}> 
          <WidgetCard title="Equipos Activos" value={kpis?.totalActiveDevices || 0} icon={<DevicesIcon />} color={theme.palette.primary.main} onClick={() => navigate("/inventory")} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}> 
          <WidgetCard title="Usuarios Gestionados" value={totalUsers} icon={<PeopleIcon />} color={theme.palette.secondary.main} onClick={() => navigate("/users")} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}> 
          <WidgetCard title="Tareas Pendientes" value={totalPendingMaintenancesCount} icon={<BuildIcon />} color={totalPendingMaintenancesCount > 0 ? theme.palette.warning.main : theme.palette.success.main} onClick={() => navigate("/maintenances")} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}> 
          <WidgetCard title={`Bajas en ${currentMonthName}`} value={kpis?.monthlyDisposals || 0} icon={<DeleteSweepIcon />} color={theme.palette.error.main} onClick={() => navigate("/disposals")} />
        </Grid>
      </Grid>
      
      {/* SECCIÓN INFERIOR */}
      <Grid container spacing={3}>
        
        {/* LISTA: Tareas Críticas */}
        <Grid item xs={12} md={4}> 
          <Paper sx={{ p: 3, height: '100%', minHeight: 350 }} elevation={2}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EventBusyIcon sx={{ mr: 1, color: 'warning.main' }} />
                    <Typography variant="h6" fontWeight="bold">Actividades próximas</Typography> 
                </Box>
                <Button size="small" onClick={() => navigate("/maintenances")}>Ver todo</Button> 
            </Box>
            <Divider sx={{ mb: 2 }} />
            {pendingMaintenancesList.length > 0 ? (
              <List dense disablePadding>
                {pendingMaintenancesList.slice(0, 5).map((m) => ( 
                  <ListItemButton key={`m-${m.id}`} divider onClick={() => navigate(`/maintenances/edit/${m.id}`)}>
                    <ListItemText 
                        primary={<Typography variant="body2" fontWeight="bold">{m.device?.nombre_equipo || 'Desconocido'}</Typography>} 
                        secondary={`${m.descripcion} — ${new Date(m.fecha_programada).toLocaleDateString()}`} 
                    />
                  </ListItemButton>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}><Typography color="text.secondary">¡Todo al día! No hay tareas críticas.</Typography></Box>
            )}
          </Paper>
        </Grid>
        
        {/* GRÁFICO 1: ESTATUS DE PANDA */}
        <Grid item xs={12} sm={6} md={2}> 
          <Paper sx={{ p: 3, height: '100%', minHeight: 350, border: 1, borderColor: pandaColor }} elevation={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: pandaColor }}>
              <VerifiedUserIcon sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">Estado de Panda</Typography>
            </Box>
            <Box sx={{ height: 200, width: '100%', position: 'relative' }}> 
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pandaData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} innerRadius={40}>
                    {pandaData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS_PANDA[entry.name.split(' ')[0] === 'Con' ? 'ConPanda' : 'SinPanda']} />))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <Typography variant="h5" fontWeight="bold" sx={{ color: pandaColor, lineHeight: 1 }}>{kpis?.devicesWithoutPanda || 0}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>SIN PANDA</Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'center' }}><Button size="small" onClick={() => navigate("/inventory?filter=no-panda")}>Ver Equipos</Button></Box>
          </Paper>
        </Grid>
        
        {/* GRÁFICO 2: Estado General de Garantía */}
        <Grid item xs={12} sm={6} md={6}> 
          <Paper sx={{ p: 3, height: '100%', minHeight: 350, border: 1, borderColor: warrantyBorderColor }} elevation={2}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.primary' }}>
              <AssessmentIcon sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">Estado de Garantía</Typography>
            </Box>
            <Box sx={{ height: 200, width: '100%', position: 'relative', pt: 2 }}> 
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={warrantyBarData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" hide /> 
                  <YAxis type="number" allowDecimals={false} />
                  <Tooltip formatter={(value, name) => [value, name]} wrapperStyle={{ fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Expiradas" name="Expiradas" fill={COLORS.Expiradas} />
                  <Bar dataKey="Riesgo" name="En Riesgo" fill={COLORS.Riesgo} />
                  <Bar dataKey="Vigentes" name="Vigentes" fill={COLORS.Vigentes} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, px: 2 }}>
                <Button size="small" variant="outlined" startIcon={<CheckCircleIcon />} color="success" onClick={() => navigate("/inventory?filter=safe-warranty")}>Ver Vigentes</Button>
                <Button size="small" variant="outlined" startIcon={<AccessTimeIcon />} color="warning" onClick={() => navigate("/inventory?filter=warranty-risk")}>Ver En Riesgo</Button>
                <Button size="small" variant="outlined" startIcon={<CancelIcon />} color="error" onClick={() => navigate("/inventory?filter=expired-warranty")}>Ver Expiradas</Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;