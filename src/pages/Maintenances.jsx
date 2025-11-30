// src/pages/Maintenances.jsx
import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button,
  Typography, Alert, Modal, Fade, Backdrop, Chip, Tabs, Tab, TablePagination, CircularProgress,
  TableSortLabel, TextField 
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import api from "../api/axios.js";
import { useNavigate } from "react-router-dom";
import CreateMaintenanceForm from "../components/CreateMaintenanceForm.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import { AlertContext } from "../context/AlertContext.jsx";
import "../pages/styles/ConfigButtons.css"; 

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: 950, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2
};

const Maintenances = () => {
  const [maintenances, setMaintenances] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [activeTab, setActiveTab] = useState('pendiente');
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalMaintenances, setTotalMaintenances] = useState(0);
  const [search, setSearch] = useState(""); 

  // 👇 Estado de Ordenamiento
  const [sortConfig, setSortConfig] = useState({ key: 'fecha_programada', direction: 'desc' });

  const { user } = useContext(AuthContext);
  const { refreshAlerts } = useContext(AlertContext);
  const navigate = useNavigate();

  const fetchMaintenances = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // 👇 Enviar parámetros de ordenamiento al backend
      const sortParam = `&sortBy=${sortConfig.key}&order=${sortConfig.direction}`;
      const res = await api.get(`/maintenances/get?page=${page + 1}&limit=${rowsPerPage}&status=${activeTab}&search=${search}${sortParam}`);
      setMaintenances(res.data.data);
      setTotalMaintenances(res.data.totalCount);
    } catch (err) {
      console.error("Error al obtener mantenimientos:", err);
      setError("Error al cargar los mantenimientos.");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, activeTab, search, sortConfig]); 

  useEffect(() => {
    fetchMaintenances();
  }, [fetchMaintenances]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  // 👇 Manejador de clic en encabezados
  const handleRequestSort = (key) => {
    const isAsc = sortConfig.key === key && sortConfig.direction === 'asc';
    setSortConfig({ key, direction: isAsc ? 'desc' : 'asc' });
  };

  const handleDeleteMaintenance = async (m_id) => {
    setMessage("");
    setError("");
    if (window.confirm("¿Estás seguro de que quieres eliminar este registro?")) {
      try {
        await api.delete(`/maintenances/delete/${m_id}`);
        setMessage("Registro eliminado.");
        fetchMaintenances(); 
        refreshAlerts(); 
      } catch (err) {
        setError(err.response?.data?.message || "Error al eliminar.");
      }
    }
  };

  const handleEditMaintenance = (m_id) => navigate(`/maintenances/edit/${m_id}`);

  const handleExport = async (id) => {
    try {
      const response = await api.get(`/maintenances/export/individual/${id}`, { responseType: 'blob' });
      const href = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = href;
      link.setAttribute('download', `Servicio_Manto_${id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(href);
    } catch (err) {
      setError("Error al descargar el reporte.");
    }
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const handleTabChange = (event, newValue) => { setActiveTab(newValue); setPage(0); };
  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString() : "N/A";
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };
  
  const getTypeChipColor = (type) => {
    if (type === 'Correctivo') return 'error';
    if (type === 'Preventivo') return 'info';
    return 'default';
  }

  const headerStyle = { fontWeight: 'bold', color: '#333' };

  return (
    <Box sx={{ p: 3, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Gestión de Mantenimientos</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField label="Buscar..." variant="outlined" size="small" value={search} onChange={handleSearchChange} />
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenModal} className="primary-action-button">
            Nuevo Mantenimiento
          </Button>
        </Box>
      </Box>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Programados" value="pendiente" />
          <Tab label="Historial" value="historial" />
        </Tabs>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                {/* Columnas Ordenables */}
                <TableCell sx={headerStyle} sortDirection={sortConfig.key === 'device.nombre_equipo' ? sortConfig.direction : false}>
                  <TableSortLabel active={sortConfig.key === 'device.nombre_equipo'} direction={sortConfig.key === 'device.nombre_equipo' ? sortConfig.direction : 'asc'} onClick={() => handleRequestSort('device.nombre_equipo')}>
                    Equipo
                  </TableSortLabel>
                </TableCell>
                
                <TableCell sx={headerStyle} sortDirection={sortConfig.key === 'tipo_mantenimiento' ? sortConfig.direction : false}>
                  <TableSortLabel active={sortConfig.key === 'tipo_mantenimiento'} direction={sortConfig.key === 'tipo_mantenimiento' ? sortConfig.direction : 'asc'} onClick={() => handleRequestSort('tipo_mantenimiento')}>
                    Tipo
                  </TableSortLabel>
                </TableCell>

                <TableCell sx={headerStyle}>Descripción</TableCell>
                <TableCell sx={headerStyle}>Serie</TableCell> 
                
                <TableCell sx={headerStyle} sortDirection={sortConfig.key === 'device.usuario.nombre' ? sortConfig.direction : false}>
                    <TableSortLabel active={sortConfig.key === 'device.usuario.nombre'} direction={sortConfig.key === 'device.usuario.nombre' ? sortConfig.direction : 'asc'} onClick={() => handleRequestSort('device.usuario.nombre')}>
                        Usuario
                    </TableSortLabel>
                </TableCell>

                <TableCell sx={headerStyle}>Estado</TableCell>
                
                <TableCell sx={headerStyle} sortDirection={sortConfig.key === (activeTab === 'pendiente' ? 'fecha_programada' : 'fecha_realizacion') ? sortConfig.direction : false}>
                  <TableSortLabel
                    active={sortConfig.key === (activeTab === 'pendiente' ? 'fecha_programada' : 'fecha_realizacion')}
                    direction={sortConfig.key === (activeTab === 'pendiente' ? 'fecha_programada' : 'fecha_realizacion') ? sortConfig.direction : 'desc'}
                    onClick={() => handleRequestSort(activeTab === 'pendiente' ? 'fecha_programada' : 'fecha_realizacion')}
                  >
                    {activeTab === 'pendiente' ? 'Fecha Programada' : 'Fecha Realización'}
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={headerStyle}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} align="center"><CircularProgress /></TableCell></TableRow>
              ) : maintenances.length > 0 ? (
                maintenances.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">{m.device?.nombre_equipo || 'N/A'}</Typography>
                      <Typography variant="caption" color="textSecondary">{m.device?.etiqueta ? `(${m.device.etiqueta})` : ''}</Typography>
                    </TableCell>
                    <TableCell><Chip label={m.tipo_mantenimiento || 'N/A'} size="small" color={getTypeChipColor(m.tipo_mantenimiento)} /></TableCell>
                    <TableCell>{m.descripcion}</TableCell>
                    <TableCell>{m.device?.numero_serie || 'N/A'}</TableCell> 
                    <TableCell>{m.device?.usuario?.nombre || 'N/A'}</TableCell> 
                    <TableCell>
                      <Chip label={m.estado} size="small" color={m.estado === 'pendiente' ? 'warning' : m.estado === 'realizado' ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell>{formatDate(activeTab === 'pendiente' ? m.fecha_programada : m.fecha_realizacion)}</TableCell>
                    <TableCell>
                      {activeTab === 'historial' && (
                        <IconButton edge="end" color="secondary" onClick={() => handleExport(m.id)}><DownloadIcon fontSize="small" /></IconButton>
                      )}
                      <IconButton edge="end" color="primary" onClick={() => handleEditMaintenance(m.id)} className="action-icon-color"><EditIcon fontSize="small" /></IconButton>
                      {(user?.rol === "ADMIN" || user?.rol === "EDITOR") && m.estado === 'pendiente' && (
                        <IconButton edge="end" color="error" onClick={() => handleDeleteMaintenance(m.id)}><DeleteIcon fontSize="small" /></IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={8} align="center">No hay mantenimientos.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]} component="div" count={totalMaintenances}
          rowsPerPage={rowsPerPage} page={page}
          onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
        />
      </Paper>

      <Modal open={openModal} onClose={handleCloseModal} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
        <Fade in={openModal}>
          <Box sx={modalStyle}>
            <CreateMaintenanceForm
              onClose={handleCloseModal}
              onMaintenanceCreated={() => { setMessage("Mantenimiento creado."); setActiveTab('pendiente'); setPage(0); fetchMaintenances(); refreshAlerts(); }}
              setMessage={setMessage} setError={setError}
            />
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default Maintenances;