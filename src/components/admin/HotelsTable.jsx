import React, { useState, useEffect } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Alert, Modal, Fade, Backdrop, TextField, FormControlLabel, Switch
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../../api/axios";

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2
};

const HotelsTable = () => {
  const [hotels, setHotels] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ nombre: "", codigo: "", direccion: "", activo: true });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchHotels = async () => {
    try {
      const res = await api.get("/hotels/admin/list");
      setHotels(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchHotels(); }, []);

  const handleOpen = (item = null) => {
    setEditingItem(item);
    setFormData(item ? { ...item } : { nombre: "", codigo: "", direccion: "", activo: true });
    setError(""); setMessage("");
    setOpenModal(true);
  };

  const handleClose = () => setOpenModal(false);

  const handleDelete = async (id) => {
    if(!window.confirm("¿Seguro que quieres dar de baja este hotel?")) return;
    try {
      await api.delete(`/hotels/delete/${id}`);
      fetchHotels();
    } catch (err) { setError("Error al eliminar."); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/hotels/put/${editingItem.id}`, formData);
        setMessage("Hotel actualizado.");
      } else {
        await api.post("/hotels/post", formData);
        setMessage("Hotel creado.");
      }
      fetchHotels();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar.");
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" fontWeight="bold" color="primary">Gestión de Hoteles</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>Nuevo Hotel</Button>
      </Box>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Código</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Dirección</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hotels.map(h => (
              <TableRow key={h.id}>
                <TableCell>{h.nombre}</TableCell>
                <TableCell>{h.codigo}</TableCell>
                <TableCell>{h.direccion}</TableCell>
                <TableCell>{h.activo ? "Activo" : "Inactivo"}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleOpen(h)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(h.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={openModal} onClose={handleClose} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
        <Fade in={openModal}>
          <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
            <Typography variant="h6" mb={2}>{editingItem ? "Editar Hotel" : "Crear Hotel"}</Typography>
            <TextField fullWidth label="Nombre" margin="normal" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required />
            <TextField fullWidth label="Código (ej. CPC-CUN)" margin="normal" value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} required />
            <TextField fullWidth label="Dirección" margin="normal" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} />
            <FormControlLabel 
                control={<Switch checked={formData.activo} onChange={e => setFormData({...formData, activo: e.target.checked})} />} 
                label="Activo" 
                sx={{ mt: 2 }}
            />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>Guardar</Button>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default HotelsTable;