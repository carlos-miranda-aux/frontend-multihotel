// src/pages/Home.jsx
import React, { useEffect, useState, useContext } from "react";
import { Grid, Paper, Typography, Box, CircularProgress, Alert, Card, CardContent, Chip } from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

// Iconos
import ComputerIcon from '@mui/icons-material/Computer';
import SecurityIcon from '@mui/icons-material/Security';
import GppBadIcon from '@mui/icons-material/GppBad';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';

// Componente de Tarjeta KPI
const KpiCard = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ height: '100%', borderLeft: `5px solid`, borderColor: `${color}.main`, boxShadow: 2 }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary" fontWeight="bold">{title}</Typography>
          <Typography variant="h4" fontWeight="bold" sx={{ my: 1 }}>{value}</Typography>
          {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
        </Box>
        <Box sx={{ p: 1, borderRadius: 2, bgcolor: `${color}.50`, color: `${color}.main` }}>
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Home = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // La API ya usa req.user internamente para filtrar por hotel
        const res = await api.get("/devices/get/dashboard-stats"); 
        setStats(res.data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las estadísticas.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ p: 3 }}><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          Bienvenido, {user?.nombre || "Usuario"}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Panel de Control - {user?.hotelId ? "Vista Local" : "Vista Global Corporativa"}
        </Typography>
      </Box>

      {/* KPI CARDS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard 
            title="Total Activos" 
            value={stats?.kpis?.totalActiveDevices || 0} 
            icon={<ComputerIcon fontSize="large" />} 
            color="primary"
            subtitle="Equipos en inventario"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard 
            title="Protegidos (Panda)" 
            value={stats?.kpis?.devicesWithPanda || 0} 
            icon={<SecurityIcon fontSize="large" />} 
            color="success"
            subtitle={`${stats?.kpis?.devicesWithoutPanda || 0} sin protección`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard 
            title="Garantías Vencidas" 
            value={stats?.warrantyStats?.expired || 0} 
            icon={<GppBadIcon fontSize="large" />} 
            color="error"
            subtitle={`${stats?.warrantyStats?.risk || 0} por vencer pronto`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard 
            title="Bajas del Mes" 
            value={stats?.kpis?.monthlyDisposals || 0} 
            icon={<DeleteIcon fontSize="large" />} 
            color="warning"
            subtitle="Equipos desincorporados"
          />
        </Grid>
      </Grid>

      {/* ALERTA DE GARANTÍAS */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <WarningIcon color="warning" />
                <Typography variant="h6" fontWeight="bold">Alertas de Garantía (Próximos 90 días)</Typography>
            </Box>
            {stats?.warrantyAlertsList?.length > 0 ? (
                <Box>
                    {stats.warrantyAlertsList.map(item => (
                        <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, pb: 1.5, borderBottom: '1px solid #eee' }}>
                            <Box>
                                <Typography variant="body2" fontWeight="bold">{item.nombre_equipo}</Typography>
                                <Typography variant="caption" color="text.secondary">{item.etiqueta}</Typography>
                            </Box>
                            <Chip 
                                label={new Date(item.garantia_fin).toLocaleDateString()} 
                                size="small" 
                                color={new Date(item.garantia_fin) < new Date() ? "error" : "warning"} 
                                variant="outlined"
                            />
                        </Box>
                    ))}
                </Box>
            ) : (
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                    No hay garantías próximas a vencer.
                </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Espacio para otra gráfica o tabla en el futuro */}
        <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'primary.50' }}>
                <Typography variant="body1" color="primary.main" fontWeight="bold">
                    Más reportes en la sección "Reportes"
                </Typography>
            </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;