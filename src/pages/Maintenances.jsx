// src/pages/Maintenances.jsx
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
  Chip,
  Tabs,
  Tab,
  TablePagination,
  CircularProgress,
  TableSortLabel,
  TextField 
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
// 👇 Rutas corregidas con extensiones explícitas
import api from "../api/axios.js";
import { useNavigate } from "react-router-dom";
import CreateMaintenanceForm from "../components/CreateMaintenanceForm.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import { AlertContext } from "../context/AlertContext.jsx";
import { useSortableData } from "../hooks/useSortableData.js";
// ❌ ELIMINAR: import "../pages/styles/Maintenances.css"; 
import "../pages/styles/ConfigButtons.css"; // 👈 USAR CLASES DE BOTONES/ICONOS

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

  const { user } = useContext(AuthContext);
  const { refreshAlerts } = useContext(AlertContext);
  const navigate = useNavigate();

  // Ordenamiento inicial por 'fecha_programada' para consistencia con la vista 'pendiente'
  const { sortedItems: sortedMaintenances, requestSort, sortConfig } = useSortableData(maintenances, { key: 'fecha_programada', direction: 'descending' });

  const fetchMaintenances = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // 👈 Enviar search
      const res = await api.get(`/maintenances/get?page=${page + 1}&limit=${rowsPerPage}&status=${activeTab}&search=${search}`);
      setMaintenances(res.data.data);
      setTotalMaintenances(res.data.totalCount);
    } catch (err) {
      console.error("Error al obtener mantenimientos:", err);
      setError("Error al cargar los mantenimientos.");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, activeTab, search]); 

  useEffect(() => {
    fetchMaintenances();
  }, [fetchMaintenances]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleDeleteMaintenance = async (m_id) => {
    setMessage("");
    setError("");
    // Reemplaza window.confirm con un modal de confirmación si estás en un entorno iframe o si prefieres un diseño más limpio
    if (window.confirm("¿Estás seguro de que quieres eliminar este registro de mantenimiento? Esta acción solo es posible para mantenimientos PENDIENTES.")) {
      try {
        await api.delete(`/maintenances/delete/${m_id}`);
        setMessage("Registro de mantenimiento eliminado.");
        fetchMaintenances(); 
        refreshAlerts(); 
      } catch (err) {
        setError(err.response?.data?.message || err.response?.data?.error || "Error al eliminar el registro.");
      }
    }
  };

  const handleEditMaintenance = (m_id) => {
    navigate(`/maintenances/edit/${m_id}`);
  };

  const handleExport = async (id) => {
    setMessage("");
    setError("");
    try {
      const response = await api.get(
        `/maintenances/export/individual/${id}`,
        { responseType: 'blob' }
      );
      const href = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = href;
      link.setAttribute('download', `Servicio_Manto_${id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(href);
    } catch (err) {
      console.error("Error al descargar el archivo:", err);
      setError("Error al descargar el reporte.");
    }
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Gestión de Mantenimientos
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* 👈 Barra de búsqueda */}
          <TextField
            label="Buscar..."
            variant="outlined"
            size="small"
            value={search}
            onChange={handleSearchChange}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
            className="primary-action-button" // 👈 Clase unificada
          >
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
              <TableRow>
                {/* 1. Nombre del Equipo (Sortable - using device.nombre_equipo) */}
                <TableCell sortDirection={sortConfig?.key === 'device.nombre_equipo' ? sortConfig.direction : false}>
                  <TableSortLabel
                    active={sortConfig?.key === 'device.nombre_equipo'}
                    direction={sortConfig?.key === 'device.nombre_equipo' ? sortConfig.direction : 'asc'}
                    onClick={() => requestSort('device.nombre_equipo')}
                  >
                    Equipo
                  </TableSortLabel>
                </TableCell>

                {/* 2. Descripción */}
                <TableCell>Descripción</TableCell>

                {/* 3. Serie */}
                <TableCell>Serie</TableCell> 
                
                {/* 4. Usuario Asignado (Sortable) */}
                <TableCell sortDirection={sortConfig?.key === 'device.usuario.nombre' ? sortConfig.direction : false}>
                    <TableSortLabel
                        active={sortConfig?.key === 'device.usuario.nombre'}
                        direction={sortConfig?.key === 'device.usuario.nombre' ? sortConfig.direction : 'asc'}
                        onClick={() => requestSort('device.usuario.nombre')}
                    >
                        Usuario
                    </TableSortLabel>
                </TableCell>

                {/* 5. Estado */}
                <TableCell>Estado</TableCell>
                
                {/* 6. Fecha Programada / Realización (Sortable) */}
                <TableCell sortDirection={sortConfig?.key === (activeTab === 'pendiente' ? 'fecha_programada' : 'fecha_realizacion') ? sortConfig.direction : false}>
                  <TableSortLabel
                    active={sortConfig?.key === (activeTab === 'pendiente' ? 'fecha_programada' : 'fecha_realizacion')}
                    direction={sortConfig?.key === (activeTab === 'pendiente' ? 'fecha_programada' : 'fecha_realizacion') ? sortConfig.direction : 'desc'}
                    onClick={() => requestSort(activeTab === 'pendiente' ? 'fecha_programada' : 'fecha_realizacion')}
                  >
                    {activeTab === 'pendiente' ? 'Fecha Programada' : 'Fecha Realización'}
                  </TableSortLabel>
                </TableCell>
                
                {/* Acciones */}
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
              ) : sortedMaintenances.length > 0 ? (
                sortedMaintenances.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      {/* Mostrar Nombre del equipo y etiqueta como subtítulo */}
                      <Typography variant="body2" fontWeight="bold">
                        {m.device?.nombre_equipo || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {m.device?.etiqueta ? `(${m.device.etiqueta})` : 'Sin etiqueta'}
                      </Typography>
                    </TableCell>
                    <TableCell>{m.descripcion}</TableCell>
                    <TableCell>{m.device?.numero_serie || 'N/A'}</TableCell> 
                    <TableCell>{m.device?.usuario?.nombre || 'N/A'}</TableCell> 
                    <TableCell>
                      <Chip label={m.estado} size="small"
                        color={m.estado === 'pendiente' ? 'warning' : m.estado === 'realizado' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      {formatDate(activeTab === 'pendiente' ? m.fecha_programada : m.fecha_realizacion)}
                    </TableCell>
                    <TableCell>
                      {/* Mostrar botón de Exportar SOLO en Historial */}
                      {activeTab === 'historial' && (
                        <IconButton edge="end" color="secondary" onClick={() => handleExport(m.id)} title="Exportar formato">
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      )}
                      
                      {/* Botón de Editar siempre visible (dependiendo del rol) */}
                      <IconButton 
                        edge="end" 
                        color="primary" 
                        onClick={() => handleEditMaintenance(m.id)} 
                        title="Editar"
                        className="action-icon-color" // 👈 Clase unificada
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      
                      {/* Ocultar el botón si el estado no es 'pendiente' */}
                      {(user?.rol === "ADMIN" || user?.rol === "EDITOR") && m.estado === 'pendiente' && (
                        <IconButton edge="end" color="error" onClick={() => handleDeleteMaintenance(m.id)} title="Eliminar">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No hay mantenimientos en esta categoría.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalMaintenances}
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
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={openModal}>
          <Box sx={modalStyle}>
            <CreateMaintenanceForm
              onClose={handleCloseModal}
              onMaintenanceCreated={() => {
                setMessage("");
                setError("");
                setMessage("Mantenimiento programado exitosamente.");
                setActiveTab('pendiente'); 
                setPage(0); 
                fetchMaintenances();
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

export default Maintenances;