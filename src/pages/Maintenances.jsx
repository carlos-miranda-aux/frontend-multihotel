// src/pages/Maintenances.jsx
import React, { useEffect, useState, useContext } from "react";
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
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Tabs,
  Tab
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import CreateMaintenanceForm from "../components/CreateMaintenanceForm";
import { AuthContext } from "../context/AuthContext";

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
  const [devices, setDevices] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [activeTab, setActiveTab] = useState('programados');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDevicesWithMaintenances();
  }, []);

  const fetchDevicesWithMaintenances = async () => {
    try {
      const res = await api.get("/devices/get");
      setDevices(res.data);
    } catch (err) {
      console.error("Error al obtener equipos:", err);
      // 👈 CORRECCIÓN 1: No establezcas un error aquí.
      // Esto evita que el refresco cause un mensaje de error conflictivo.
      // setError("Error al cargar los equipos y sus mantenimientos."); // 👈 LÍNEA COMENTADA
    }
  };

  const handleDeleteMaintenance = async (m_id) => {
    // 👈 CORRECCIÓN 2: Limpia ambos mensajes al iniciar la acción
    setMessage("");
    setError("");

    if (window.confirm("¿Estás seguro de que quieres eliminar este registro de mantenimiento?")) {
      try {
        await api.delete(`/maintenances/delete/${m_id}`);
        setMessage("Registro de mantenimiento eliminado.");
        // Esta función de refresco AHORA es segura porque ya no establece el error.
        fetchDevicesWithMaintenances(); 
      } catch (err) {
        setError(err.response?.data?.error || "Error al eliminar el registro.");
      }
    }
  };

  const handleEditMaintenance = (m_id) => {
    navigate(`/maintenances/edit/${m_id}`);
  };

  const handleExport = (id) => {
    // ... (tu código de exportación está bien)
    const token = localStorage.getItem("token");
    const url = `http://localhost:3000/api/maintenances/export/individual/${id}`;

    fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.blob())
    .then(blob => {
      const href = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.setAttribute('download', `Servicio_Manto_${id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    .catch(err => {
      console.error("Error al descargar el archivo:", err);
      setError("Error al descargar el reporte.");
    });
  };


  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // ⚠️ AVISO: Esta lógica de filtrado sigue siendo ineficiente (Punto de Optimización 1).
  // Debería obtener de /maintenances/get, no de /devices/get.
  // Pero la corrección de los mensajes funcionará independientemente.
  const programados = devices
    .map(d => ({ ...d, maintenances: d.maintenances.filter(m => m.estado === 'pendiente')}))
    .filter(d => d.maintenances.length > 0);

  const historial = devices
    .map(d => ({ ...d, maintenances: d.maintenances.filter(m => m.estado !== 'pendiente')}))
    .filter(d => d.maintenances.length > 0);


  // --- Componente de Tabla Reutilizable ---
  const renderMaintenanceTable = (data, tabType) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre del equipo</TableCell>
            <TableCell>N° Serie</TableCell>
            <TableCell>Marca</TableCell>
            <TableCell>Modelo</TableCell>
            <TableCell>S.O.</TableCell>
            <TableCell sx={{ minWidth: 350 }}>Acciones de Mantenimiento</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((device) => (
            <TableRow key={device.id}>
              <TableCell>{device.nombre_equipo}</TableCell>
              <TableCell>{device.numero_serie}</TableCell>
              <TableCell>{device.marca || 'N/A'}</TableCell>
              <TableCell>{device.modelo || 'N/A'}</TableCell>
              <TableCell>{device.sistema_operativo?.nombre || 'N/A'}</TableCell>

              <TableCell>
                <List dense disablePadding>
                  {device.maintenances.map((m) => (
                    <React.Fragment key={m.id}>
                      <ListItem
                        secondaryAction={
                          <>
                            {tabType === 'historial' && (
                              <IconButton edge="end" color="secondary" onClick={() => handleExport(m.id)}>
                                <DownloadIcon fontSize="small" />
                              </IconButton>
                            )}
                            
                            <IconButton edge="end" color="primary" onClick={() => handleEditMaintenance(m.id)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            
                            {(user?.rol === "ADMIN" || user?.rol === "EDITOR") && (
                              <IconButton edge="end" color="error" onClick={() => handleDeleteMaintenance(m.id)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </>
                        }
                        disableGutters
                      >
                        <ListItemText
                          primary={m.descripcion}
                          secondary={
                            tabType === 'programados'
                              ? `Programado para: ${formatDate(m.fecha_programada)}`
                              : `Realizado: ${formatDate(m.fecha_realizacion)}`
                          }
                        />
                        <Chip label={m.estado} size="small" sx={{ ml: 1, mr: 10 }} 
                          color={m.estado === 'pendiente' ? 'warning' : m.estado === 'realizado' ? 'success' : 'default'}
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </TableCell>
            </TableRow>
          ))}
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center">
                No hay mantenimientos en esta categoría.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

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
          <Tab label="Programados" value="programados" />
          <Tab label="Historial" value="historial" />
        </Tabs>
      </Box>

      <Box>
        {activeTab === 'programados' && renderMaintenanceTable(programados, 'programados')}
        {activeTab === 'historial' && renderMaintenanceTable(historial, 'historial')}
      </Box>

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
                // 👈 CORRECCIÓN 3: Limpia ambos mensajes al iniciar el callback
                setMessage("");
                setError("");
                
                fetchDevicesWithMaintenances(); // Esta función ya no da 'setError'
                setMessage("Mantenimiento programado exitosamente.");
                setActiveTab('programados');
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