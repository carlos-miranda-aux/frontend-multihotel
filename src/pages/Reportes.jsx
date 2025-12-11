import React, { useState, useContext, useEffect } from 'react';
import {
  Box, Typography, Grid, TextField, Alert, useTheme, Card,
  CardActionArea, CardContent, Avatar, Chip, CircularProgress, Modal, Fade, 
  Button, Autocomplete, Backdrop, Dialog, DialogTitle, DialogContent, DialogActions,
  RadioGroup, FormControlLabel, Radio, FormControl, FormLabel 
} from '@mui/material';

// Librerías para PDF
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Iconos
import InventoryIcon from '@mui/icons-material/Inventory';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BuildIcon from '@mui/icons-material/Build';
import GroupIcon from '@mui/icons-material/Group';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DownloadIcon from '@mui/icons-material/Download';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd'; 
import LockIcon from '@mui/icons-material/Lock';
import DateRangeIcon from '@mui/icons-material/DateRange';
import DevicesOtherIcon from '@mui/icons-material/DevicesOther';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'; 
import TableViewIcon from '@mui/icons-material/TableView'; 

import { AuthContext } from "../context/AuthContext";
import { ROLES } from "../config/constants";
import api from '../api/axios'; 

const resguardoModalStyle = {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    width: 500, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2
};

const Reportes = () => {
  const theme = useTheme();
  const { user, selectedHotelId } = useContext(AuthContext); 
  const isRoot = user?.rol === ROLES.ROOT;
  const apiBaseUrl = import.meta.env.VITE_API_URL; 
  
  const [reportError, setReportError] = useState('');
  const [downloadingReport, setDownloadingReport] = useState(null);

  // --- ESTADOS PARA FILTROS Y CONFIGURACIÓN ---
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [currentReportConfig, setCurrentReportConfig] = useState(null);
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  
  const [exportFormat, setExportFormat] = useState('excel'); 

  // --- ESTADOS MODAL RESGUARDO ---
  const [openResguardoModal, setOpenResguardoModal] = useState(false);
  const [devices, setDevices] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
      const fetchTypes = async () => {
          try {
              const res = await api.get('/device-types/get?limit=0');
              setDeviceTypes(res.data || []);
          } catch (err) { console.error(err); }
      };
      fetchTypes();
  }, []);

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
              } catch (err) { console.error(err); } finally { setLoadingData(false); }
          };
          fetchData();
      }
  }, [openResguardoModal]);

  // --- LISTA MAESTRA DE REPORTES ---
  const reportList = [
    { 
      name: "Inventario Activo", 
      description: "Listado de equipos en operación.", 
      excelUrl: `${apiBaseUrl}/devices/export/all`, 
      dataUrl: '/devices/get', 
      pdfColumns: [
          { title: 'Etiqueta', dataKey: 'etiqueta' },
          { title: 'Equipo', dataKey: 'nombre_equipo' },
          { title: 'Serie', dataKey: 'numero_serie' },
          { title: 'Tipo', dataKey: 'tipo.nombre' },
          { title: 'Usuario', dataKey: 'usuario.nombre' },
          { title: 'Area', dataKey: 'area.nombre' },
      ],
      icon: <InventoryIcon fontSize="large" />, 
      color: theme.palette.primary.main, 
      requiresType: true,
      requiresDate: false
    },
    { 
      name: "Bajas de Equipos", 
      description: "Histórico de equipos retirados.", 
      excelUrl: `${apiBaseUrl}/devices/export/inactivos`, 
      dataUrl: '/disposals/get',
      pdfColumns: [
          { title: 'Equipo', dataKey: 'nombre_equipo' },
          { title: 'Serie', dataKey: 'numero_serie' },
          { title: 'Motivo', dataKey: 'motivo_baja' },
          { title: 'Fecha Baja', dataKey: 'fecha_baja' },
      ],
      icon: <DeleteSweepIcon fontSize="large" />, 
      color: theme.palette.error.main, 
      requiresType: false, requiresDate: true, dateOptional: true
    },
    { 
      name: "Análisis de Garantías", 
      description: "Equipos vencidos y sus correctivos.", 
      excelUrl: `${apiBaseUrl}/devices/export/corrective-analysis`, 
      dataUrl: null, 
      icon: <AssessmentIcon fontSize="large" />, 
      color: theme.palette.warning.main, 
      requiresType: false, requiresDate: true, dateOptional: false
    },
    { 
      name: "Historial Mantenimientos", 
      description: "Bitácora completa de servicios.", 
      excelUrl: `${apiBaseUrl}/maintenances/export/all`, 
      dataUrl: '/maintenances/get',
      pdfColumns: [
        { title: 'Equipo', dataKey: 'device.nombre_equipo' },
        { title: 'Tipo', dataKey: 'tipo_mantenimiento' },
        { title: 'Fecha', dataKey: 'fecha_programada' },
        { title: 'Estado', dataKey: 'estado' },
        { title: 'Descripción', dataKey: 'descripcion' },
      ],
      icon: <BuildIcon fontSize="large" />, 
      color: theme.palette.info.main, 
      requiresType: false, requiresDate: false
    },
    { 
      name: "Directorio de usuarios", 
      description: "Usuarios del hotel registrados.", 
      excelUrl: `${apiBaseUrl}/users/export/all`, 
      dataUrl: '/users/get',
      pdfColumns: [
        { title: 'Nombre', dataKey: 'nombre' },
        { title: 'Correo', dataKey: 'correo' },
        { title: 'Usuario', dataKey: 'usuario_login' },
        { title: 'Area', dataKey: 'area.nombre' },
      ],
      icon: <GroupIcon fontSize="large" />, 
      color: theme.palette.success.main, 
      requiresType: false, requiresDate: false 
    },
    ...(user?.rol === ROLES.ROOT || user?.rol === "HOTEL_ADMIN" ? [{ 
      name: "Usuarios del Sistema", 
      description: "Credenciales de acceso.", 
      excelUrl: `${apiBaseUrl}/auth/export/all`, 
      dataUrl: '/auth/get',
      pdfColumns: [
        { title: 'Nombre', dataKey: 'nombre' },
        { title: 'Usuario', dataKey: 'username' },
        { title: 'Rol', dataKey: 'rol' },
        { title: 'Email', dataKey: 'email' },
      ],
      icon: <AdminPanelSettingsIcon fontSize="large" />, 
      color: theme.palette.secondary.main, 
      requiresType: false, requiresDate: false 
    }] : []),
  ];

  // --- MANEJO DE SELECCIÓN ---
  const handleCardClick = (report) => {
      setCurrentReportConfig(report);
      setStartDate('');
      setEndDate('');
      setSelectedTypes([]);
      setExportFormat('excel'); 
      setReportError('');
      setConfigModalOpen(true);
  };

  const handleConfirmConfig = () => {
      if (!currentReportConfig) return;

      if (currentReportConfig.requiresDate && !currentReportConfig.dateOptional) {
          if (!startDate || !endDate) {
              setReportError("Es obligatorio seleccionar un rango de fechas.");
              return;
          }
      }

      if (exportFormat === 'pdf') {
          generatePDF(currentReportConfig);
      } else {
          downloadExcel(currentReportConfig);
      }
      setConfigModalOpen(false);
  };

  // --- GENERACIÓN DE EXCEL ---
  const downloadExcel = (report) => {
    setDownloadingReport(report.name); 
    let finalUrl = report.excelUrl;
    const params = [];

    if (report.requiresDate && startDate && endDate) {
        params.push(`startDate=${startDate}`); params.push(`endDate=${endDate}`);
    }
    if (report.requiresType && selectedTypes.length > 0) {
        const typeIds = selectedTypes.map(t => t.id).join(',');
        params.push(`types=${typeIds}`);
    }
    if (params.length > 0) finalUrl += `?${params.join('&')}`;
    
    const token = localStorage.getItem("token");
    const headers = { 'Authorization': `Bearer ${token}` };
    if (selectedHotelId) headers['x-hotel-id'] = selectedHotelId;

    fetch(finalUrl, { method: 'GET', headers })
    .then(res => {
        if (!res.ok) throw new Error("Error en descarga");
        return res.blob();
    })
    .then(blob => {
      const href = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      const suffix = (startDate && endDate) ? `_${startDate}_${endDate}` : "";
      const fileName = report.name.replace(/ /g, '_') + suffix + ".xlsx";
      link.setAttribute('download', fileName); 
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      window.URL.revokeObjectURL(href);
    })
    .catch(err => setReportError("Error al descargar Excel."))
    .finally(() => setDownloadingReport(null));
  };

  // --- GENERACIÓN DE PDF ---
  const generatePDF = async (report) => {
      if (!report.dataUrl) {
          setReportError("Este reporte no está disponible en PDF.");
          return;
      }
      setDownloadingReport(report.name);

      try {
          let params = "?limit=10000"; 
          if (report.requiresDate && startDate && endDate) params += `&startDate=${startDate}&endDate=${endDate}`;
          if (report.requiresType && selectedTypes.length > 0) params += `&types=${selectedTypes.map(t=>t.id).join(',')}`;
          
          const response = await api.get(`${report.dataUrl}${params}`);
          let data = response.data.data || response.data; 

          if (!data || data.length === 0) {
              setReportError("No hay datos para generar el PDF.");
              setDownloadingReport(null);
              return;
          }

          const doc = new jsPDF();
          doc.setFontSize(18);
          doc.text(report.name.toUpperCase(), 14, 22);
          doc.setFontSize(10);
          const fechaImpresion = new Date().toLocaleDateString();
          doc.text(`Fecha de impresión: ${fechaImpresion}`, 14, 28);
          if (selectedHotelId) doc.text(`Hotel ID: ${selectedHotelId}`, 14, 33);

          const getNestedValue = (obj, path) => {
              return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined) ? acc[part] : '', obj);
          };

          const tableRows = data.map(item => {
              return report.pdfColumns.map(col => {
                  let val = getNestedValue(item, col.dataKey);
                  if (col.dataKey.includes('fecha') || col.dataKey.includes('date')) {
                       val = val ? new Date(val).toLocaleDateString() : '';
                  }
                  return val;
              });
          });

          const tableHeaders = report.pdfColumns.map(col => col.title);

          doc.autoTable({
              head: [tableHeaders],
              body: tableRows,
              startY: 40,
              styles: { fontSize: 8 },
              headStyles: { fillColor: [74, 98, 116] }, 
          });

          doc.save(`${report.name}.pdf`);

      } catch (err) {
          console.error(err);
          setReportError("Error al generar PDF.");
      } finally {
          setDownloadingReport(null);
      }
  };

  // Lógica Resguardo
  const handleGenerateResguardo = async () => {
      if (!selectedDevice) { setReportError("Debes seleccionar un equipo."); return; }
      if (!selectedDevice.usuario && !selectedUser) { setReportError("Este equipo no tiene dueño."); return; }
      setReportError(''); setDownloadingReport("Generar Resguardo");
      try {
          let url = `/devices/export/resguardo/${selectedDevice.id}`;
          if (!selectedDevice.usuario && selectedUser) url += `?userId=${selectedUser.id}`;
          const response = await api.get(url, { responseType: 'blob' });
          const urlObj = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a'); link.href = urlObj; link.setAttribute('download', `Resguardo_${selectedDevice.nombre_equipo}.docx`);
          document.body.appendChild(link); link.click(); link.parentNode.removeChild(link);
          setOpenResguardoModal(false); setSelectedDevice(null); setSelectedUser(null);
      } catch (err) { console.error(err); setReportError("Error al generar el documento."); } finally { setDownloadingReport(null); }
  };
  const hasOwner = selectedDevice && selectedDevice.usuario;

  return (
    <Box sx={{ p: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom color="text.primary">Centro de Reportes</Typography>
        <Typography variant="subtitle1" color="text.secondary">Descarga información clave.</Typography>
      </Box>

      {reportError && <Alert severity="error" sx={{ mb: 3 }} onClose={() => setReportError('')}>{reportError}</Alert>}

      <Grid container spacing={3}>
        {/* Tarjeta Resguardo */}
        <Grid item xs={12} sm={6} md={4}>
            <Card elevation={2} sx={{ height: '100%', borderRadius: 3, transition: '0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
                <CardActionArea onClick={() => setOpenResguardoModal(true)} sx={{ height: '100%', p: 2 }}>
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <Avatar sx={{ bgcolor: theme.palette.info.dark + '22', color: theme.palette.info.dark, width: 64, height: 64, mb: 2 }}><AssignmentIndIcon fontSize="large" /></Avatar>
                        <Typography variant="h6" fontWeight="bold">Formato de Responsiva</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Generar formato de responsiva.</Typography>
                        <Chip label="Word (.docx)" size="small" icon={<DownloadIcon />} sx={{ mt: 'auto', bgcolor: '#e3f2fd', color: '#0288d1' }} />
                    </CardContent>
                </CardActionArea>
            </Card>
        </Grid>

        {/* Tarjetas Dinámicas */}
        {reportList.map((report) => (
          <Grid item xs={12} sm={6} md={4} key={report.name}>
            <Card elevation={2} sx={{ height: '100%', borderRadius: 3, transition: '0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 } }}>
              <CardActionArea 
                onClick={() => handleCardClick(report)} 
                sx={{ height: '100%', p: 2 }}
                disabled={downloadingReport !== null}
              >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Avatar sx={{ bgcolor: report.color + '22', color: report.color, width: 64, height: 64, mb: 2 }}>{report.icon}</Avatar>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>{report.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 20 }}>{report.description}</Typography>
                  
                  {downloadingReport === report.name ? (
                      <Chip label="Generando..." icon={<CircularProgress size={16} />} />
                  ) : (
                      <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
                         {/* CAMBIO AQUÍ: Etiqueta simplificada */}
                         <Chip label="Descargar" size="small" icon={<DownloadIcon />} sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 'bold' }} />
                      </Box>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* --- DIALOG UNIFICADO DE CONFIGURACIÓN --- */}
      <Dialog open={configModalOpen} onClose={() => setConfigModalOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 'bold' }}>Configurar Descarga</DialogTitle>
          <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {currentReportConfig?.name}
              </Typography>

              {/* Selector de Formato */}
              <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
                  <FormLabel component="legend" sx={{ fontSize: '0.85rem', mb: 1 }}>Formato de Archivo</FormLabel>
                  <RadioGroup row value={exportFormat} onChange={(e) => setExportFormat(e.target.value)}>
                      <FormControlLabel 
                        value="excel" 
                        control={<Radio size="small" />} 
                        label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><TableViewIcon color="success" fontSize="small"/> Excel</Box>} 
                      />
                      <FormControlLabel 
                        value="pdf" 
                        control={<Radio size="small" />} 
                        label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><PictureAsPdfIcon color="error" fontSize="small"/> PDF</Box>} 
                        disabled={!currentReportConfig?.dataUrl} 
                      />
                  </RadioGroup>
              </FormControl>

              {/* Filtro Fechas */}
              {currentReportConfig?.requiresDate && (
                  <Box sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.primary' }}>
                          <DateRangeIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="subtitle2" fontWeight="bold">Periodo</Typography>
                      </Box>
                      <Typography variant="caption" display="block" sx={{ mb: 2, color: 'text.secondary' }}>
                          {currentReportConfig.dateOptional ? "Opcional (Vacío = Todo)" : "Obligatorio *"}
                      </Typography>
                      <Grid container spacing={2}>
                          <Grid item xs={6}><TextField label="Inicio" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} value={startDate} onChange={(e) => setStartDate(e.target.value)} /></Grid>
                          <Grid item xs={6}><TextField label="Fin" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} value={endDate} onChange={(e) => setEndDate(e.target.value)} /></Grid>
                      </Grid>
                  </Box>
              )}

              {/* Filtro Tipos */}
              {currentReportConfig?.requiresType && (
                  <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.primary' }}>
                          <DevicesOtherIcon fontSize="small" sx={{ mr: 1 }} />
                          <Typography variant="subtitle2" fontWeight="bold">Tipo de Equipo</Typography>
                      </Box>
                      <Autocomplete
                          multiple
                          options={deviceTypes}
                          getOptionLabel={(option) => option.nombre}
                          value={selectedTypes}
                          onChange={(event, newValue) => setSelectedTypes(newValue)}
                          renderInput={(params) => <TextField {...params} label="Seleccionar (Vacío = Todos)" size="small" />}
                          renderTags={(value, getTagProps) => value.map((option, index) => (<Chip variant="outlined" label={option.nombre} size="small" {...getTagProps({ index })} />))}
                      />
                  </Box>
              )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={() => setConfigModalOpen(false)} color="inherit">Cancelar</Button>
              <Button onClick={handleConfirmConfig} variant="contained" color="primary" startIcon={<DownloadIcon />}>
                  Descargar
              </Button>
          </DialogActions>
      </Dialog>
      
      {/* --- MODAL RESGUARDO --- */}
      <Modal open={openResguardoModal} onClose={() => setOpenResguardoModal(false)} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
        <Fade in={openResguardoModal}>
            <Box sx={resguardoModalStyle}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>Generar Responsiva</Typography>
                {loadingData ? <CircularProgress /> : (
                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                       <Autocomplete
                            options={devices}
                            getOptionLabel={(option) => `${option.etiqueta || 'S/N'} - ${option.nombre_equipo}`}
                            value={selectedDevice}
                            onChange={(e, val) => { setSelectedDevice(val); setSelectedUser(null); }}
                            renderInput={(params) => <TextField {...params} label="Equipo" />}
                       />
                       {hasOwner ? <Alert severity="info">Asignado a: {selectedDevice.usuario.nombre}</Alert> : 
                        <Autocomplete options={usersList} getOptionLabel={o=>o.nombre} value={selectedUser} onChange={(e,v)=>setSelectedUser(v)} renderInput={(p)=><TextField {...p} label="Usuario Manual" />} disabled={!selectedDevice} />
                       }
                       <Button variant="contained" onClick={handleGenerateResguardo} disabled={!selectedDevice}>Descargar Word</Button>
                   </Box>
                )}
            </Box>
        </Fade>
      </Modal>

    </Box>
  );
};

export default Reportes;