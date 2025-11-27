// src/pages/Reportes.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Alert,
  useTheme,
  Card,
  CardActionArea,
  CardContent,
  Avatar,
  Chip
} from '@mui/material';

// Iconos específicos para cada reporte
import InventoryIcon from '@mui/icons-material/Inventory';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BuildIcon from '@mui/icons-material/Build';
import GroupIcon from '@mui/icons-material/Group';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import DownloadIcon from '@mui/icons-material/Download';

// Color del hotel (puedes moverlo a tus variables globales si prefieres)
const HOTEL_COLOR = "#A73698";

const Reportes = () => {
  const theme = useTheme();
  const apiBaseUrl = "http://localhost:3000/api"; // Asegúrate de que coincida con tu backend
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportError, setReportError] = useState('');

  // Función de exportación (Lógica original conservada)
  const handleExport = (url, isFiltered = false) => {
    setReportError('');

    let finalUrl = url;
    
    if (isFiltered) {
        if (!startDate || !endDate) {
            setReportError("⚠️ Para este reporte es obligatorio seleccionar un rango de fechas.");
            return;
        }
        finalUrl += `?startDate=${startDate}&endDate=${endDate}`;
    }
    
    const token = localStorage.getItem("token");

    fetch(finalUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
        if (!res.ok) {
            return res.json().then(error => {
                throw new Error(error.error || "Error desconocido al exportar.");
            }).catch(() => {
                throw new Error(`Error ${res.status}: Fallo en la red o servidor.`);
            });
        }
        return res.blob();
    })
    .then(blob => {
      const href = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      
      let fileName = url.substring(url.lastIndexOf('/') + 1);
      if (isFiltered) {
          fileName = `analisis_correctivos_${startDate}_a_${endDate}.xlsx`;
      } else {
          fileName += ".xlsx";
      }
      
      link.setAttribute('download', fileName); 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(href);
    })
    .catch(err => {
        console.error("Error al descargar:", err);
        setReportError(err.message || "Error al descargar el archivo.");
    });
  };

  // Configuración de los reportes con Iconos y Colores
  const reportList = [
    { 
      name: "Inventario Activo", 
      description: "Listado detallado de todos los equipos actualmente en operación.", 
      url: `${apiBaseUrl}/devices/export/all`,
      icon: <InventoryIcon fontSize="large" />,
      color: theme.palette.primary.main,
      isFiltered: false
    },
    { 
      name: "Bajas de Equipos", 
      description: "Histórico de equipos dados de baja definitiva.", 
      url: `${apiBaseUrl}/devices/export/inactivos`,
      icon: <DeleteSweepIcon fontSize="large" />,
      color: theme.palette.error.main,
      isFiltered: false
    },
    { 
      name: "Análisis de Garantías", 
      description: "Equipos con garantía vencida y sus mantenimientos correctivos.", 
      url: `${apiBaseUrl}/devices/export/corrective-analysis`,
      icon: <AssessmentIcon fontSize="large" />,
      color: theme.palette.warning.main,
      isFiltered: true // Requiere fechas
    },
    { 
      name: "Historial Mantenimientos", 
      description: "Bitácora completa de servicios preventivos y correctivos.", 
      url: `${apiBaseUrl}/maintenances/export/all`,
      icon: <BuildIcon fontSize="large" />,
      color: theme.palette.info.main,
      isFiltered: false
    },
    { 
      name: "Directorio de Staff", 
      description: "Empleados y Jefes de Área registrados.", 
      url: `${apiBaseUrl}/users/export/all`,
      icon: <GroupIcon fontSize="large" />,
      color: theme.palette.success.main,
      isFiltered: false
    },
    { 
      name: "Usuarios del Sistema", 
      description: "Administradores y editores con acceso a SIMET.", 
      url: `${apiBaseUrl}/auth/export/all`,
      icon: <AdminPanelSettingsIcon fontSize="large" />,
      color: theme.palette.secondary.main,
      isFiltered: false
    },
  ];

  return (
    <Box sx={{ p: 4, bgcolor: '#f4f6f8', minHeight: '100vh' }}>
      
      {/* Encabezado */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ color: '#2c3e50' }}>
          Centro de Reportes
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          Descarga información clave en formato Excel para tu análisis.
        </Typography>
      </Box>

      {/* Panel de Filtros */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 4, 
          borderRadius: 3, 
          border: '1px solid #e0e0e0',
          background: 'linear-gradient(to right, #ffffff, #fcfcfc)'
        }}
      >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: HOTEL_COLOR }}>
            <AccessTimeIcon sx={{ mr: 1 }} />
            <Typography variant="h6" fontWeight="bold">
              Filtro por Fechas
            </Typography>
          </Box>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Selecciona un rango de fechas si vas a descargar el reporte de <b>Análisis de Garantías</b>.
          </Typography>
          
          <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                  <TextField 
                      label="Fecha Inicio"
                      type="date"
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                  />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                  <TextField 
                      label="Fecha Fin"
                      type="date"
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                  />
              </Grid>
          </Grid>
      </Paper>

      {/* Mensajes de Error */}
      {reportError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setReportError('')}>
          {reportError}
        </Alert>
      )}

      {/* Grid de Reportes */}
      <Grid container spacing={3}>
        {reportList.map((report) => (
          <Grid item xs={12} sm={6} md={4} key={report.name}>
            <Card 
              elevation={2}
              sx={{ 
                height: '100%', 
                borderRadius: 3,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                }
              }}
            >
              <CardActionArea 
                onClick={() => handleExport(report.url, report.isFiltered)}
                sx={{ height: '100%', p: 2 }}
              >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  
                  {/* Icono con fondo circular */}
                  <Avatar 
                    sx={{ 
                      bgcolor: report.color + '22', // Color con transparencia
                      color: report.color,
                      width: 64, 
                      height: 64, 
                      mb: 2 
                    }}
                  >
                    {report.icon}
                  </Avatar>

                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {report.name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                    {report.description}
                  </Typography>

                  {/* Etiquetas informativas */}
                  <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
                    <Chip 
                      label="Excel" 
                      size="small" 
                      icon={<DownloadIcon />} 
                      sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold' }} 
                    />
                    {report.isFiltered && (
                      <Chip 
                        label="Requiere Fechas" 
                        size="small" 
                        sx={{ bgcolor: '#fff3e0', color: '#ef6c00', fontWeight: 'bold' }} 
                      />
                    )}
                  </Box>

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