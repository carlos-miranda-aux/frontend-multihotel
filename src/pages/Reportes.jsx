import React, { useState, useContext } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Alert, useTheme, Card,
  CardActionArea, CardContent, Avatar, Chip, CircularProgress
} from '@mui/material';

import InventoryIcon from '@mui/icons-material/Inventory';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BuildIcon from '@mui/icons-material/Build';
import GroupIcon from '@mui/icons-material/Group';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DownloadIcon from '@mui/icons-material/Download';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

import { AuthContext } from "../context/AuthContext";
import { ROLES } from "../config/constants";

const Reportes = () => {
  const theme = useTheme();
  const { user, selectedHotelId } = useContext(AuthContext); 
  const isRoot = user?.rol === ROLES.ROOT;
  const apiBaseUrl = import.meta.env.VITE_API_URL; 
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportError, setReportError] = useState('');
  
  // Estado para controlar cuál reporte se está descargando
  const [downloadingReport, setDownloadingReport] = useState(null);

  const handleExport = (reportName, url, isFiltered = false, isOptionalFilter = false) => {
    setReportError('');
    setDownloadingReport(reportName); // Activar loading

    let finalUrl = url;
    
    // Lógica de filtrado
    if (isFiltered) {
        // Si es filtrado pero NO es opcional, y las fechas están vacías, lanzamos error
        if (!isOptionalFilter && (!startDate || !endDate)) {
            setReportError("Para este reporte es obligatorio seleccionar un rango de fechas.");
            setDownloadingReport(null);
            return;
        }

        // Si hay fechas seleccionadas, las agregamos (aplica tanto para obligatorio como opcional)
        if (startDate && endDate) {
            finalUrl += `?startDate=${startDate}&endDate=${endDate}`;
        }
        // Si es opcional y NO hay fechas, no agregamos nada y el backend devolverá todo el historial
    }
    
    const token = localStorage.getItem("token");
    const headers = { 'Authorization': `Bearer ${token}` };
    if (selectedHotelId) headers['x-hotel-id'] = selectedHotelId;

    fetch(finalUrl, { method: 'GET', headers })
    .then(res => {
        if (!res.ok) return res.json().then(e => { throw new Error(e.error || "Error desconocido."); }).catch(() => { throw new Error(`Error ${res.status}`); });
        return res.blob();
    })
    .then(blob => {
      const href = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      // Ajustar nombre si se usaron filtros
      const hasDates = startDate && endDate;
      let fileName = url.substring(url.lastIndexOf('/') + 1) + (hasDates ? `_${startDate}_${endDate}` : "") + ".xlsx";
      
      link.setAttribute('download', fileName); 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(href);
    })
    .catch(err => setReportError(err.message || "Error al descargar el reporte."))
    .finally(() => setDownloadingReport(null)); // Desactivar loading
  };

  const reportList = [
    { 
      name: "Inventario Activo", 
      description: "Listado de todos los equipos en operación.", 
      url: `${apiBaseUrl}/devices/export/all`, 
      icon: <InventoryIcon fontSize="large" />, 
      color: theme.palette.primary.main, 
      isFiltered: false 
    },
    { 
      name: "Bajas de Equipos", 
      description: "Histórico de equipos dados de baja.", 
      url: `${apiBaseUrl}/devices/export/inactivos`, 
      icon: <DeleteSweepIcon fontSize="large" />, 
      color: theme.palette.error.main, 
      isFiltered: true, 
      isOptionalFilter: true
    },
    { 
      name: "Análisis de Garantías", 
      description: "Equipos con garantía vencida y sus mantenimientos.", 
      url: `${apiBaseUrl}/devices/export/corrective-analysis`, 
      icon: <AssessmentIcon fontSize="large" />, 
      color: theme.palette.warning.main, 
      isFiltered: true,
      isOptionalFilter: false
    },
    { 
      name: "Historial Mantenimientos", 
      description: "Bitácora completa de servicios.", 
      url: `${apiBaseUrl}/maintenances/export/all`, 
      icon: <BuildIcon fontSize="large" />, 
      color: theme.palette.info.main, 
      isFiltered: false 
    },
    { 
      name: "Directorio de usuarios", 
      description: "Usuarios del hotel registrados.", 
      url: `${apiBaseUrl}/users/export/all`, 
      icon: <GroupIcon fontSize="large" />, 
      color: theme.palette.success.main, 
      isFiltered: false 
    },
    ...(user?.rol === ROLES.ROOT || user?.rol === "HOTEL_ADMIN" ? [{ 
      name: "Usuarios del Sistema", 
      description: "Usuarios con acceso al sistema.", 
      url: `${apiBaseUrl}/auth/export/all`, 
      icon: <AdminPanelSettingsIcon fontSize="large" />, 
      color: theme.palette.secondary.main, 
      isFiltered: false 
    }] : []),
  ];

  return (
    <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom color="text.primary">Centro de Reportes</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" color="text.secondary">Descarga información clave en formato Excel.</Typography>
            {selectedHotelId ? <Chip icon={<FilterAltIcon />} label="Filtrado por Hotel Activo" size="small" color="primary" variant="outlined" /> : isRoot && <Chip label="Vista Global" size="small" color="secondary" />}
        </Box>
      </Box>

      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'primary.main' }}><AccessTimeIcon sx={{ mr: 1 }} /><Typography variant="h6" fontWeight="bold">Filtro por Fechas</Typography></Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Selecciona un rango de fechas para filtrar los reportes compatibles. Si lo dejas vacío en reportes opcionales, se descargará todo el historial.</Typography>
          <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}><TextField label="Fecha Inicio" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} value={startDate} onChange={(e) => setStartDate(e.target.value)} /></Grid>
              <Grid item xs={12} sm={6} md={4}><TextField label="Fecha Fin" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} /></Grid>
          </Grid>
      </Paper>

      {reportError && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setReportError('')}>{reportError}</Alert>}

      <Grid container spacing={3}>
        {reportList.map((report) => (
          <Grid item xs={12} sm={6} md={4} key={report.name}>
            <Card elevation={2} sx={{ height: '100%', borderRadius: 3, transition: '0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
              <CardActionArea 
                onClick={() => handleExport(report.name, report.url, report.isFiltered, report.isOptionalFilter)} 
                sx={{ height: '100%', p: 2 }}
                disabled={downloadingReport !== null}
              >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: report.color + '22', color: report.color, width: 64, height: 64, mb: 2 }}>{report.icon}</Avatar>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>{report.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>{report.description}</Typography>
                  
                  {downloadingReport === report.name ? (
                      <Chip label="Generando..." icon={<CircularProgress size={16} />} sx={{ bgcolor: 'action.selected', fontWeight: 'bold' }} />
                  ) : (
                      <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
                        <Chip label="Excel" size="small" icon={<DownloadIcon />} sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold' }} />
                        {report.isFiltered && !report.isOptionalFilter && <Chip label="Requiere Fechas" size="small" sx={{ bgcolor: '#fff3e0', color: '#ef6c00', fontWeight: 'bold' }} />}
                        {report.isFiltered && report.isOptionalFilter && <Chip label="Fechas Opcionales" size="small" sx={{ bgcolor: '#e3f2fd', color: '#0288d1', fontWeight: 'bold' }} />}
                      </Box>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Reportes;