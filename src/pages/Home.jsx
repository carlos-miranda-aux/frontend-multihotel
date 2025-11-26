// src/pages/Home.jsx
import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  useTheme
} from "@mui/material";
// Iconos
import DevicesIcon from "@mui/icons-material/Devices";
import BuildIcon from "@mui/icons-material/Build";
import EventBusyIcon from '@mui/icons-material/EventBusy';
import PeopleIcon from '@mui/icons-material/People';
import WarningIcon from "@mui/icons-material/Warning";
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'; 
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'; // 👈 NUEVO ICONO

import { useNavigate } from "react-router-dom";
import api from "../api/axios"; 
import { AlertContext } from "../context/AlertContext";
import "../pages/styles/Home.css"; 

// Gráficos Recharts
import { 
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer
} from 'recharts';

/**
 * Componente de Tarjeta KPI (Indicadores Superiores)
 */
const WidgetCard = ({ title, value, icon, color, onClick, subtitle }) => {
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
            {React.cloneElement(icon, { sx: { fontSize: 50 } })} 
          </Box>
      </Box>
      <Box>
        <Typography color="textSecondary" variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.9rem', lineHeight: 1.2 }}>
            {title}
        </Typography>
        {subtitle && (
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                {subtitle}
            </Typography>
        )}
      </Box>
    </Paper>
  );
};

const Home = () => {
  const {
    loading: alertLoading, 
    warrantyAlertsList,
    pendingMaintenancesList,
    devices, 
    pandaStatus // 👈 Se usa para el conteo total
  } = useContext(AlertContext);

  const [stats, setStats] = useState({
    totalDevices: 0,
    totalUsers: 0,
    pendingTasksCount: 0,
    monthlyDisposalsCount: 0,
    warrantyAlertsCount: 0, 
    devicesWithPanda: 0, 
    devicesWithoutPanda: 0 
  });
  
  // Datos para Gráfico
  const [warrantyData, setWarrantyData] = useState([]); 
  const [pandaData, setPandaData] = useState([]); 
  const [currentMonthName, setCurrentMonthName] = useState("");
  const [pageLoading, setPageLoading] = useState(true); 
  
  const navigate = useNavigate();
  const theme = useTheme();

  // Colores Semáforo para Garantías
  const COLORS_WARRANTY = { 
    Vigentes: theme.palette.success.main, 
    Riesgo: theme.palette.warning.main    
  };
  // Colores para Panda
  const COLORS_PANDA = { 
    ConPanda: theme.palette.success.main, 
    SinPanda: theme.palette.error.main
  };

  useEffect(() => {
    if (!alertLoading) {
      const fetchSimpleData = async () => {
        try {
          setPageLoading(true); 
          
          const now = new Date();
          setCurrentMonthName(now.toLocaleString('es-MX', { month: 'long' }));
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();

          // 1. Consultas API (disposals)
          const [usersRes, disposalsRes] = await Promise.all([
            api.get("/users/get?page=1&limit=1"),
            api.get("/disposals/get?page=1&limit=2000")
          ]);
          
          const totalUsersCount = usersRes.data.totalCount || 0;
          const allDisposals = disposalsRes.data.data || [];

          // A. Bajas del Mes
          let monthlyDisposals = 0;
          allDisposals.forEach(d => {
            if (d.fecha_baja) {
                const dDate = new Date(d.fecha_baja);
                if (dDate.getMonth() === currentMonth && dDate.getFullYear() === currentYear) {
                    monthlyDisposals++;
                }
            }
          });

          // B. Garantías
          const today = new Date(); today.setHours(0,0,0,0);
          const ninetyDays = new Date(); ninetyDays.setDate(today.getDate() + 90);
          
          let safeCount = 0; 
          let riskCount = 0;

          devices.forEach((d) => {
            if (d.garantia_fin) {
              const exp = new Date(d.garantia_fin);
              if (exp >= today && exp <= ninetyDays) riskCount++;
              else if (exp > today) safeCount++;
            } else {
                safeCount++;
            }
          });
          
          setWarrantyData([
            { name: 'Vigentes', value: safeCount }, 
            { name: 'Riesgo (90d)', value: riskCount }
          ]);
          
          // C. Configurar datos de Panda para el gráfico (Usa pandaStatus del contexto)
          setPandaData([
            { name: 'Con Panda', value: pandaStatus.devicesWithPanda },
            { name: 'Sin Panda', value: pandaStatus.devicesWithoutPanda }
          ]);


          // D. Actualizar Stats
          setStats({
            // 👇 CORRECCIÓN CLAVE: Usar el totalActiveDevices de pandaStatus
            totalDevices: pandaStatus.totalActiveDevices, 
            totalUsers: totalUsersCount,
            pendingTasksCount: pendingMaintenancesList.length,
            monthlyDisposalsCount: monthlyDisposals,
            warrantyAlertsCount: warrantyAlertsList.length,
            devicesWithPanda: pandaStatus.devicesWithPanda, 
            devicesWithoutPanda: pandaStatus.devicesWithoutPanda 
          });

          setPageLoading(false);
        } catch (error) {
           console.error("Error dashboard:", error);
           setPageLoading(false);
        }
      };
      // Se añade pandaStatus a las dependencias
      fetchSimpleData();
    }
  }, [alertLoading, devices, pendingMaintenancesList, warrantyAlertsList, pandaStatus]); 

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (alertLoading || pageLoading) {
    return <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress /></Box>;
  }
  
  // Determinar el color del widget de Panda (Rojo si hay faltantes, Verde si está al 100%)
  const pandaColor = stats.devicesWithoutPanda > 0 ? theme.palette.error.main : theme.palette.success.main;


  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>Panel de Control</Typography>
      <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 4 }}>
        Resumen administrativo del inventario.
      </Typography>
      
      {/* ================= FILA 1: KPIs (4 Tarjetas) ================= */}
      <Grid container spacing={3} sx={{ mb: 3 }}> 
        <Grid item xs={12} sm={6} md={3}> 
          <WidgetCard 
            title="Equipos Activos" 
            value={stats.totalDevices} // ✅ Muestra el conteo total
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
            title={`Bajas en ${currentMonthName}`} 
            value={stats.monthlyDisposalsCount} 
            icon={<DeleteSweepIcon />} 
            color={theme.palette.error.main} 
            onClick={() => navigate("/disposals")}
            subtitle="Equipos dados de baja este mes"
          />
        </Grid>
      </Grid>

      {/* ================= FILA 2: GESTIÓN, PANDA Y RIESGO ================= */}
      <Grid container spacing={3}>
        
        {/* LISTA: Tareas Pendientes (Prioridad 1) */}
        <Grid item xs={12} md={4}> 
          <Paper sx={{ p: 3, height: '100%', minHeight: 350 }} elevation={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <EventBusyIcon sx={{ mr: 1, color: theme.palette.warning.main }} />
                    <Typography variant="h6" fontWeight="bold">Mantenimientos Pendientes</Typography>
                </Box>
                <Button size="small" onClick={() => navigate("/maintenances")}>Ver todo ({stats.pendingTasksCount})</Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {pendingMaintenancesList.length > 0 ? (
              <List dense disablePadding>
                {pendingMaintenancesList.slice(0, 5).map((m) => (
                  <ListItemButton key={`m-${m.id}`} divider onClick={() => navigate(`/maintenances/edit/${m.id}`)} alignItems="flex-start">
                    <ListItemText
                      primary={<strong>{m.device?.nombre_equipo || 'Equipo Desconocido'}</strong>}
                      secondary={`${m.descripcion} — ${formatDate(m.fecha_programada)}`}
                    />
                  </ListItemButton>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="textSecondary">¡Todo al día! No hay tareas pendientes.</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* GRÁFICO: ESTATUS DE PANDA (NUEVO WIDGET) */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper 
            sx={{ 
              p: 3, 
              height: '100%', 
              minHeight: 350, 
              // Borde Rojo si hay faltantes
              border: 1, 
              borderColor: pandaColor
            }} 
            elevation={3}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: pandaColor }}>
              <VerifiedUserIcon sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">
                Estado de Panda
              </Typography>
            </Box>
            
            <Box sx={{ height: 200, width: '100%', position: 'relative' }}> 
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pandaData}
                    dataKey="value" nameKey="name"
                    cx="50%" cy="50%"
                    outerRadius={60} 
                    innerRadius={40} 
                  >
                    {pandaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_PANDA[entry.name.split(' ')[0] === 'Con' ? 'ConPanda' : 'SinPanda']} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Texto central que muestra la carencia */}
              <Box sx={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <Typography variant="h5" fontWeight="bold" 
                  sx={{ 
                    color: pandaColor, 
                    lineHeight: 1.1
                  }}>
                  {stats.devicesWithoutPanda}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                  SIN PANDA
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                {/* 👇 MODIFICACIÓN: Navegar a /inventory con filtro no-panda */}
                <Button 
                    size="small" 
                    onClick={() => navigate("/inventory?filter=no-panda")} 
                >
                    Ver Equipos ({stats.devicesWithoutPanda})
                </Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* GRÁFICO: Garantías */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper 
            sx={{ 
              p: 3, 
              height: '100%', 
              minHeight: 350, 
              // Borde rojo si hay alertas, transparente si no
              border: 1, 
              borderColor: stats.warrantyAlertsCount > 0 ? 'error.main' : 'transparent' 
            }} 
            elevation={3}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: stats.warrantyAlertsCount > 0 ? 'error.main' : 'text.primary' }}>
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
                    outerRadius={60} 
                    innerRadius={40} 
                  >
                    {warrantyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_WARRANTY[entry.name.split(' ')[0]] || theme.palette.grey[400]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Número Central Absoluto */}
              <Box sx={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <Typography variant="h4" fontWeight="bold" 
                  sx={{ 
                    color: stats.warrantyAlertsCount > 0 ? theme.palette.error.main : theme.palette.success.main, 
                    lineHeight: 1.1
                  }}>
                  {stats.warrantyAlertsCount}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
                  EN RIESGO
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                {/* 👇 MODIFICACIÓN: Navegar a /inventory con filtro warranty-risk */}
                <Button 
                    size="small" 
                    onClick={() => navigate("/inventory?filter=warranty-risk")} 
                >
                    Ver Inventario ({stats.warrantyAlertsCount})
                </Button>
            </Box>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
};

export default Home;