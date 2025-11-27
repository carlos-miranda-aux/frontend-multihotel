// src/pages/Reportes.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Grid, // Importar Grid
  TextField, // Importar TextField
  Button as MuiButton, // Importar Button con alias
  Alert // Importar Alert
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccessTimeIcon from '@mui/icons-material/AccessTime'; // Nuevo icono para el filtro

// Color del hotel: #A73698
const HOTEL_COLOR = "#A73698";

const Reportes = () => {
  const apiBaseUrl = "http://localhost:3000/api"; 
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportError, setReportError] = useState('');

  // Función genérica para abrir el enlace de descarga (modificada para aceptar query params)
  const handleExport = (url, isFiltered = false) => {
    setReportError('');

    let finalUrl = url;
    
    // Si se requiere filtro de fecha
    if (isFiltered) {
        if (!startDate || !endDate) {
            setReportError("Por favor, selecciona las fechas de inicio y fin para este reporte.");
            return;
        }
        
        // Adjuntar los parámetros de fecha a la URL
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
            // Intentar leer el mensaje de error del backend si no es un blob
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
      // Extrae el nombre del archivo de la URL
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
        console.error("Error al descargar el archivo:", err);
        setReportError(err.message || "Error al descargar el archivo.");
    });
  };

  // Definimos los reportes
  const reportList = [
    { 
      name: "Inventario Activo", 
      description: "Lista completa de todos los equipos activos.", 
      url: `${apiBaseUrl}/devices/export/all`,
      isFiltered: false
    },
    { 
      name: "Reporte de Bajas", 
      description: "Lista de todos los equipos dados de baja.", 
      url: `${apiBaseUrl}/devices/export/inactivos`,
      isFiltered: false
    },
    { 
      name: "Análisis: Garantía Expirada vs. Correctivos", 
      description: "Equipos con garantía expirada y su historial de mantenimientos correctivos en el rango de fechas.", 
      url: `${apiBaseUrl}/devices/export/corrective-analysis`,
      isFiltered: true // 👈 MARCAR COMO REQUERIDO FILTRO
    },
    { 
      name: "Historial de Mantenimientos", 
      description: "Exporta todos los mantenimientos (pendientes y realizados).", 
      url: `${apiBaseUrl}/maintenances/export/all`,
      isFiltered: false
    },
    { 
      name: "Lista de Usuarios", 
      description: "Exporta todos los usuarios de la organización (empleados).", 
      url: `${apiBaseUrl}/users/export/all`,
      isFiltered: false
    },
    { 
      name: "Usuarios del Sistema", 
      description: "Exporta los usuarios administradores y editores de SIMET.", 
      url: `${apiBaseUrl}/auth/export/all`,
      isFiltered: false
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Módulo de Reportes
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 3 }}>
        Selecciona un reporte para descargar en formato Excel.
      </Typography>
      
      {/* SECCIÓN DE FILTRO DE FECHAS */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, borderLeft: `4px solid ${HOTEL_COLOR}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AccessTimeIcon sx={{ mr: 1, color: HOTEL_COLOR }} />
            <Typography variant="h6" fontWeight="bold">Filtro por Rango de Fechas (Opcional)</Typography>
          </Box>
          <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                  <TextField 
                      label="Fecha de Inicio"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                  />
              </Grid>
              <Grid item xs={12} sm={6}>
                  <TextField 
                      label="Fecha de Fin"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                  />
              </Grid>
          </Grid>
          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
            Las fechas se aplicarán para filtrar los *mantenimientos correctivos* en el reporte de análisis.
          </Typography>
      </Paper>
      {/* FIN SECCIÓN DE FILTRO */}

      {reportError && <Alert severity="error" sx={{ mb: 2 }}>{reportError}</Alert>}

      <Paper elevation={3}>
        <List>
          {reportList.map((report, index) => (
            <React.Fragment key={report.name}>
              <ListItem>
                <MuiButton
                    onClick={() => handleExport(report.url, report.isFiltered)}
                    fullWidth
                    sx={{ justifyContent: 'flex-start', p: 1.5, textTransform: 'none' }}
                >
                  <ListItemIcon>
                    <DownloadIcon sx={{ color: report.isFiltered ? theme.palette.warning.main : HOTEL_COLOR }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body1" fontWeight={report.isFiltered ? 'bold' : 'normal'}>{report.name}</Typography>}
                    secondary={<Typography variant="body2" color="textSecondary">{report.description}</Typography>}
                  />
                </MuiButton>
              </ListItem>
              {index < reportList.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default Reportes;