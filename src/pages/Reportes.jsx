import React, { useState, useContext, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Alert, useTheme, Card,
  CardActionArea, CardContent, Avatar, Chip, CircularProgress, Modal, Fade, 
  Button, Autocomplete, FormControl, Backdrop
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
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'; // Icono para resguardo
import LockIcon from '@mui/icons-material/Lock';

import { AuthContext } from "../context/AuthContext";
import { ROLES } from "../config/constants";
import api from '../api/axios'; 

const modalStyle = {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    width: 500, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2
};

const Reportes = () => {
  const theme = useTheme();
  const { user, selectedHotelId } = useContext(AuthContext); 
  const isRoot = user?.rol === ROLES.ROOT;
  const apiBaseUrl = import.meta.env.VITE_API_URL; 
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportError, setReportError] = useState('');
  const [downloadingReport, setDownloadingReport] = useState(null);

  // Estados para el Modal de Resguardo
  const [openResguardoModal, setOpenResguardoModal] = useState(false);
  const [devices, setDevices] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  // Cargar datos para el modal de resguardo
  useEffect(() => {
      if (openResguardoModal) {
          const fetchData = async () => {
              setLoadingData(true);
              try {
                  const [devicesRes, usersRes] = await Promise.all([
                      api.get('/devices/get/all-names'),
                      api.get('/users/get/all')
                  ]);
                  setDevices(devicesRes.data || []);
                  setUsersList(usersRes.data || []);
              } catch (err) {
                  console.error("Error cargando datos para resguardo", err);
              } finally {
                  setLoadingData(false);
              }
          };
          fetchData();
      }
  }, [openResguardoModal]);

  const handleExport = (reportName, url, isFiltered = false, isOptionalFilter = false) => {
    setReportError('');
    setDownloadingReport(reportName); 

    let finalUrl = url;
    
    if (isFiltered) {
        if (!isOptionalFilter && (!startDate || !endDate)) {
            setReportError("Para este reporte es obligatorio seleccionar un rango de fechas.");
            setDownloadingReport(null);
            return;
        }
        if (startDate && endDate) {
            finalUrl += `?startDate=${startDate}&endDate=${endDate}`;
        }
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
      const hasDates = startDate && endDate;
      let fileName = url.substring(url.lastIndexOf('/') + 1) + (hasDates ? `_${startDate}_${endDate}` : "") + ".xlsx";
      
      link.setAttribute('download', fileName); 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(href);
    })
    .catch(err => setReportError(err.message || "Error al descargar el reporte."))
    .finally(() => setDownloadingReport(null));
  };

  const handleGenerateResguardo = async () => {
      if (!selectedDevice) {
          setReportError("Debes seleccionar un equipo.");
          return;
      }
      
      // Validación: Si no tiene usuario asignado en BD, DEBE seleccionar uno manual
      if (!selectedDevice.usuario && !selectedUser) {
          setReportError("Este equipo no tiene dueño. Por favor selecciona un usuario para asignar en el documento.");
          return;
      }

      setReportError('');
      setDownloadingReport("Generar Resguardo");

      try {
          // Construir URL. Si seleccionó usuario manual, se envía.
          let url = `/devices/export/resguardo/${selectedDevice.id}`;
          if (!selectedDevice.usuario && selectedUser) {
              url += `?userId=${selectedUser.id}`;
          }

          const response = await api.get(url, { responseType: 'blob' });
          
          const urlObj = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = urlObj;
          link.setAttribute('download', `Resguardo_${selectedDevice.nombre_equipo}.docx`);
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
          
          setOpenResguardoModal(false);
          setSelectedDevice(null);
          setSelectedUser(null);

      } catch (err) {
          console.error(err);
          setReportError("Error al generar el documento de resguardo.");
      } finally {
          setDownloadingReport(null);
      }
  };

  // Helper para detectar si el equipo seleccionado ya tiene dueño
  const hasOwner = selectedDevice && selectedDevice.usuario;

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
        {/* Tarjeta Especial: Generar Resguardo */}
        <Grid item xs={12} sm={6} md={4}>
            <Card elevation={2} sx={{ height: '100%', borderRadius: 3, transition: '0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
                <CardActionArea 
                    onClick={() => setOpenResguardoModal(true)} 
                    sx={{ height: '100%', p: 2 }}
                >
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <Avatar sx={{ bgcolor: theme.palette.info.dark + '22', color: theme.palette.info.dark, width: 64, height: 64, mb: 2 }}>
                            <AssignmentIndIcon fontSize="large" />
                        </Avatar>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>Documento de responsiva</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                            Genera el formato de responsiva de equipo.
                        </Typography>
                        <Box sx={{ mt: 'auto' }}>
                            <Chip label="Word" size="small" icon={<DownloadIcon />} sx={{ bgcolor: '#e3f2fd', color: '#0288d1', fontWeight: 'bold' }} />
                        </Box>
                    </CardContent>
                </CardActionArea>
            </Card>
        </Grid>

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

      {/* Modal para generar Resguardo */}
      <Modal open={openResguardoModal} onClose={() => setOpenResguardoModal(false)} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
        <Fade in={openResguardoModal}>
            <Box sx={modalStyle}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>Generar responsiva de equipo</Typography>
                
                {loadingData ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress /></Box> : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        
                        {/* Selector de Equipo */}
                        <Autocomplete
                            options={devices}
                            getOptionLabel={(option) => `${option.etiqueta || 'S/N'} - ${option.nombre_equipo}`}
                            value={selectedDevice}
                            onChange={(event, newValue) => {
                                setSelectedDevice(newValue);
                                setSelectedUser(null); // Reset usuario manual al cambiar equipo
                            }}
                            renderInput={(params) => <TextField {...params} label="Seleccionar Equipo" placeholder="Buscar por etiqueta o nombre" />}
                            noOptionsText="No se encontraron equipos"
                        />

                        {/* Alerta si ya tiene dueño */}
                        {hasOwner && (
                            <Alert severity="info" icon={<LockIcon fontSize="small"/>}>
                                Este equipo ya está asignado a <b>{selectedDevice.usuario.nombre}</b>. Se usará este nombre en el documento.
                            </Alert>
                        )}

                        {/* Selector de Usuario (Solo si no tiene dueño) */}
                        {!hasOwner && (
                            <Autocomplete
                                options={usersList}
                                getOptionLabel={(option) => option.nombre}
                                value={selectedUser}
                                onChange={(event, newValue) => setSelectedUser(newValue)}
                                renderInput={(params) => <TextField {...params} label="Seleccionar Usuario para Asignar" required />}
                                noOptionsText="No se encontraron usuarios"
                                disabled={!selectedDevice} // Deshabilitado si no hay equipo seleccionado
                            />
                        )}

                        <Button 
                            variant="contained" 
                            color="primary" 
                            size="large" 
                            startIcon={downloadingReport ? <CircularProgress size={20} color="inherit" /> : <DownloadIcon />}
                            onClick={handleGenerateResguardo}
                            disabled={!selectedDevice || (!hasOwner && !selectedUser) || downloadingReport !== null}
                        >
                            {downloadingReport ? "Generando..." : "Descargar Documento"}
                        </Button>
                    </Box>
                )}
            </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default Reportes;