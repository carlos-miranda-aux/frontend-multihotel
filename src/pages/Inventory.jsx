// src/pages/Inventory.jsx
import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Button,
  Typography, Alert, Modal, Fade, Backdrop, TablePagination, CircularProgress, TableSortLabel,
  TextField, Chip, Tooltip
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

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalDevices, setTotalDevices] = useState(0);
  const [search, setSearch] = useState(""); 

  const [activeFilter, setActiveFilter] = useState(""); 
  const [searchParams, setSearchParams] = useSearchParams(); 
  const [sortConfig, setSortConfig] = useState({ key: 'nombre_equipo', direction: 'asc' });

  const navigate = useNavigate();
  const { refreshAlerts } = useContext(AlertContext);
  
  // 👇 Obtenemos el contexto del hotel seleccionado
  const { user, selectedHotelId } = useContext(AuthContext);
  
  // Lógica de Vistas y Permisos
  const isGlobalUser = user?.rol === ROLES.ROOT || user?.rol === ROLES.CORP_VIEWER || (user?.hotels && user.hotels.length > 1);
  
  // 🔒 SOLO Admin Local (1 hotel) puede importar (Regla de negocio actual)
  const canImport = user?.rol === ROLES.HOTEL_ADMIN && user?.hotels?.length === 1;

  // 👁️ Lógica Visual: Mostrar columna Hotel solo si es usuario global Y NO ha seleccionado un hotel específico
  const showHotelColumn = isGlobalUser && !selectedHotelId;

  const fetchDevices = useCallback(async (filterToUse, pageToUse, sortKey, sortDir) => {
    setLoading(true);
    setError("");
    try {
      const filterParam = filterToUse ? `&filter=${filterToUse}` : ""; 
      const sortParam = `&sortBy=${sortKey}&order=${sortDir}`;
      
      // Nota: El backend ya filtra por 'x-hotel-id' header si existe selectedHotelId
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
  }, [searchParams, page, rowsPerPage, search, sortConfig, fetchDevices, selectedHotelId]); // Agregamos selectedHotelId para recargar al cambiar
  
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

  const handleDelete = async (d_id) => {
    setMessage("");
    setError("");
    if (window.confirm("¡ADVERTENCIA! ¿Estás seguro de que quieres ELIMINAR este equipo?")) {
      try {
        await api.delete(`/devices/delete/${d_id}`); 
        setMessage("Equipo eliminado permanentemente.");
        fetchDevices(activeFilter, page, sortConfig.key, sortConfig.direction); 
        refreshAlerts(); 
      } catch (err) {
        setError(err.response?.data?.error || "Error al eliminar el equipo.");
      }
    }
  };

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

  // Helper para nombre de hotel (simple)
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
          
          {/* Botón Importar: SOLO visible para Admin Local (o lógica futura para Root con contexto) */}
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

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}> 
                
                {/* 👇 COLUMNA CONDICIONAL */}
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
              {loading ? (
                <TableRow><TableCell colSpan={showHotelColumn ? 9 : 8} align="center"><CircularProgress /></TableCell></TableRow>
              ) : (
                devices.map((device) => (
                  <TableRow key={device.id}>
                    
                    {/* 👇 CELDA CONDICIONAL */}
                    {showHotelColumn && (
                        <TableCell>
                            <Chip label={getHotelLabel(device.hotelId)} size="small" variant="outlined" />
                        </TableCell>
                    )}

                    <TableCell>{device.nombre_equipo}</TableCell>
                    <TableCell>{device.descripcion || 'N/A'}</TableCell>
                    <TableCell>{device.usuario?.nombre || 'N/A'}</TableCell>
                    <TableCell>{device.ip_equipo || 'N/A'}</TableCell>
                    <TableCell>{device.numero_serie}</TableCell>
                    <TableCell>{device.tipo?.nombre || 'N/A'}</TableCell>
                    <TableCell>
                        {device.sistema_operativo ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2">{device.sistema_operativo.nombre}</Typography>
                            </Box>
                        ) : (
                            <Typography variant="caption" color="text.disabled">Sin SO</Typography>
                        )}
                    </TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleEdit(device.id)}>
                        <EditIcon />
                      </IconButton>
                      {(user?.rol === "HOTEL_ADMIN" || isGlobalUser) && (
                        <IconButton color="error" onClick={() => handleDelete(device.id)}>
                          <DeleteIcon />
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
          labelRowsPerPage="Filas por página:"
        />
      </Paper>

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
    </Box>
  );
};

export default Inventory;