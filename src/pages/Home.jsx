import React, { useEffect, useState, useContext } from "react";
import { 
  Grid, Paper, Typography, Box, Alert, Card, CardContent, 
  CardActionArea, Chip, Button, useTheme, alpha, Divider, Stack, Skeleton 
} from "@mui/material";
import { 
  Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, 
  TimelineDot 
} from "@mui/lab";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { AuthContext } from "../context/AuthContext";
import { AlertContext } from "../context/AlertContext";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

// Iconos
import ComputerIcon from '@mui/icons-material/Computer';
import SecurityIcon from '@mui/icons-material/Security';
import GppBadIcon from '@mui/icons-material/GppBad';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';
import BuildIcon from '@mui/icons-material/Build';
import EventIcon from '@mui/icons-material/Event';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PieChartIcon from '@mui/icons-material/PieChart';
import CircleIcon from '@mui/icons-material/Circle';

// --- SKELETON COMPONENTS ---
const KPISkeleton = () => (
    <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 'none', border: '1px solid rgba(0,0,0,0.08)' }}>
        <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box>
                    <Skeleton variant="text" width={80} height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" width={60} height={40} />
                    <Skeleton variant="text" width={100} height={15} />
                </Box>
                <Skeleton variant="rounded" width={40} height={40} sx={{ borderRadius: 2 }} />
            </Box>
        </CardContent>
    </Card>
);

const KpiCard = ({ title, value, icon, color, subtitle, onClick }) => (
  <Card sx={{ height: '100%', borderLeft: `5px solid`, borderColor: `${color}.main`, boxShadow: 2, borderRadius: 3 }}>
    <CardActionArea onClick={onClick} sx={{ height: '100%' }}> 
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>{title}</Typography>
            <Typography variant="h3" fontWeight={800} sx={{ my: 1, color: 'text.primary' }}>{value}</Typography>
            {subtitle && <Typography variant="caption" fontWeight={500} color="text.secondary">{subtitle}</Typography>}
          </Box>
          <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: `${color}.50`, color: `${color}.main`, display: 'flex' }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </CardActionArea>
  </Card>
);

const WarrantyChartWidget = ({ stats, loading }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  if (loading) {
      return (
          <Box sx={{ p: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'center' }}>
              <Skeleton variant="circular" width={200} height={200} />
              <Box sx={{ width: '100%' }}>
                  <Skeleton variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 2 }} />
                  <Skeleton variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 2 }} />
                  <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
              </Box>
          </Box>
      );
  }

  const total = (stats?.safe || 0) + (stats?.risk || 0) + (stats?.expired || 0);
  const data = [
    { name: 'Vigentes', value: stats?.safe || 0, color: theme.palette.success.main, filter: 'safe-warranty' },
    { name: 'En Riesgo', value: stats?.risk || 0, color: theme.palette.warning.main, filter: 'warranty-risk' },
    { name: 'Vencidas', value: stats?.expired ||  0, color: theme.palette.error.main, filter: 'expired-warranty' },
  ].filter(item => item.value > 0);

  const handleClick = (filter) => { if (filter) navigate(`/inventory?filter=${filter}`); };

  if (total === 0) return <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography>No hay datos de garantías disponibles.</Typography></Box>;

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: { md: 380 }, alignItems: 'center', justifyContent: 'center', px: 2, gap: 4 }}>
        <Box sx={{ width: 280, height: 280, position: 'relative', flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={data} cx="50%" cy="50%" innerRadius={80} outerRadius={110} cornerRadius={8} paddingAngle={5} dataKey="value" onClick={(data) => handleClick(data.payload.filter)} cursor="pointer" stroke="none">
                        {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} itemStyle={{ fontWeight: 'bold' }} formatter={(value) => [`${value} Equipos`, 'Cantidad']} />
                </PieChart>
            </ResponsiveContainer>
            <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <Typography variant="h3" fontWeight={800} color="text.primary">{total}</Typography>
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>TOTAL</Typography>
            </Box>
        </Box>
        <Box sx={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Stack spacing={2}>
                {data.map((item) => (
                    <CardActionArea key={item.name} onClick={() => handleClick(item.filter)} sx={{ borderRadius: 3, p: 2, backgroundColor: alpha(item.color, 0.04), border: `1px solid ${alpha(item.color, 0.15)}`, transition: 'all 0.2s ease', '&:hover': { transform: 'translateX(5px)', backgroundColor: alpha(item.color, 0.1), boxShadow: `0 4px 12px ${alpha(item.color, 0.15)}` } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}><CircleIcon sx={{ color: item.color, fontSize: 14, mr: 1.5 }} /><Typography variant="subtitle1" fontWeight={700} color="text.secondary">{item.name}</Typography></Box>
                            <Typography variant="h5" fontWeight={800} sx={{ color: item.color }}>{item.value}</Typography>
                        </Box>
                        <Box sx={{ mt: 1, height: 8, width: '100%', bgcolor: alpha(item.color, 0.2), borderRadius: '4px', overflow: 'hidden' }}><Box sx={{ height: '100%', width: `${(item.value / total) * 100}%`, bgcolor: item.color, borderRadius: '4px' }} /></Box>
                    </CardActionArea>
                ))}
            </Stack>
        </Box>
    </Box>
  );
};

const MaintenanceTimelineWidget = ({ maintenances, onViewAll, loading }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  if (loading) {
      return (
          <Box sx={{ p: 3 }}>
              {[1, 2, 3].map(i => (
                  <Box key={i} sx={{ display: 'flex', gap: 2, mb: 3 }}>
                      <Skeleton variant="circular" width={30} height={30} />
                      <Box sx={{ width: '100%' }}>
                          <Skeleton variant="text" width="40%" height={20} />
                          <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2, mt: 1 }} />
                      </Box>
                  </Box>
              ))}
          </Box>
      );
  }

  if (!maintenances || maintenances.length === 0) return <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary', minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography variant="body1">No hay actividades próximas.</Typography></Box>;
  
  const displayList = [...maintenances].sort((a, b) => new Date(a.fecha_programada) - new Date(b.fecha_programada)).slice(0, 5);

  return (
    <Box sx={{ p: 3, pt: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Timeline position="right" sx={{ p: 0, m: 0, flexGrow: 1, '& .MuiTimelineItem-root:before': { flex: 0, padding: 0 } }}>
        {displayList.map((manto, index) => {
           const scheduledDate = new Date(manto.fecha_programada);
           const today = new Date(); today.setHours(0,0,0,0);
           const isOverdue = scheduledDate < today;
           const isCorrective = manto.tipo_mantenimiento === 'Correctivo';
           const color = isCorrective ? 'error' : 'info';

           return (
            <TimelineItem key={manto.id}>
                <TimelineSeparator>
                    <TimelineDot color={color} variant={isOverdue ? 'outlined' : 'filled'} sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}><BuildIcon fontSize="small" /></TimelineDot>
                    {index < displayList.length - 1 && <TimelineConnector sx={{ bgcolor: isOverdue ? theme.palette.error.light : theme.palette.grey[200], borderStyle: isOverdue ? 'dashed' : 'solid' }} />}
                </TimelineSeparator>
                <TimelineContent sx={{ py: '12px', px: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="caption" fontWeight={700} color={isOverdue ? 'error.main' : 'text.secondary'} sx={{ textTransform: 'uppercase' }}>
                                {scheduledDate.toLocaleDateString([], { day: '2-digit', month: 'short' })} • {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                            {isOverdue && <Chip label="Atrasado" size="small" color="error" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 'bold' }} />}
                        </Box>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: alpha(theme.palette[color].main, 0.04), border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`, borderRadius: 3, cursor: 'pointer', transition: '0.2s', '&:hover': { bgcolor: alpha(theme.palette[color].main, 0.08), borderColor: theme.palette[color].main, transform: 'translateX(4px)' } }} onClick={() => navigate(`/maintenances/edit/${manto.id}`)}>
                            <Typography variant="subtitle1" fontWeight={700} color="text.primary">{manto.device?.nombre_equipo || 'Equipo'}</Typography>
                            <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 280 }}>{manto.descripcion}</Typography>
                        </Paper>
                    </Box>
                </TimelineContent>
            </TimelineItem>
           );
        })}
      </Timeline>
      <Box sx={{ mt: 2, textAlign: 'center' }}><Button variant="outlined" size="small" endIcon={<ArrowForwardIcon fontSize="small" />} onClick={onViewAll} sx={{ borderRadius: 5, textTransform: 'none', fontWeight: 600, px: 3 }}>Ver calendario completo</Button></Box>
    </Box>
  );
};

const Home = () => {
  const { user, selectedHotelId } = useContext(AuthContext);
  const { pendingMaintenancesList, loading: loadingAlerts } = useContext(AlertContext);
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const statsRes = await api.get("/devices/get/dashboard-stats"); 
        setStats(statsRes.data);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los datos.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [selectedHotelId]);

  // Si hay error mostramos alerta, pero si está cargando mostramos el layout con Skeletons
  if (error) return <Box sx={{ p: 3 }}><Alert severity="error">{error}</Alert></Box>;

  return (
    <Box sx={{ p: 3, maxWidth: 1600, margin: '0 auto' }}>
      <Box sx={{ mb: 5 }}>
        <Typography variant="h4" fontWeight={800} color="text.primary" sx={{ letterSpacing: -0.5 }}>Panel de Control</Typography>
      </Box>

      {/* --- SECCIÓN 1: TARJETAS KPI --- */}
      <Grid container spacing={2.5} sx={{ mb: 5 }}>
        {loading ? (
            // Skeletons para KPIs
            Array.from(new Array(5)).map((_, i) => (
                <Grid item xs={12} sm={6} md={2.4} key={i}><KPISkeleton /></Grid>
            ))
        ) : (
            <>
                <Grid item xs={12} sm={6} md={2.4}><KpiCard title="Equipos" value={stats?.kpis?.totalActiveDevices || 0} icon={<ComputerIcon />} color="primary" subtitle="En inventario" onClick={() => navigate('/inventory')} /></Grid>
                <Grid item xs={12} sm={6} md={2.4}><KpiCard title="Usuarios" value={stats?.kpis?.totalStaff || 0} icon={<PeopleIcon />} color="info" subtitle="Totales" onClick={() => navigate('/users')} /></Grid>
                <Grid item xs={12} sm={6} md={2.4}><KpiCard title="Protegidos" value={stats?.kpis?.devicesWithPanda || 0} icon={<SecurityIcon />} color="success" subtitle="Equipos sin Panda" onClick={() => navigate('/inventory?filter=no-panda')} /></Grid>
                <Grid item xs={12} sm={6} md={2.4}><KpiCard title="Bajas Mes" value={stats?.kpis?.monthlyDisposals || 0} icon={<DeleteIcon />} color="warning" subtitle="Equipos retirados" onClick={() => navigate('/disposals')} /></Grid>
            </>
        )}
      </Grid>

      {/* --- SECCIÓN 2: WIDGETS --- */}
      <Grid container spacing={3} sx={{ alignItems: 'flex-start' }}>
        <Grid item xs={12} md={8}>
            <Paper sx={{ height: 'auto', borderRadius: 4, overflow: 'hidden', boxShadow: theme.shadows[3], display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 3, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box><Typography variant="h5" fontWeight={800}>Estado de Garantías</Typography><Typography variant="caption" color="text.secondary" fontWeight={500}>Resumen de pólizas de equipos</Typography></Box>
                    <PieChartIcon color="action" />
                </Box>
                <Divider sx={{ mx: 3, opacity: 0.6 }} />
                <Box sx={{ flexGrow: 1 }}>
                    <WarrantyChartWidget stats={stats?.warrantyStats} loading={loading} />
                </Box>
            </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
            <Paper sx={{ height: 'auto', minHeight: 400, borderRadius: 4, overflow: 'hidden', boxShadow: theme.shadows[3], display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 3, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'primary.50' }}>
                     <Box><Typography variant="h6" fontWeight={800} color="primary.main">Agenda Próxima</Typography><Typography variant="caption" color="text.secondary" fontWeight={500}>Mantenimientos programados</Typography></Box>
                     {!loadingAlerts && <Chip icon={<EventIcon sx={{ '&&': { color: theme.palette.primary.main } }} />} label={`${pendingMaintenancesList.length}`} sx={{ fontWeight: 800, bgcolor: '#fff', color: theme.palette.primary.main }} />}
                </Box>
                 <Divider sx={{ mx: 0, opacity: 1, borderColor: 'primary.100' }} />
                <Box sx={{ flexGrow: 1 }}>
                    <MaintenanceTimelineWidget maintenances={pendingMaintenancesList} onViewAll={() => navigate('/maintenances')} loading={loadingAlerts} />
                </Box>
            </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Home;