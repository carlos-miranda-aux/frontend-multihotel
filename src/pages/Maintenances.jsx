// src/pages/Maintenances.jsx
import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button,
  Typography, Alert, Modal, Fade, Backdrop, Chip, Tabs, Tab, TablePagination, CircularProgress,
  TableSortLabel, TextField 
} from "@mui/material";
// ... icons ...
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';

import api from "../api/axios.js";
import { useNavigate } from "react-router-dom";
import CreateMaintenanceForm from "../components/CreateMaintenanceForm.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import { AlertContext } from "../context/AlertContext.jsx";
import { ROLES } from "../config/constants.js"; // 👈 Roles

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: 950, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2
};

const Maintenances = () => {
  const [maintenances, setMaintenances] = useState([]);
  // ... estados ...
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [activeTab, setActiveTab] = useState('pendiente');
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalMaintenances, setTotalMaintenances] = useState(0);
  const [search, setSearch] = useState(""); 
  const [sortConfig, setSortConfig] = useState({ key: 'fecha_programada', direction: 'desc' });

  // 👈 LOGICA ROOT
  const { user } = useContext(AuthContext);
  const isRoot = user?.rol === ROLES.ROOT;

  const { refreshAlerts } = useContext(AlertContext);
  const navigate = useNavigate();

  const fetchMaintenances = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const sortParam = `&sortBy=${sortConfig.key}&order=${sortConfig.direction}`;
      const res = await api.get(`/maintenances/get?page=${page + 1}&limit=${rowsPerPage}&status=${activeTab}&search=${search}${sortParam}`);
      setMaintenances(res.data.data);
      setTotalMaintenances(res.data.totalCount);
    } catch (err) {
      console.error(err);
      setError("Error al cargar mantenimientos.");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, activeTab, search, sortConfig]); 

  useEffect(() => { fetchMaintenances(); }, [fetchMaintenances]);

  // ... Handlers (handleSearchChange, handleRequestSort, handleDelete, etc.) iguales ...
  const handleSearchChange = (e) => { setSearch(e.target.value); setPage(0); };
  const handleRequestSort = (key) => { setSortConfig({ key, direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc' }); };
  const handleDeleteMaintenance = async (id) => { if(window.confirm("¿Borrar?")){ try { await api.delete(`/maintenances/delete/${id}`); setMessage("Borrado."); fetchMaintenances(); } catch(e){ setError("Error."); } } };
  const handleEditMaintenance = (id) => navigate(`/maintenances/edit/${id}`);
  const handleExport = async (id) => { /* ... logica export ... */ };
  
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const handleTabChange = (e, v) => { setActiveTab(v); setPage(0); };
  const handleChangePage = (e, n) => setPage(n);
  const handleChangeRowsPerPage = (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); };

  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : "N/A";
  const getTypeChipColor = (type) => type === 'Correctivo' ? 'error' : 'info';
  const headerStyle = { fontWeight: 'bold', color: 'text.primary' };

  return (
    <Box sx={{ p: 3, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="primary">Gestión de Mantenimientos</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField label="Buscar..." variant="outlined" size="small" value={search} onChange={handleSearchChange} />
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenModal}>Nuevo Mantenimiento</Button>
        </Box>
      </Box>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
          <Tab label="Programados" value="pendiente" />
          <Tab label="Historial" value="historial" />
        </Tabs>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                
                {/* 👇 COLUMNA ROOT */}
                {isRoot && <TableCell sx={headerStyle}>Hotel</TableCell>}

                <TableCell sx={headerStyle}>Equipo</TableCell>
                <TableCell sx={headerStyle}>Tipo</TableCell>
                <TableCell sx={headerStyle}>Descripción</TableCell>
                <TableCell sx={headerStyle}>Usuario</TableCell>
                <TableCell sx={headerStyle}>Estado</TableCell>
                <TableCell sx={headerStyle}>{activeTab === 'pendiente' ? 'Fecha Programada' : 'Fecha Realización'}</TableCell>
                <TableCell sx={headerStyle}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={isRoot ? 8 : 7} align="center"><CircularProgress /></TableCell></TableRow>
              ) : (
                maintenances.map((m) => (
                  <TableRow key={m.id}>
                    
                    {/* 👇 DATA ROOT */}
                    {isRoot && (
                        <TableCell>
                            <Chip label={m.hotelId === 1 ? "Cancún" : m.hotelId === 2 ? "Sensira" : "N/A"} size="small" variant="outlined" />
                        </TableCell>
                    )}

                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">{m.device?.nombre_equipo || 'N/A'}</Typography>
                      <Typography variant="caption" color="textSecondary">{m.device?.etiqueta}</Typography>
                    </TableCell>
                    <TableCell><Chip label={m.tipo_mantenimiento} size="small" color={getTypeChipColor(m.tipo_mantenimiento)} /></TableCell>
                    <TableCell>{m.descripcion}</TableCell>
                    <TableCell>{m.device?.usuario?.nombre || 'N/A'}</TableCell>
                    <TableCell><Chip label={m.estado} size="small" /></TableCell>
                    <TableCell>{formatDate(activeTab === 'pendiente' ? m.fecha_programada : m.fecha_realizacion)}</TableCell>
                    <TableCell>
                      {activeTab === 'historial' && <IconButton color="secondary" onClick={() => handleExport(m.id)}><DownloadIcon /></IconButton>}
                      <IconButton color="primary" onClick={() => handleEditMaintenance(m.id)}><EditIcon /></IconButton>
                      {/* Solo admin local o root borran pendientes */}
                      {(user?.rol === ROLES.ROOT || user?.rol === ROLES.HOTEL_ADMIN) && m.estado === 'pendiente' && (
                        <IconButton color="error" onClick={() => handleDeleteMaintenance(m.id)}><DeleteIcon /></IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]} component="div" count={totalMaintenances}
          rowsPerPage={rowsPerPage} page={page}
          onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Modal open={openModal} onClose={handleCloseModal} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
        <Fade in={openModal}>
          <Box sx={modalStyle}>
            <CreateMaintenanceForm
              onClose={handleCloseModal}
              onMaintenanceCreated={() => { setMessage("Creado."); fetchMaintenances(); refreshAlerts(); }}
              setMessage={setMessage} setError={setError}
            />
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default Maintenances;