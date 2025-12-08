// src/pages/Inventory.jsx
import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button,
  Typography, Alert, Modal, Fade, Backdrop, TablePagination, TableSortLabel,
  TextField, Chip, Skeleton, Tooltip // 👈 Importamos Skeleton
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete"; 
import AddIcon from '@mui/icons-material/Add';
import api from "../api/axios";
import { useNavigate, useSearchParams } from "react-router-dom"; 
import CreateDeviceForm from "../components/CreateDeviceForm";
import ImportButton from "../components/ImportButton"; 
import { AlertContext } from "../context/AlertContext";
import { AuthContext } from "../context/AuthContext"; 
import { ROLES } from "../config/constants"; 

// 👇 Importamos los nuevos componentes UX
import ConfirmDialog from "../components/common/ConfirmDialog";
import EmptyState from "../components/common/EmptyState";

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: 800, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2
};

const Inventory = () => {
  const [devices, setDevices] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estados para el Diálogo de Confirmación (UX Punto 5)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalDevices, setTotalDevices] = useState(0);
  const [search, setSearch] = useState(""); 

  const [activeFilter, setActiveFilter] = useState(""); 
  const [searchParams, setSearchParams] = useSearchParams(); 
  const [sortConfig, setSortConfig] = useState({ key: 'nombre_equipo', direction: 'asc' });

  const navigate = useNavigate();
  const { refreshAlerts } = useContext(AlertContext);
  const { user, selectedHotelId } = useContext(AuthContext);
  
  const isGlobalUser = user?.rol === ROLES.ROOT || user?.rol === ROLES.CORP_VIEWER || (user?.hotels && user.hotels.length > 1);
  const canImport = user?.rol === ROLES.HOTEL_ADMIN && user?.hotels?.length === 1;
  const showHotelColumn = isGlobalUser && !selectedHotelId;

  const fetchDevices = useCallback(async (filterToUse, pageToUse, sortKey, sortDir) => {
    setLoading(true);
    setError("");
    try {
      const filterParam = filterToUse ? `&filter=${filterToUse}` : ""; 
      const sortParam = `&sortBy=${sortKey}&order=${sortDir}`;
      const res = await api.get(`/devices/get?page=${pageToUse + 1}&limit=${rowsPerPage}&search=${search}${filterParam}${sortParam}`);
      setDevices(res.data.data);
      setTotalDevices(res.data.totalCount);
    } catch (err) {
      console.error("Error al obtener dispositivos:", err);
      setError("Error al cargar el inventario.");
    } finally {
      setLoading(false);
    }
  }, [rowsPerPage, search]);

  useEffect(() => {
    const filterFromUrl = searchParams.get('filter') || "";
    let filterToUse = activeFilter;
    let pageToUse = page;

    if (filterFromUrl !== activeFilter) {
      setActiveFilter(filterFromUrl);
      setPage(0);
      filterToUse = filterFromUrl; 
      pageToUse = 0;
    }
    fetchDevices(filterToUse, pageToUse, sortConfig.key, sortConfig.direction);
  }, [searchParams, page, rowsPerPage, search, sortConfig, fetchDevices, selectedHotelId]);
  
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
    setSearchParams({});
    setActiveFilter(""); 
  };

  const handleRequestSort = (key) => {
    const isAsc = sortConfig.key === key && sortConfig.direction === 'asc';
    setSortConfig({ key, direction: isAsc ? 'desc' : 'asc' });
  };

  // --- Lógica de Eliminación (Punto 5) ---
  const handleOpenDeleteDialog = (device) => {
      setDeviceToDelete(device);
      setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deviceToDelete) return;
    
    setMessage("");
    setError("");
    try {
      await api.delete(`/devices/delete/${deviceToDelete.id}`); 
      setMessage("Equipo eliminado correctamente.");
      fetchDevices(activeFilter, page, sortConfig.key, sortConfig.direction); 
      refreshAlerts(); 
    } catch (err) {
      setError(err.response?.data?.error || "Error al eliminar el equipo.");
    } finally {
      setDeleteDialogOpen(false);
      setDeviceToDelete(null);
    }
  };
  // ----------------------------------------

  const handleEdit = (id) => navigate(`/inventory/edit/${id}`);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleClearFilter = () => {
    setSearch("");
    setPage(0);
    setActiveFilter("");
    setSearchParams({}); 
  }

  const getFilterLabel = () => {
    if (activeFilter === 'no-panda') return 'Mostrando: Sin Panda (X)';
    if (activeFilter === 'warranty-risk') return 'Mostrando: Garantía en Riesgo (X)';
    if (activeFilter === 'expired-warranty') return 'Mostrando: Garantías Expiradas (X)'; 
    if (activeFilter === 'safe-warranty') return 'Mostrando: Garantías Activas (X)'; 
    return '';
  }

  const headerStyle = { fontWeight: 'bold', color: 'text.primary' };
  const getHotelLabel = (id) => {
      if (id === 1) return "Cancún";
      if (id === 2) return "Sensira";
      if (id === 3) return "Corporativo";
      return `ID: ${id}`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" color="primary" fontWeight="bold">Inventario de Equipos</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Buscar equipo..."
            variant="outlined"
            size="small"
            value={search}
            onChange={handleSearchChange}
          />
          {activeFilter && (
            <Button variant="outlined" color="error" onClick={handleClearFilter} sx={{ ml: 1 }}>
                {getFilterLabel()}
            </Button>
          )}
          
          {canImport && (
              <ImportButton 
                endpoint="/devices/import" 
                onSuccess={() => { fetchDevices(activeFilter, page, sortConfig.key, sortConfig.direction); refreshAlerts(); }} 
                label="Importar" 
              />
          )}
          
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<AddIcon />} 
            onClick={handleOpenModal}
          >
            Crear Equipo
          </Button>
        </Box>
      </Box>

      {(isGlobalUser && !canImport) && (
          <Alert severity="info" sx={{ mb: 2 }}>
              Vista Global/Regional: Puedes ver y gestionar equipos. Para importar masivamente, contacta al administrador local o usa el perfil local.
          </Alert>
      )}

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}> 
                {showHotelColumn && <TableCell sx={headerStyle}>Hotel</TableCell>}
                <TableCell sx={headerStyle}>
                  <TableSortLabel active={sortConfig.key === 'nombre_equipo'} direction={sortConfig.direction} onClick={() => handleRequestSort('nombre_equipo')}>
                    Nombre Equipo
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={headerStyle}>Descripción</TableCell>
                <TableCell sx={headerStyle}>
                  <TableSortLabel active={sortConfig.key === 'usuario.nombre'} direction={sortConfig.direction} onClick={() => handleRequestSort('usuario.nombre')}>
                    Usuario Asignado
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={headerStyle}>IP</TableCell>
                <TableCell sx={headerStyle}>N° Serie</TableCell>
                <TableCell sx={headerStyle}>
                  <TableSortLabel active={sortConfig.key === 'tipo.nombre'} direction={sortConfig.direction} onClick={() => handleRequestSort('tipo.nombre')}>
                    Tipo
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={headerStyle}>
                  <TableSortLabel active={sortConfig.key === 'sistema_operativo.nombre'} direction={sortConfig.direction} onClick={() => handleRequestSort('sistema_operativo.nombre')}>
                    Sistema Operativo
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={headerStyle}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            
            <TableBody>
              {/* 👇 UX PUNTO 4: SKELETONS DE CARGA */}
              {loading ? (
                Array.from(new Array(rowsPerPage)).map((_, index) => (
                  <TableRow key={index}>
                    {showHotelColumn && <TableCell><Skeleton variant="text" /></TableCell>}
                    <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                    <TableCell><Skeleton variant="text" /></TableCell>
                    <TableCell><Skeleton variant="text" /></TableCell>
                    <TableCell><Skeleton variant="text" width={100} /></TableCell>
                    <TableCell><Skeleton variant="text" /></TableCell>
                    <TableCell><Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} /></TableCell>
                    <TableCell><Skeleton variant="text" /></TableCell>
                    <TableCell><Skeleton variant="circular" width={30} height={30} /></TableCell>
                  </TableRow>
                ))
              ) : devices.length === 0 ? (
                // 👇 UX PUNTO 6: EMPTY STATE
                <TableRow>
                    <TableCell colSpan={showHotelColumn ? 9 : 8}>
                        <EmptyState 
                            title="No hay equipos registrados" 
                            description={search ? "No se encontraron resultados para tu búsqueda." : "Comienza agregando un equipo nuevo o importando una lista."} 
                        />
                    </TableCell>
                </TableRow>
              ) : (
                devices.map((device) => (
                  <TableRow key={device.id} hover>
                    {showHotelColumn && (
                        <TableCell>
                            <Chip label={getHotelLabel(device.hotelId)} size="small" variant="outlined" />
                        </TableCell>
                    )}
                    <TableCell>
                        <Typography variant="body2" fontWeight="bold">{device.nombre_equipo}</Typography>
                        <Typography variant="caption" color="text.secondary">{device.etiqueta}</Typography>
                    </TableCell>
                    <TableCell>{device.descripcion || 'N/A'}</TableCell>
                    <TableCell>{device.usuario?.nombre || 'N/A'}</TableCell>
                    <TableCell>{device.ip_equipo || 'N/A'}</TableCell>
                    <TableCell>{device.numero_serie}</TableCell>
                    <TableCell><Chip label={device.tipo?.nombre || 'N/A'} size="small" /></TableCell>
                    <TableCell>
                        {device.sistema_operativo ? (
                            <Typography variant="body2">{device.sistema_operativo.nombre}</Typography>
                        ) : (
                            <Typography variant="caption" color="text.disabled">Sin SO</Typography>
                        )}
                    </TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleEdit(device.id)} size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      {(user?.rol === "HOTEL_ADMIN" || isGlobalUser) && (
                        // 👇 Abre el diálogo en lugar de borrar directo
                        <IconButton color="error" onClick={() => handleOpenDeleteDialog(device)} size="small">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalDevices}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas:"
        />
      </Paper>

      {/* Modal Crear */}
      <Modal open={openModal} onClose={handleCloseModal} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
        <Fade in={openModal}>
          <Box sx={modalStyle}>
            <CreateDeviceForm
              onClose={handleCloseModal}
              onDeviceCreated={() => { fetchDevices(activeFilter, page, sortConfig.key, sortConfig.direction); refreshAlerts(); }}
              setMessage={setMessage}
              setError={setError}
            />
          </Box>
        </Fade>
      </Modal>

      {/* 👇 UX PUNTO 5: DIÁLOGO DE CONFIRMACIÓN */}
      <ConfirmDialog 
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="¿Eliminar Equipo?"
        content={`Estás a punto de eliminar "${deviceToDelete?.nombre_equipo}". Esta acción moverá el equipo a la papelera (Soft Delete).`}
      />
    </Box>
  );
};

export default Inventory;