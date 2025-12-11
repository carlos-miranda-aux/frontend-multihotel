import React, { useState, useEffect, useContext } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Alert, Modal, Fade, Backdrop, TextField, FormControlLabel, Switch, Skeleton
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import ConfirmDialog from "../common/ConfirmDialog";
import EmptyState from "../common/EmptyState";

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2
};

const HotelsTable = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Estado del formulario actualizado con los nuevos campos
  const [formData, setFormData] = useState({ 
      nombre: "", codigo: "", direccion: "", ciudad: "", 
      razonSocial: "", diminutivo: "", 
      activo: true 
  });
  
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { refreshHotelList } = useContext(AuthContext);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await api.get("/hotels/admin/list");
      setHotels(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHotels(); }, []);

  const handleOpen = (item = null) => {
    setEditingItem(item);
    // Cargar datos existentes o valores por defecto
    setFormData(item ? { 
        ...item, 
        razonSocial: item.razonSocial || "", 
        diminutivo: item.diminutivo || "" 
    } : { 
        nombre: "", codigo: "", direccion: "", ciudad: "", 
        razonSocial: "", diminutivo: "", 
        activo: true 
    });
    setError(""); setMessage("");
    setOpenModal(true);
  };

  const handleClose = () => setOpenModal(false);

  const handleOpenDelete = (item) => {
      setItemToDelete(item);
      setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if(!itemToDelete) return;
    
    setActionLoading(true); 
    try {
      await api.delete(`/hotels/delete/${itemToDelete.id}`);
      setMessage("Hotel eliminado correctamente.");
      fetchHotels();
      refreshHotelList();
      setDeleteDialogOpen(false);
    } catch (err) { 
        setError("Error al eliminar."); 
        setDeleteDialogOpen(false);
    } finally {
        setActionLoading(false); 
        setItemToDelete(null);
    }
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
      refreshHotelList();
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
              <TableCell sx={{ fontWeight: 'bold' }}>Razón Social</TableCell> {/* Nueva Columna */}
              <TableCell sx={{ fontWeight: 'bold' }}>Ciudad</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? Array.from(new Array(3)).map((_, i) => (
                <TableRow key={i}>
                    <TableCell><Skeleton variant="text" /></TableCell>
                    <TableCell><Skeleton variant="text" width={50} /></TableCell>
                    <TableCell><Skeleton variant="text" /></TableCell>
                    <TableCell><Skeleton variant="text" /></TableCell>
                    <TableCell><Skeleton variant="text" width={40} /></TableCell>
                    <TableCell><Skeleton variant="circular" width={30} height={30} /></TableCell>
                </TableRow>
            )) : hotels.length === 0 ? (
                <TableRow><TableCell colSpan={6}><EmptyState title="No hay hoteles" description="Registra la primera propiedad para comenzar." /></TableCell></TableRow>
            ) : hotels.map(h => (
              <TableRow key={h.id} hover>
                <TableCell>{h.nombre}</TableCell>
                <TableCell>{h.codigo}</TableCell>
                <TableCell>{h.razonSocial || "—"}</TableCell> {/* Dato Razón Social */}
                <TableCell>{h.ciudad || "—"}</TableCell>
                <TableCell>{h.activo ? "Activo" : "Inactivo"}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleOpen(h)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => handleOpenDelete(h)}><DeleteIcon /></IconButton>
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
            
            <TextField fullWidth label="Nombre" margin="normal" size="small" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required />
            <TextField fullWidth label="Código (ej. CPC-CUN)" margin="normal" size="small" value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} required />
            
            {/* Campos Nuevos */}
            <TextField 
                fullWidth 
                label="Razón Social (Para Documentos)" 
                margin="normal" 
                size="small"
                value={formData.razonSocial} 
                onChange={e => setFormData({...formData, razonSocial: e.target.value})} 
                placeholder="Ej: HOTELERA CANCO S.A. DE C.V."
            />
            <TextField 
                fullWidth 
                label="Diminutivo / Alias (Para Documentos)" 
                margin="normal" 
                size="small"
                value={formData.diminutivo} 
                onChange={e => setFormData({...formData, diminutivo: e.target.value})} 
                placeholder="Ej: CANCO"
            />

            <TextField 
                fullWidth 
                label="Ciudad (Lugar de Emisión)" 
                margin="normal" 
                size="small"
                value={formData.ciudad} 
                onChange={e => setFormData({...formData, ciudad: e.target.value})} 
            />

            <TextField fullWidth label="Dirección" margin="normal" size="small" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} />
            
            <FormControlLabel 
                control={<Switch checked={formData.activo} onChange={e => setFormData({...formData, activo: e.target.checked})} />} 
                label="Activo" 
                sx={{ mt: 1 }}
            />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Guardar</Button>
          </Box>
        </Fade>
      </Modal>

      <ConfirmDialog 
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="¿Eliminar Hotel?"
        content={`Estás a punto de dar de baja el hotel "${itemToDelete?.nombre}".`}
        isLoading={actionLoading}
      />
    </Box>
  );
};

export default HotelsTable;