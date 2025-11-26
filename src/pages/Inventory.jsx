// src/pages/Inventory.jsx
import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Typography,
  Alert,
  Modal,
  Fade,
  Backdrop,
  TablePagination,
  CircularProgress,
  TableSortLabel,
  TextField
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
import { useSortableData } from "../hooks/useSortableData";
import "../pages/styles/ConfigButtons.css";

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2
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

  // ESTADOS para manejar el filtro de la URL
  const [activeFilter, setActiveFilter] = useState(""); 
  const [searchParams, setSearchParams] = useSearchParams(); 

  const navigate = useNavigate();
  const { refreshAlerts } = useContext(AlertContext);
  const { user } = useContext(AuthContext);

  const { sortedItems: sortedDevices, requestSort, sortConfig } = useSortableData(devices, { key: 'nombre_equipo', direction: 'ascending' });

  // 1. MODIFICACIÓN CLAVE: fetchDevices ahora usa el estado 'activeFilter' y se actualiza cuando este cambia.
  const fetchDevices = useCallback(async () => { // 👈 Ya no recibe argumento
    setLoading(true);
    setError("");
    try {
      // Usar el estado 'activeFilter' directamente
      const filterParam = activeFilter ? `&filter=${activeFilter}` : ""; 
      
      const res = await api.get(`/devices/get?page=${page + 1}&limit=${rowsPerPage}&search=${search}${filterParam}`);
      setDevices(res.data.data);
      setTotalDevices(res.data.totalCount);
    } catch (err) {
      console.error("Error al obtener dispositivos:", err);
      setError("Error al cargar el inventario.");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, activeFilter]); // 👈 CLAVE: activeFilter añadido a las dependencias para que fetchDevices se recree

  // 2. Efecto 1: Leer el parámetro de la URL al cargar o cambiar searchParams
  useEffect(() => {
    const filterFromUrl = searchParams.get('filter') || "";
    // Solo actualizar si la URL es diferente al estado actual
    if (filterFromUrl !== activeFilter) {
      setActiveFilter(filterFromUrl);
      setPage(0); // Forzar a la primera página si cambia el filtro
    }
  }, [searchParams, activeFilter]);

  // 3. Efecto 2: Ejecutar fetchDevices cuando cambian las dependencias
  useEffect(() => {
      fetchDevices(); // 👈 Ya no requiere argumento
  }, [fetchDevices]); // 👈 Solo depende de la función, que cambiará si page, rowsPerPage, search o activeFilter cambian
  
  // Cuando se hace una búsqueda, limpiamos el filtro de URL.
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
    // LIMPIAR FILTRO DE URL AL BUSCAR y resetear estado
    setSearchParams({});
    setActiveFilter(""); // Resetear también el estado para consistencia
  };

  const handleDelete = async (d_id) => {
    setMessage("");
    setError("");

    if (window.confirm("¡ADVERTENCIA! ¿Estás seguro de que quieres ELIMINAR este equipo? Esta acción es PERMANENTE y solo se recomienda en equipos sin historial de mantenimiento.")) {
      try {
        await api.delete(`/devices/delete/${d_id}`); 
        setMessage("Equipo eliminado permanentemente.");
        fetchDevices(); // 👈 LLamada actualizada
        refreshAlerts(); 
      } catch (err) {
        setError(err.response?.data?.error || err.response?.data?.message || "Error al eliminar el equipo.");
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/inventory/edit/${id}`);
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // NUEVO HANDLER PARA LIMPIAR EL FILTRO ACTIVO
  const handleClearFilter = () => {
    setSearch("");
    setPage(0);
    setActiveFilter("");
    setSearchParams({}); // Limpiar el parámetro 'filter' de la URL
  }

  const getFilterLabel = () => {
    if (activeFilter === 'no-panda') return 'Mostrando: Sin Panda (X)';
    if (activeFilter === 'warranty-risk') return 'Mostrando: Garantía en Riesgo (X)';
    return '';
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Inventario de Equipos
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Buscar equipo..."
            variant="outlined"
            size="small"
            value={search}
            onChange={handleSearchChange}
          />
          
          {/* MOSTRAR BOTÓN PARA LIMPIAR FILTRO ACTIVO */}
          {activeFilter && (
            <Button 
                variant="outlined"
                color="error"
                onClick={handleClearFilter}
                sx={{ ml: 1 }}
            >
                {getFilterLabel()}
            </Button>
          )}

          <ImportButton 
            endpoint="/devices/import" 
            onSuccess={() => { 
                fetchDevices(); // 👈 LLamada actualizada
                refreshAlerts(); 
            }} 
            label="Importar"
          />

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
            className="primary-action-button"
          >
            Crear Equipo
          </Button>
        </Box>
      </Box>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sortDirection={sortConfig?.key === 'nombre_equipo' ? sortConfig.direction : false}>
                  <TableSortLabel
                    active={sortConfig?.key === 'nombre_equipo'}
                    direction={sortConfig?.key === 'nombre_equipo' ? sortConfig.direction : 'asc'}
                    onClick={() => requestSort('nombre_equipo')}
                  >
                    Nombre Equipo
                  </TableSortLabel>
                </TableCell>
                
                <TableCell>Descripción</TableCell>

                <TableCell sortDirection={sortConfig?.key === 'usuario.nombre' ? sortConfig.direction : false}>
                  <TableSortLabel
                    active={sortConfig?.key === 'usuario.nombre'}
                    direction={sortConfig?.key === 'usuario.nombre' ? sortConfig.direction : 'asc'}
                    onClick={() => requestSort('usuario.nombre')}
                  >
                    Usuario Asignado
                  </TableSortLabel>
                </TableCell>
                
                <TableCell>IP</TableCell>
                
                <TableCell>N° Serie</TableCell>

                <TableCell sortDirection={sortConfig?.key === 'tipo.nombre' ? sortConfig.direction : false}>
                  <TableSortLabel
                    active={sortConfig?.key === 'tipo.nombre'}
                    direction={sortConfig?.key === 'tipo.nombre' ? sortConfig.direction : 'asc'}
                    onClick={() => requestSort('tipo.nombre')}
                  >
                    Tipo
                  </TableSortLabel>
                </TableCell>
                
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                sortedDevices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell>{device.nombre_equipo}</TableCell>
                    <TableCell>{device.descripcion || 'N/A'}</TableCell>
                    <TableCell>{device.usuario?.nombre || 'N/A'}</TableCell>
                    <TableCell>{device.ip_equipo || 'N/A'}</TableCell>
                    <TableCell>{device.numero_serie}</TableCell>
                    <TableCell>{device.tipo?.nombre || 'N/A'}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(device.id)}
                        title="Editar equipo"
                        className="action-icon-color"
                      >
                        <EditIcon />
                      </IconButton>
                      {user?.rol === "ADMIN" && (
                        <IconButton
                            color="error"
                            onClick={() => handleDelete(device.id)}
                            title="Eliminar permanentemente"
                        >
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

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={openModal}>
          <Box sx={modalStyle}>
            <CreateDeviceForm
              onClose={handleCloseModal}
              onDeviceCreated={() => {
                fetchDevices(); // 👈 LLamada actualizada
                refreshAlerts(); 
              }}
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