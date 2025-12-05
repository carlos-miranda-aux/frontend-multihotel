import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Chip, IconButton, TablePagination, CircularProgress, Alert, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Grid, Divider, Stack
} from "@mui/material";

import VisibilityIcon from "@mui/icons-material/Visibility";
import HistoryIcon from '@mui/icons-material/History';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SecurityIcon from '@mui/icons-material/Security';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FilterListIcon from '@mui/icons-material/FilterList';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import api from "../api/axios";
import { AuthContext } from "../context/AuthContext"; 
import { ROLES } from "../config/constants";

// --- HELPERS Y COMPONENTES AUXILIARES ---

// Helper para fechas
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleString('es-MX', { 
    day: '2-digit', month: 'short', year: 'numeric', 
    hour: '2-digit', minute: '2-digit' 
  });
};

// Diccionario de campos para traducción
const FIELD_LABELS = {
    nombre_equipo: "Nombre del Equipo",
    etiqueta: "Etiqueta",
    descripcion: "Descripción",
    comentarios: "Comentarios",
    numero_serie: "N° Serie",
    ip_equipo: "Dirección IP",
    marca: "Marca",
    modelo: "Modelo",
    areaId: "Área Asignada",
    usuarioId: "Usuario Asignado (Staff)",
    tipoId: "Tipo de Dispositivo",
    estadoId: "Estado Actual",
    sistemaOperativoId: "Sistema Operativo",
    es_panda: "Antivirus Panda",
    motivo_baja: "Motivo de Baja",
    observaciones_baja: "Observaciones Finales",
    fecha_baja: "Fecha de Baja",
    garantia_fin: "Fin de Garantía",
    garantia_inicio: "Inicio de Garantía",
    perfiles_usuario: "Perfiles (Sesiones)",
    nombre: "Nombre Completo",
    correo: "Correo Electrónico",
    usuario_login: "Usuario de Dominio",
    es_jefe_de_area: "Es Jefe de Área",
    rol: "Rol de Sistema",
    email: "Email de Acceso",
    username: "Usuario de Sistema",
    fecha_programada: "Fecha Programada",
    fecha_realizacion: "Fecha Realización",
    tipo_mantenimiento: "Tipo Mantenimiento",
    diagnostico: "Diagnóstico Técnico",
    acciones_realizadas: "Acciones Realizadas",
    deviceId: "Equipo Afectado",
    hotelId: "ID del Hotel"
};

// Helper para formatear valores según catálogos
const formatValueHelper = (key, value, catalogs) => {
    if (value === null || value === undefined || value === "") return <em style={{opacity:0.5}}>(Vacío)</em>;
    if (typeof value === 'boolean') return value ? "Sí" : "No";
    if ((key.includes('fecha') || key.includes('garantia') || key.includes('At')) && typeof value === 'string') {
        if (value.match(/^\d{4}-\d{2}-\d{2}/)) return formatDate(value);
    }
    if (key === 'areaId' && catalogs.areas) {
        const item = catalogs.areas.find(x => x.id === value);
        return item ? item.nombre : value;
    }
    if (key === 'tipoId' && catalogs.types) {
        const item = catalogs.types.find(x => x.id === value);
        return item ? item.nombre : value;
    }
    if (key === 'estadoId' && catalogs.statuses) {
        const item = catalogs.statuses.find(x => x.id === value);
        return item ? <Chip label={item.nombre} size="small" variant="outlined" /> : value;
    }
    if (key === 'sistemaOperativoId' && catalogs.os) {
        const item = catalogs.os.find(x => x.id === value);
        return item ? item.nombre : value;
    }
    if (key === 'usuarioId' && catalogs.users) {
        const item = catalogs.users.find(x => x.id === value);
        return item ? item.nombre : value;
    }
    return String(value);
};

// Tabla de Detalle (Para Creación/Eliminación)
const DetailTable = ({ data, catalogs, type }) => {
    if (!data) return <Typography variant="caption">Sin datos registrados.</Typography>;
    const keys = Object.keys(data).filter(key => !['updated_at', 'updatedAt', 'created_at', 'createdAt', 'password', 'id', 'deletedAt', 'area', 'departamento'].includes(key));
    const rowBgColor = type === 'DELETE' ? '#fff5f5' : '#f8f9fa';

    return (
        <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
            <Table size="small">
                <TableHead><TableRow sx={{ bgcolor: 'action.hover' }}><TableCell width="40%"><b>Campo</b></TableCell><TableCell width="60%"><b>Valor</b></TableCell></TableRow></TableHead>
                <TableBody>
                    {keys.map((key) => (
                        <TableRow key={key}>
                            <TableCell sx={{ fontWeight: 'bold', color: 'text.primary', textTransform: 'capitalize' }}>{FIELD_LABELS[key] || key.replace(/_/g, ' ')}</TableCell>
                            <TableCell sx={{ bgcolor: rowBgColor }}>{formatValueHelper(key, data[key], catalogs)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

// Tabla de Diferencias (Para Edición)
const DiffTable = ({ oldData, newData, catalogs }) => {
  const allKeys = new Set([...Object.keys(oldData || {}), ...Object.keys(newData || {})]);
  const ignoredKeys = ['updated_at', 'updatedAt', 'created_at', 'createdAt', 'password', 'id', 'deletedAt'];
  const changedKeys = Array.from(allKeys).filter(key => {
    if (ignoredKeys.includes(key)) return false;
    return JSON.stringify(oldData?.[key]) !== JSON.stringify(newData?.[key]);
  });

  if (changedKeys.length === 0) return <Alert severity="info" sx={{ mt: 2 }}>No se detectaron cambios visibles.</Alert>;

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
      <Table size="small">
        <TableHead><TableRow sx={{ bgcolor: 'action.hover' }}><TableCell width="30%"><b>Campo</b></TableCell><TableCell width="35%" sx={{ color: 'error.main' }}><b>Anterior</b></TableCell><TableCell width="35%" sx={{ color: 'success.main' }}><b>Nuevo</b></TableCell></TableRow></TableHead>
        <TableBody>
          {changedKeys.map((key) => (
              <TableRow key={key}>
                <TableCell sx={{ fontWeight: 'bold' }}>{FIELD_LABELS[key] || key}</TableCell>
                <TableCell sx={{ bgcolor: '#fff5f5' }}>{formatValueHelper(key, oldData?.[key], catalogs)}</TableCell>
                <TableCell sx={{ bgcolor: '#f0fdf4' }}>{formatValueHelper(key, newData?.[key], catalogs)}</TableCell>
              </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// --- COMPONENTE PRINCIPAL ---

const AuditLog = () => {
  // 👇 CONTEXTO Y LÓGICA DE VISTAS
  const { user, selectedHotelId } = useContext(AuthContext);
  
  // Si es Root o Corp, y NO ha seleccionado un hotel específico, mostramos la columna Hotel
  const isGlobalUser = user?.rol === ROLES.ROOT || user?.rol === ROLES.CORP_VIEWER;
  const showHotelColumn = isGlobalUser && !selectedHotelId;

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [catalogs, setCatalogs] = useState({ areas: [], types: [], statuses: [], os: [], users: [] });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [filterType, setFilterType] = useState('ALL');
  
  const [selectedLog, setSelectedLog] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      // 🔄 El parámetro hotelId ya no se envía manualmente en la query string.
      // El interceptor de Axios inyecta el header 'x-hotel-id' si existe selectedHotelId.
      let url = `/audit?page=${page + 1}&limit=${rowsPerPage}`;

      const logsRes = await api.get(url);
      
      // Cargar catálogos para traducción (Solo si no están cargados)
      if (catalogs.areas.length === 0) {
          const [areasRes, typesRes, statusRes, osRes, usersRes] = await Promise.allSettled([
              api.get("/areas/get?limit=0"),
              api.get("/device-types/get?limit=0"),
              api.get("/device-status/get?limit=0"),
              api.get("/operating-systems/get?limit=0"),
              api.get("/users/get/all") 
          ]);
          setCatalogs({
              areas: areasRes.status === 'fulfilled' ? (areasRes.value.data.data || areasRes.value.data) : [],
              types: typesRes.status === 'fulfilled' ? (typesRes.value.data.data || typesRes.value.data) : [],
              statuses: statusRes.status === 'fulfilled' ? (statusRes.value.data.data || statusRes.value.data) : [],
              os: osRes.status === 'fulfilled' ? (osRes.value.data.data || osRes.value.data) : [],
              users: usersRes.status === 'fulfilled' ? usersRes.value.data : []
          });
      }

      setLogs(logsRes.data.data);
      setTotalCount(logsRes.data.totalCount);

    } catch (err) {
      setError("Error de conexión al cargar la auditoría.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, selectedHotelId]); // 🔄 Se recarga si cambias de hotel

  useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

  const filteredLogs = filterType === 'ALL' ? logs : logs.filter(log => log.action === filterType);
  const handleChangePage = (e, n) => setPage(n);
  const handleChangeRowsPerPage = (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); };

  const getActionConfig = (action) => {
    if(action==='CREATE') return { label:'Creación', color:'success', icon: <AddCircleIcon/> };
    if(action==='UPDATE') return { label:'Edición', color:'info', icon: <EditIcon/> };
    if(action==='DELETE') return { label:'Eliminación', color:'error', icon: <DeleteIcon/> };
    if(action==='IMPORT') return { label:'Importación', color:'secondary', icon: <CloudUploadIcon/> };
    if(action==='UNAUTHORIZED_ACCESS') return { label:'Seguridad', color:'warning', icon: <SecurityIcon/> };
    return { label: action, color:'default', icon: <HistoryIcon/> };
  };

  // Helper simple para mostrar nombre del hotel
  const getHotelLabel = (id) => {
      if (id === 1) return "CPC";
      if (id === 2) return "SEN";
      if (id === 3) return "CORP";
      return "GLO";
  };

  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary">Bitácora de Movimientos</Typography>
            <Typography variant="subtitle1" color="text.secondary">
                Registro de actividad {selectedHotelId ? "(Filtrado por Hotel Activo)" : "(Vista Global)"}.
            </Typography>
        </Box>
        
        {/* Ya no necesitamos el selector manual aquí, se usa el Topbar */}
      </Box>

      <Stack direction="row" spacing={1} sx={{ mb: 3, overflowX: 'auto', pb: 1 }}>
        <Chip icon={<FilterListIcon />} label="Todos" onClick={() => setFilterType('ALL')} color={filterType === 'ALL' ? 'primary' : 'default'} variant={filterType === 'ALL' ? 'filled' : 'outlined'} />
        <Chip icon={<AddCircleIcon />} label="Creaciones" onClick={() => setFilterType('CREATE')} color={filterType === 'CREATE' ? 'success' : 'default'} variant={filterType === 'CREATE' ? 'filled' : 'outlined'} />
        <Chip icon={<EditIcon />} label="Ediciones" onClick={() => setFilterType('UPDATE')} color={filterType === 'UPDATE' ? 'info' : 'default'} variant={filterType === 'UPDATE' ? 'filled' : 'outlined'} />
        <Chip icon={<DeleteIcon />} label="Bajas" onClick={() => setFilterType('DELETE')} color={filterType === 'DELETE' ? 'error' : 'default'} variant={filterType === 'DELETE' ? 'filled' : 'outlined'} />
        <Chip icon={<SecurityIcon />} label="Seguridad" onClick={() => setFilterType('UNAUTHORIZED_ACCESS')} color={filterType === 'UNAUTHORIZED_ACCESS' ? 'warning' : 'default'} variant={filterType === 'UNAUTHORIZED_ACCESS' ? 'filled' : 'outlined'} />
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <TableContainer>
          <Table size="medium">
            <TableHead sx={{ bgcolor: 'background.paper' }}>
              <TableRow>
                {/* 👇 Header Condicional */}
                {showHotelColumn && <TableCell sx={{ fontWeight: 'bold' }}>Hotel</TableCell>}
                
                <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Responsable</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Acción</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Entidad</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Descripción</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold' }}>Detalle</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={showHotelColumn ? 7 : 6} align="center" sx={{ py: 5 }}><CircularProgress /></TableCell></TableRow>
              ) : filteredLogs.map((log) => {
                const config = getActionConfig(log.action);
                return (
                  <TableRow key={log.id} hover>
                    {/* 👇 Celda Condicional */}
                    {showHotelColumn && (
                        <TableCell>
                            <Chip label={getHotelLabel(log.hotelId)} size="small" variant="outlined" />
                        </TableCell>
                    )}
                    
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(log.createdAt)}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">{log.user?.nombre || 'Sistema'}</Typography>
                        <Typography variant="caption" color="text.secondary">{log.user?.username}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                        <Chip icon={config.icon} label={config.label} color={config.color} size="small" variant="outlined" sx={{ fontWeight: 'bold', border: 'none', bgcolor: `${config.color}.50` }} />
                    </TableCell>
                    <TableCell>
                        <Typography variant="body2">{log.entity}</Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 350 }}>
                        <Typography variant="body2" noWrap>{log.details}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Button size="small" variant="contained" disableElevation startIcon={<VisibilityIcon />} onClick={() => { setSelectedLog(log); setOpenModal(true); }} sx={{ bgcolor: 'action.hover', color: 'text.primary' }}>Ver</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination rowsPerPageOptions={[20, 50]} component="div" count={totalCount} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} labelRowsPerPage="Filas:" />
      </Paper>

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {selectedLog && getActionConfig(selectedLog.action).icon} 
            <Typography variant="h6">Detalle del Movimiento</Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
            {selectedLog && (
                <Box>
                    <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'background.paper' }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary">FECHA</Typography>
                                <Typography variant="body1" fontWeight="bold">{formatDate(selectedLog.createdAt)}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" color="text.secondary">RESPONSABLE</Typography>
                                <Typography variant="body1" fontWeight="bold">{selectedLog.user?.nombre || "Sistema"}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Divider sx={{ my: 1 }} />
                                <Typography variant="caption" color="text.secondary">DESCRIPCIÓN</Typography>
                                <Typography variant="body1">{selectedLog.details}</Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                    {selectedLog.action === 'UNAUTHORIZED_ACCESS' ? (
                        <Alert severity="warning" icon={<WarningAmberIcon />}>{selectedLog.details}</Alert>
                    ) : selectedLog.action === 'UPDATE' ? (
                        <Box><Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 'bold' }}>CAMBIOS REALIZADOS</Typography><DiffTable oldData={selectedLog.oldData} newData={selectedLog.newData} catalogs={catalogs} /></Box>
                    ) : (
                        <Box><Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 'bold' }}>DATOS REGISTRADOS</Typography><DetailTable data={selectedLog.newData || selectedLog.oldData} catalogs={catalogs} type={selectedLog.action} /></Box>
                    )}
                </Box>
            )}
        </DialogContent>
        <DialogActions><Button onClick={() => setOpenModal(false)} variant="contained">Cerrar</Button></DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditLog;