// src/pages/Reportes.jsx
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import AssessmentIcon from '@mui/icons-material/Assessment';

// Color del hotel: #A73698
const HOTEL_COLOR = "#A73698";

const Reportes = () => {
  const apiBaseUrl = "http://localhost:3000/api"; // O usa tu variable de entorno

  // Función genérica para abrir el enlace de descarga
  const handleExport = (url) => {
    const token = localStorage.getItem("token");
    // No podemos usar 'api.get' para descargar archivos directamente,
    // pero podemos simularlo con fetch o simplemente abriendo la URL.
    // Como el token está en el header, 'window.open' no funcionará si la ruta está protegida.
    // Usaremos fetch para obtener el blob.

    fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.blob())
    .then(blob => {
      const href = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      // Extrae el nombre del archivo de la URL
      const fileName = url.substring(url.lastIndexOf('/') + 1);
      link.setAttribute('download', `${fileName}.xlsx`); // Asignar un nombre de archivo
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    .catch(err => console.error("Error al descargar el archivo:", err));
  };

  // Definimos los reportes
  const reportList = [
    { 
      name: "Inventario Activo", 
      description: "Lista completa de todos los equipos activos.", 
      url: `${apiBaseUrl}/devices/export/all` 
    },
    { 
      name: "Reporte de Bajas", 
      description: "Lista de todos los equipos dados de baja.", 
      url: `${apiBaseUrl}/devices/export/inactivos` 
    },
    { 
      name: "Historial de Mantenimientos", 
      description: "Exporta todos los mantenimientos (pendientes y realizados).", 
      url: `${apiBaseUrl}/maintenances/export/all` 
    },
    { 
      name: "Lista de Usuarios", 
      description: "Exporta todos los usuarios de la organización (empleados).", 
      url: `${apiBaseUrl}/users/export/all` // (Tendrás que crear esta ruta)
    },
    { 
      name: "Usuarios del Sistema", 
      description: "Exporta los usuarios administradores y editores de SIMET.", 
      url: `${apiBaseUrl}/auth/export/all` 
    },
    // Puedes añadir más aquí
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Módulo de Reportes
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 3 }}>
        Selecciona un reporte para descargar en formato Excel.
      </Typography>

      <Paper elevation={3}>
        <List>
          {reportList.map((report, index) => (
            <React.Fragment key={report.name}>
              <ListItem>
                <ListItemButton onClick={() => handleExport(report.url)}>
                  <ListItemIcon>
                    {/* [APLICAR COLOR] */}
                    <DownloadIcon sx={{ color: HOTEL_COLOR }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={report.name}
                    secondary={report.description}
                  />
                </ListItemButton>
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