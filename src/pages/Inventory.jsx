// src/pages/Inventory.jsx
import React, { useEffect, useState } from "react";
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
  Backdrop
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from '@mui/icons-material/Add';
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import CreateDeviceForm from "../components/CreateDeviceForm";

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
  const navigate = useNavigate();

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await api.get("/devices/get");
      setDevices(res.data);
    } catch (err) {
      console.error("Error al obtener dispositivos:", err);
      setError("Error al cargar el inventario.");
    }
  };
  
  // 📌 Nueva función para cambiar el estado a "Baja"
  const handleSetDisposed = async (id) => {
    // Primero, obtener el ID del estado "Baja"
    const statusResponse = await api.get("/device-status/get");
    const disposedStatus = statusResponse.data.find(s => s.nombre === "Baja");

    if (!disposedStatus) {
        setError("El estado 'Baja' no se encontró en la base de datos.");
        return;
    }

    if (window.confirm("¿Estás seguro de que quieres dar de baja este equipo?")) {
        try {
            // 📌 Se envía la fecha actual en la solicitud de actualización
            await api.put(`/devices/put/${id}`, { 
                estadoId: disposedStatus.id,
                fecha_baja: new Date()
            });
            setMessage("Equipo dado de baja correctamente.");
            fetchDevices(); // Refrescar la lista de equipos activos
        } catch (err) {
            setError(err.response?.data?.error || "Error al dar de baja el equipo.");
        }
    }
  };


  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este equipo?")) {
      try {
        await api.delete(`/devices/delete/${id}`);
        setMessage("Equipo eliminado correctamente.");
        fetchDevices();
      } catch (err) {
        setError(err.response?.data?.error || "Error al eliminar el equipo.");
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/inventory/edit/${id}`);
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Inventario de Equipos
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenModal}
        >
          Crear Equipo
        </Button>
      </Box>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>No.</TableCell>
              <TableCell>Etiqueta</TableCell>
              <TableCell>Nombre Equipo</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>N° Serie</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devices.map((device, index) => (
              <TableRow key={device.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{device.etiqueta}</TableCell>
                <TableCell>{device.nombre_equipo}</TableCell>
                <TableCell>{device.usuario?.nombre || 'N/A'}</TableCell>
                <TableCell>{device.numero_serie}</TableCell>
                <TableCell>{device.tipo?.nombre || 'N/A'}</TableCell>
                <TableCell>{device.estado?.nombre || 'N/A'}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleEdit(device.id)}
                  >
                    <EditIcon />
                  </IconButton>
                  {/* 📌 Cambiado el botón de eliminar por el de dar de baja */}
                  <IconButton
                    color="error"
                    onClick={() => handleSetDisposed(device.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal para crear equipo */}
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
              onDeviceCreated={fetchDevices}
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