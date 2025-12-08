import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button,
  Typography, Alert, Modal, Fade, Backdrop, Tabs, Tab, TablePagination, 
  TableSortLabel, TextField, Chip, Skeleton
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
import { ROLES } from "../config/constants.js"; 
import ConfirmDialog from "../components/common/ConfirmDialog";
import EmptyState from "../components/common/EmptyState";

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
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mantoToDelete, setMantoToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false); // 🔥 Nuevo

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalMaintenances, setTotalMaintenances] = useState(0);
  const [search, setSearch] = useState(""); 
  const [sortConfig, setSortConfig] = useState({ key: 'fecha_programada', direction: 'desc' });

  const { user, selectedHotelId } = useContext(AuthContext);
  const isGlobalUser = user?.rol === ROLES.ROOT || user?.rol === ROLES.CORP_VIEWER || (user?.hotels && user.hotels.length > 1);
  const showHotelColumn = isGlobalUser && !selectedHotelId;

  const { refreshAlerts } = useContext(AlertContext);
  const navigate = useNavigate();

  const fetchMaintenances = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const sortParam = `&sortBy=${sortConfig.key}&order=${sortConfig.direction}`;
      const res = await api.get(`/maintenances/get?page=${page + 1}&limit=${rowsPerPage}&status=${activeTab}&search=${search}${sortParam}`);
      setMaintenances(res.data.data);
      setTotalMaintenances(res.data.totalCount);
    } catch (err) { console.error(err); setError("Error al cargar mantenimientos."); } 
    finally { setLoading(false); }
  }, [page, rowsPerPage, activeTab, search, sortConfig, selectedHotelId]);

  useEffect(() => { fetchMaintenances(); }, [fetchMaintenances]);

  const handleSearchChange = (e) => { setSearch(e.target.value); setPage(0); };
  const handleRequestSort = (key) => { setSortConfig({ key, direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc' }); };
  
  const handleOpenDelete = (manto) => { setMantoToDelete(manto); setDeleteDialogOpen(true); };

  const confirmDelete = async () => {
      if(!mantoToDelete) return;
      setActionLoading(true); // 🔥
      try { 
          await api.delete(`/maintenances/delete/${mantoToDelete.id}`); 
          setMessage("Mantenimiento eliminado correctamente."); 
          fetchMaintenances(); 
          refreshAlerts();
          setDeleteDialogOpen(false); // 🔥
      } catch(e){ setError("Error al eliminar."); } 
      finally { setActionLoading(false); setMantoToDelete(null); } // 🔥
  };

  const handleEditMaintenance = (id) => navigate(`/maintenances/edit/${id}`);
  const handleExport = async (id) => { try { window.open(`${api.defaults.baseURL}/maintenances/export/individual/${id}`, '_blank'); } catch(e) { console.error(e); } };
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const handleTabChange = (e, v) => { setActiveTab(v); setPage(0); };
  const handleChangePage = (e, n) => setPage(n);
  const handleChangeRowsPerPage = (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); };

  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : "N/A";
  const getTypeChipColor = (type) => type === 'Correctivo' ? 'error' : 'info';
  const getHotelName = (id) => id === 1 ? "Cancún" : id === 2 ? "Sensira" : id === 3 ? "Corp" : "N/A";

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
                {showHotelColumn && <TableCell>Hotel</TableCell>}
                <TableCell>Equipo</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>{activeTab === 'pendiente' ? 'Fecha Programada' : 'Fecha Realización'}</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? Array.from(new Array(5)).map((_, i) => (
                    <TableRow key={i}>
                        {showHotelColumn && <TableCell><Skeleton variant="text"/></TableCell>}
                        <TableCell><Skeleton variant="text" width={120}/></TableCell>
                        <TableCell><Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }}/></TableCell>
                        <TableCell><Skeleton variant="text" width="80%"/></TableCell>
                        <TableCell><Skeleton variant="text" width={100}/></TableCell>
                        <TableCell><Skeleton variant="rectangular" width={60} height={24}/></TableCell>
                        <TableCell><Skeleton variant="text" width={80}/></TableCell>
                        <TableCell><Skeleton variant="circular" width={30} height={30}/></TableCell>
                    </TableRow>
                )) : maintenances.length === 0 ? (
                <TableRow><TableCell colSpan={showHotelColumn ? 8 : 7}><EmptyState title="No hay mantenimientos" description="No se encontraron registros en esta sección."/></TableCell></TableRow>
              ) : (
                maintenances.map((m) => (
                  <TableRow key={m.id} hover>
                    {showHotelColumn && <TableCell><Chip label={getHotelName(m.hotelId)} size="small" variant="outlined" /></TableCell>}
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">{m.device?.nombre_equipo || 'N/A'}</Typography>
                      <Typography variant="caption" color="textSecondary">{m.device?.etiqueta}</Typography>
                    </TableCell>
                    <TableCell><Chip label={m.tipo_mantenimiento} size="small" color={getTypeChipColor(m.tipo_mantenimiento)} /></TableCell>
                    <TableCell sx={{ maxWidth: 300 }}><Typography noWrap variant="body2">{m.descripcion}</Typography></TableCell>
                    <TableCell>{m.device?.usuario?.nombre || 'N/A'}</TableCell>
                    <TableCell><Chip label={m.estado} size="small" /></TableCell>
                    <TableCell>{formatDate(activeTab === 'pendiente' ? m.fecha_programada : m.fecha_realizacion)}</TableCell>
                    <TableCell>
                      {activeTab === 'historial' && <IconButton color="secondary" onClick={() => handleExport(m.id)}><DownloadIcon /></IconButton>}
                      <IconButton color="primary" onClick={() => handleEditMaintenance(m.id)}><EditIcon /></IconButton>
                      {(user?.rol === ROLES.ROOT || user?.rol === ROLES.HOTEL_ADMIN) && m.estado === 'pendiente' && <IconButton color="error" onClick={() => handleOpenDelete(m)}><DeleteIcon /></IconButton>}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={totalMaintenances} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />
      </Paper>

      <Modal open={openModal} onClose={handleCloseModal} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}><Fade in={openModal}><Box sx={modalStyle}><CreateMaintenanceForm onClose={handleCloseModal} onMaintenanceCreated={() => { setMessage("Creado."); fetchMaintenances(); refreshAlerts(); }} setMessage={setMessage} setError={setError} /></Box></Fade></Modal>

      <ConfirmDialog 
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="¿Eliminar Mantenimiento?"
        content="Estás a punto de eliminar este registro de mantenimiento. Esta acción no se puede deshacer."
        isLoading={actionLoading} // 🔥
      />
    </Box>
  );
};

export default Maintenances;