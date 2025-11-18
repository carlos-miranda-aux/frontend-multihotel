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
  TableSortLabel // 👈 CORRECCIÓN: Importar
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import CreateMaintenanceForm from "../components/CreateMaintenanceForm";
import { AuthContext } from "../context/AuthContext";
import { AlertContext } from "../context/AlertContext";
import { useSortableData } from "../hooks/useSortableData"; // 👈 CORRECCIÓN: Importar Hook

// ... (modalStyle sigue igual)
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

  const { user } = useContext(AuthContext);
  const { refreshAlerts } = useContext(AlertContext);
  const navigate = useNavigate();

  // 👈 CORRECCIÓN: Usar el hook de ordenamiento
  const { sortedItems: sortedMaintenances, requestSort, sortConfig } = useSortableData(maintenances, { key: 'fecha_programada', direction: 'descending' });

  const fetchMaintenances = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/maintenances/get?page=${page + 1}&limit=${rowsPerPage}&status=${activeTab}`);
      setMaintenances(res.data.data);
      setTotalMaintenances(res.data.totalCount);
    } catch (err) {
      console.error("Error al obtener mantenimientos:", err);
      setError("Error al cargar los mantenimientos.");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, activeTab]);

  useEffect(() => {
    fetchMaintenances();
  }, [fetchMaintenances]);

  const handleDeleteMaintenance = async (m_id) => {
    setMessage("");
    setError("");
    if (window.confirm("¿Estás seguro de que quieres eliminar este registro de mantenimiento?")) {
      try {
        await api.delete(`/maintenances/delete/${m_id}`);
        setMessage("Registro de mantenimiento eliminado.");
        fetchMaintenances(); 
        refreshAlerts(); 
      } catch (err) {
        setError(err.response?.data?.error || "Error al eliminar el registro.");
      }
    }
  };

  const handleEditMaintenance = (m_id) => {
    navigate(`/maintenances/edit/${m_id}`);
  };

  const handleExport = (id) => {
    // ... (sin cambios)
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
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenModal}
        >
          Nuevo Mantenimiento
        </Button>
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
                {/* 👈 CORRECCIÓN: Encabezados con TableSortLabel */}
                <TableCell sortDirection={sortConfig?.key === 'device.etiqueta' ? sortConfig.direction : false}>
                  <TableSortLabel
                    active={sortConfig?.key === 'device.etiqueta'}
                    direction={sortConfig?.key === 'device.etiqueta' ? sortConfig.direction : 'asc'}
                    onClick={() => requestSort('device.etiqueta')}
                  >
                    Equipo (Etiqueta)
                  </TableSortLabel>
                </TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell sortDirection={sortConfig?.key === (activeTab === 'pendiente' ? 'fecha_programada' : 'fecha_realizacion') ? sortConfig.direction : false}>
                  <TableSortLabel
                    active={sortConfig?.key === (activeTab === 'pendiente' ? 'fecha_programada' : 'fecha_realizacion')}
                    direction={sortConfig?.key === (activeTab === 'pendiente' ? 'fecha_programada' : 'fecha_realizacion') ? sortConfig.direction : 'asc'}
                    onClick={() => requestSort(activeTab === 'pendiente' ? 'fecha_programada' : 'fecha_realizacion')}
                  >
                    {activeTab === 'pendiente' ? 'Fecha Programada' : 'Fecha Realización'}
                  </TableSortLabel>
                </TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : sortedMaintenances.length > 0 ? (
                // 👈 CORRECCIÓN: Mapear sobre 'sortedMaintenances'
                sortedMaintenances.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {m.device?.etiqueta || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {m.device?.nombre_equipo || 'Sin nombre'}
                      </Typography>
                    </TableCell>
                    <TableCell>{m.descripcion}</TableCell>
                    <TableCell>
                      <Chip label={m.estado} size="small"
                        color={m.estado === 'pendiente' ? 'warning' : m.estado === 'realizado' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      {formatDate(activeTab === 'pendiente' ? m.fecha_programada : m.fecha_realizacion)}
                    </TableCell>
                    <TableCell>
                      {activeTab === 'historial' && (
                        <IconButton edge="end" color="secondary" onClick={() => handleExport(m.id)} title="Exportar formato">
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton edge="end" color="primary" onClick={() => handleEditMaintenance(m.id)} title="Editar">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      {(user?.rol === "ADMIN" || user?.rol === "EDITOR") && (
                        <IconButton edge="end" color="error" onClick={() => handleDeleteMaintenance(m.id)} title="Eliminar">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
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

      {/* ... (Modal sigue igual) ... */}
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
                fetchMaintenances(); // 👈 Llama al fetch aquí para asegurarse
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