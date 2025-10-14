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
              <TableCell>Etiqueta</TableCell>
              <TableCell>N° Serie</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Marca</TableCell>
              <TableCell>Modelo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devices.map((device) => (
              <TableRow key={device.id}>
                <TableCell>{device.etiqueta}</TableCell>
                <TableCell>{device.numero_serie}</TableCell>
                <TableCell>{device.tipo?.nombre || 'N/A'}</TableCell>
                <TableCell>{device.marca}</TableCell>
                <TableCell>{device.modelo}</TableCell>
                <TableCell>{device.estado?.nombre || 'N/A'}</TableCell>
                <TableCell>{device.usuario?.nombre || 'N/A'}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleEdit(device.id)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(device.id)}
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