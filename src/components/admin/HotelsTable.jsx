import React, { useState, useEffect, useContext } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Alert, Modal, Fade, Backdrop, TextField, FormControlLabel, Switch, Skeleton, Tooltip
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccountTreeIcon from '@mui/icons-material/AccountTree'; 
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import ConfirmDialog from "../common/ConfirmDialog";
import EmptyState from "../common/EmptyState";

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: 450, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2
};

const HotelsTable = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [formData, setFormData] = useState({ 
      nombre: "", codigo: "", direccion: "", ciudad: "", 
      razonSocial: "", diminutivo: "", 
      activo: true,
      autoStructure: true
  });
  
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { refreshHotelList } = useContext(AuthContext);

  const fetchHotels = async () => {
    setLoading(true);
    setError("");
    try {

      const res = await api.get("/hotels/admin/list");

      let data = [];
      if (Array.isArray(res)) {
          data = res;
      } else if (res && Array.isArray(res.data)) {
          data = res.data;
      } else if (res && res.data && Array.isArray(res.data.data)) {
          data = res.data.data;
      }

      setHotels(data);
      
      if (!Array.isArray(data)) {
          setError("Error: El formato de datos recibido no es válido.");
      }

    } catch (err) {
      console.error("Error al cargar hoteles:", err);
      const msg = err.response?.data?.error || err.response?.data?.message || "No se pudo conectar con el servidor.";
      setError(`Error ${err.response?.status || ''}: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
      fetchHotels(); 
  }, []);

  const handleOpen = (item = null) => {
    setEditingItem(item);
    if (item) {
        setFormData({ 
            ...item, 
            razonSocial: item.razonSocial || "", 
            diminutivo: item.diminutivo || "",
            ciudad: item.ciudad || "" 
        });
    } else {
        setFormData({ 
            nombre: "", codigo: "", direccion: "", ciudad: "", 
            razonSocial: "", diminutivo: "", 
            activo: true,
            autoStructure: true 
        });
    }
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
        setError("Error al eliminar el hotel."); 
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
        const { autoStructure, ...updateData } = formData;
        await api.put(`/hotels/put/${editingItem.id}`, updateData);
        setMessage("Hotel actualizado correctamente.");
      } else {
        await api.post("/hotels/post", formData);
        setMessage("Hotel creado exitosamente.");
      }
      fetchHotels();
      refreshHotelList();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar los cambios.");
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold" color="primary">Gestión de Hoteles</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>Nuevo Hotel</Button>
      </Box>

      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Código</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Razón Social</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Ciudad</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Acciones</TableCell>
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
                    <TableCell align="right"><Skeleton variant="circular" width={30} height={30} sx={{ ml: 'auto' }} /></TableCell>
                </TableRow>
            )) : hotels.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6}>
                        <EmptyState 
                            title="No se encontraron hoteles" 
                            description={error ? "Hubo un error al cargar los datos." : "Registra la primera propiedad para comenzar."} 
                        />
                    </TableCell>
                </TableRow>
            ) : hotels.map(h => (
              <TableRow key={h.id} hover>
                <TableCell>{h.nombre}</TableCell>
                <TableCell>{h.codigo}</TableCell>
                <TableCell>{h.razonSocial || "—"}</TableCell>
                <TableCell>{h.ciudad || "—"}</TableCell>
                <TableCell>
                    <Box sx={{ color: h.activo ? 'success.main' : 'error.main', fontWeight: 'medium' }}>
                        {h.activo ? "Activo" : "Inactivo"}
                    </Box>
                </TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleOpen(h)} size="small"><EditIcon fontSize="small" /></IconButton>
                  <IconButton color="error" onClick={() => handleOpenDelete(h)} size="small"><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={openModal} onClose={handleClose} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
        <Fade in={openModal}>
          <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
            <Typography variant="h6" mb={2} fontWeight="bold">{editingItem ? "Editar Hotel" : "Crear Hotel"}</Typography>
            
            <TextField fullWidth label="Nombre" margin="normal" size="small" value={formData.nombre} onChange={e => setFormData({...formData, nombre: e.target.value})} required />
            <TextField fullWidth label="Código" margin="normal" size="small" value={formData.codigo} onChange={e => setFormData({...formData, codigo: e.target.value})} required />
            
            <TextField 
                fullWidth 
                label="Razón Social" 
                margin="normal" 
                size="small"
                value={formData.razonSocial} 
                onChange={e => setFormData({...formData, razonSocial: e.target.value})} 
                placeholder="Razón Social"
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField 
                    fullWidth 
                    label="Diminutivo" 
                    margin="normal" 
                    size="small"
                    value={formData.diminutivo} 
                    onChange={e => setFormData({...formData, diminutivo: e.target.value})} 
                    placeholder="Diminutivo"
                />
                <TextField 
                    fullWidth 
                    label="Dirección" 
                    margin="normal" 
                    size="small"
                    value={formData.ciudad} 
                    onChange={e => setFormData({...formData, ciudad: e.target.value})} 
                    placeholder="Municiío, estado"
                />
            </Box>

            <TextField fullWidth label="Dirección" margin="normal" size="small" value={formData.direccion} onChange={e => setFormData({...formData, direccion: e.target.value})} />
            
            <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                <FormControlLabel 
                    control={<Switch checked={formData.activo} onChange={e => setFormData({...formData, activo: e.target.checked})} />} 
                    label="Hotel Activo en Sistema" 
                />

                {!editingItem && (
                    <Tooltip title="Crea automáticamente los departamentos y sus áreas estándar." arrow>
                        <FormControlLabel 
                            control={<Switch checked={formData.autoStructure} onChange={e => setFormData({...formData, autoStructure: e.target.checked})} color="success" />} 
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AccountTreeIcon fontSize="small" color={formData.autoStructure ? "success" : "disabled"} />
                                    <Typography variant="body2" fontWeight={formData.autoStructure ? "bold" : "normal"}>
                                        Generar estructura estándar
                                    </Typography>
                                </Box>
                            }
                            sx={{ mt: 1, display: 'block' }}
                        />
                    </Tooltip>
                )}
            </Box>

            <Button type="submit" variant="contained" fullWidth sx={{ mt: 3, py: 1.2, fontWeight: 'bold' }}>
                {editingItem ? "Actualizar Hotel" : "Registrar Hotel"}
            </Button>
          </Box>
        </Fade>
      </Modal>

      <ConfirmDialog 
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="¿Eliminar Hotel?"
        content={`Estás a punto de dar de baja el hotel "${itemToDelete?.nombre}". Esta acción no se puede deshacer.`}
        isLoading={actionLoading}
      />
    </Box>
  );
};

export default HotelsTable;