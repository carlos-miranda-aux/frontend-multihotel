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
  useTheme,
  alpha
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

// ❌ ELIMINADO: import "../pages/styles/Home.css"; 

// Gráficos Recharts
import { 
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';

/**
 * Componente de Tarjeta KPI (Refactorizado con sx para reemplazar el CSS)
 */
const WidgetCard = ({ title, value, icon, color, onClick, subtitle }) => {
  const theme = useTheme();
  
  return (
    <Paper
      onClick={onClick}
      elevation={2}
      sx={{
        p: 3,
        minHeight: 150,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.2s ease',
        cursor: onClick ? 'pointer' : 'default',
        // Borde izquierdo de color, igual que antes
        borderLeft: `4px solid ${color}`,
        backgroundColor: 'background.paper',
        // Efecto hover (antes estaba en el CSS)
        '&:hover': onClick ? {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[6] // Sombra más pronunciada al flotar
        } : {}
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h3" fontWeight="bold" color="text.primary" sx={{ lineHeight: 1.2 }}>
            {value}
          </Typography>
          <Box sx={{ color: color, opacity: 0.8 }}>
            {/* Clonamos el icono para asegurarnos que tenga el tamaño correcto */}
            {React.cloneElement(icon, { sx: { fontSize: 40 } })} 
          </Box>
      </Box>
      <Box>
        <Typography variant="subtitle2" fontWeight="600" color="text.secondary">
            {title}
        </Typography>
        {subtitle && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
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
    pendingMaintenancesList, 
    totalPendingMaintenancesCount, 
    devices, 
    pandaStatus 
  } = useContext(AlertContext);

  const [stats, setStats] = useState({
    totalDevices: 0,
    totalUsers: 0,
    pendingTasksCount: 0, 
    monthlyDisposalsCount: 0,
    warrantyAlertsCount: 0, 
    devicesWithPanda: 0, 
    devicesWithoutPanda: 0,
    expiredWarrantiesCount: 0 
  });
  
  const [warrantyBarData, setWarrantyBarData] = useState([]);
  const [pandaData, setPandaData] = useState([]); 
  const [currentMonthName, setCurrentMonthName] = useState("");
  const [pageLoading, setPageLoading] = useState(true); 
  
  const navigate = useNavigate();
  const theme = useTheme();

  // Colores dinámicos del tema para los gráficos
  const COLORS = { 
    Vigentes: theme.palette.success.main, 
    Riesgo: theme.palette.warning.main,    
    Expiradas: theme.palette.error.dark
  };
  const COLORS_PANDA = { 
    ConPanda: theme.palette.success.main, 
    SinPanda: theme.palette.error.main
  };

  useEffect(() => {
    if (!alertLoading) {
      const fetchSimpleData = async () => {
        try {
          const now = new Date();
          setCurrentMonthName(now.toLocaleString('es-MX', { month: 'long' }));
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();

          const [usersRes, disposalsRes] = await Promise.all([
            api.get("/users/get?page=1&limit=1"),
            api.get("/disposals/get?page=1&limit=2000")
          ]);
          
          const totalUsersCount = usersRes.data.totalCount || 0;
          const allDisposals = disposalsRes.data.data || [];

          let monthlyDisposals = 0;
          allDisposals.forEach(d => {
            if (d.fecha_baja) {
                const dDate = new Date(d.fecha_baja);
                if (dDate.getMonth() === currentMonth && dDate.getFullYear() === currentYear) {
                    monthlyDisposals++;
                }
            }
          });

          // Lógica de garantías (Sin cambios, solo cálculo)
          const today = new Date(); today.setHours(0,0,0,0);
          const ninetyDays = new Date(); ninetyDays.setDate(today.getDate() + 90);
          
          let safeCount = 0; 
          let riskCount = 0;
          let expiredCount = 0;

          devices.forEach((d) => {
            if (d.garantia_fin) {
              const exp = new Date(d.garantia_fin);
              if (exp < today) expiredCount++;
              else if (exp >= today && exp <= ninetyDays) riskCount++;
              else safeCount++;
            } else safeCount++;
          });
          
          setWarrantyBarData([{
            name: 'Total Equipos',
            Vigentes: safeCount,
            Riesgo: riskCount,
            Expiradas: expiredCount
          }]);
          
          setPandaData([
            { name: 'Con Panda', value: pandaStatus.devicesWithPanda },
            { name: 'Sin Panda', value: pandaStatus.devicesWithoutPanda }
          ]);

          setStats({
            totalDevices: pandaStatus.totalActiveDevices, 
            totalUsers: totalUsersCount,
            pendingTasksCount: totalPendingMaintenancesCount, 
            monthlyDisposalsCount: monthlyDisposals,
            warrantyAlertsCount: riskCount, 
            devicesWithPanda: pandaStatus.devicesWithPanda, 
            devicesWithoutPanda: pandaStatus.devicesWithoutPanda,
            expiredWarrantiesCount: expiredCount 
          });

          if (pageLoading) setPageLoading(false);
        } catch (error) {
           console.error("Error dashboard:", error);
           setPageLoading(false);
        }
      };
      fetchSimpleData();
    }
  }, [alertLoading, devices, totalPendingMaintenancesCount, pendingMaintenancesList, pandaStatus, pageLoading]); 

  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : "N/A";

  if (alertLoading || pageLoading) {
    return <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><CircularProgress /></Box>;
  }
  
  const pandaColor = stats.devicesWithoutPanda > 0 ? theme.palette.error.main : theme.palette.success.main;
  const warrantyBorderColor = (stats.expiredWarrantiesCount > 0 || stats.warrantyAlertsCount > 0) ? COLORS.Riesgo : theme.palette.divider;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
        Panel de Control
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
        Resumen administrativo del inventario.
      </Typography>
      
      {/* ================= FILA 1: KPIs (4 Tarjetas) ================= */}
      <Grid container spacing={3} sx={{ mb: 3 }}> 
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
            title={`Bajas en ${currentMonthName}`} 
            value={stats.monthlyDisposalsCount} 
            icon={<DeleteSweepIcon />} 
            color={theme.palette.error.main} 
            onClick={() => navigate("/disposals")}
          />
        </Grid>
      </Grid>
      
      {/* ================= FILA 2: LISTA Y GRÁFICOS ================= */}
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
                      primary={<Typography variant="body2" fontWeight="bold" color="text.primary">{m.device?.nombre_equipo || 'Desconocido'}</Typography>}
                      secondary={`${m.descripcion} — ${formatDate(m.fecha_programada)}`}
                    />
                  </ListItemButton>
                ))}
              </List>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">¡Todo al día! No hay tareas críticas.</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* GRÁFICO 1: ESTATUS DE PANDA */}
        <Grid item xs={12} sm={6} md={2}> 
          <Paper 
            sx={{ 
              p: 3, height: '100%', minHeight: 350, 
              border: 1, borderColor: pandaColor 
            }} 
            elevation={2}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: pandaColor }}>
              <VerifiedUserIcon sx={{ mr: 1 }} />
              <Typography variant="h6" fontWeight="bold">Estado de Panda</Typography>
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
              
              <Box sx={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <Typography variant="h5" fontWeight="bold" sx={{ color: pandaColor, lineHeight: 1 }}>{stats.devicesWithoutPanda}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>SIN PANDA</Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button size="small" onClick={() => navigate("/inventory?filter=no-panda")}>Ver Equipos</Button>
            </Box>
          </Paper>
        </Grid>
        
        {/* GRÁFICO 2: Estado General de Garantía */}
        <Grid item xs={12} sm={6} md={6}> 
          <Paper 
            sx={{ 
              p: 3, height: '100%', minHeight: 350, 
              border: 1, borderColor: warrantyBorderColor 
            }} 
            elevation={2}
          >
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
                  <Tooltip 
                    formatter={(value, name) => [value, name]}
                    wrapperStyle={{ fontSize: '12px' }}
                  />
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