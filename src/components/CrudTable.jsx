// src/components/CrudTable.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Button,
  Alert,
  Modal,
  Fade,
  Backdrop
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from '@mui/icons-material/Add';
import api from "../api/axios";

const CrudTable = ({ title, apiUrl }) => {
  const [data, setData] = useState([]);
  const [itemName, setItemName] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [apiUrl]);

  const fetchData = async () => {
    try {
      const response = await api.get(`${apiUrl}/get`);
      setData(response.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error al cargar los datos.");
    }
  };

  const handleCreate = async () => {
    setError("");
    setMessage("");
    if (!itemName) {
      setError("El nombre no puede estar vacío.");
      return;
    }

    try {
      await api.post(`${apiUrl}/post`, { nombre: itemName });
      setMessage("Elemento creado correctamente.");
      fetchData();
      setItemName("");
      setOpenModal(false);
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear el elemento.");
    }
  };

  const handleEdit = async () => {
    setError("");
    setMessage("");
    if (!itemName) {
      setError("El nombre no puede estar vacío.");
      return;
    }

    try {
      await api.put(`${apiUrl}/put/${currentId}`, { nombre: itemName });
      setMessage("Elemento actualizado correctamente.");
      fetchData();
      setItemName("");
      setOpenModal(false);
      setIsEdit(false);
      setCurrentId(null);
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar el elemento.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este elemento?")) {
      try {
        await api.delete(`${apiUrl}/delete/${id}`);
        setMessage("Elemento eliminado correctamente.");
        fetchData();
      } catch (err) {
        setError(err.response?.data?.error || "Error al eliminar el elemento.");
      }
    }
  };

  const openEditModal = (item) => {
    setItemName(item.nombre);
    setCurrentId(item.id);
    setIsEdit(true);
    setOpenModal(true);
  };

  const handleOpenModal = () => {
    setIsEdit(false);
    setItemName("");
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setItemName("");
    setIsEdit(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">{title}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenModal}>
          Añadir
        </Button>
      </Box>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.nombre}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => openEditModal(item)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal para añadir/editar */}
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
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2
          }}>
            <Typography variant="h6" mb={2}>
              {isEdit ? "Editar elemento" : "Añadir nuevo elemento"}
            </Typography>
            <TextField
              fullWidth
              label="Nombre"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              fullWidth
              onClick={isEdit ? handleEdit : handleCreate}
            >
              {isEdit ? "Guardar cambios" : "Añadir"}
            </Button>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default CrudTable;