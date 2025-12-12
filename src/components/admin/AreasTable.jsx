import React, { useState, useEffect, useContext } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Alert, Modal, Fade, Backdrop, TextField, Skeleton
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // 👈 IMPORTAR ICONO
import { useNavigate } from "react-router-dom"; // 👈 IMPORTAR HOOK
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import ConfirmDialog from "../common/ConfirmDialog";
import EmptyState from "../common/EmptyState";

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2
};

const DepartmentsTable = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ nombre: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const { user } = useContext(AuthContext); // Para saber si es admin y mostrar contexto
  const navigate = useNavigate(); // 👈 INICIALIZAR NAVIGATE

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await api.get("/departments/get?limit=0");
      setDepartments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const handleOpen = (item = null) => {
    setEditingItem(item);
    setFormData({ nombre: item ? item.nombre : "" });
    setError(""); setMessage("");
    setOpenModal(true);
  };

  const handleClose = () => setOpenModal(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/departments/put/${editingItem.id}`, formData);
        setMessage("Departamento actualizado.");
      } else {
        await api.post("/departments/post", formData);
        setMessage("Departamento creado.");
      }
      fetchDepartments();
      setTimeout(() => handleClose(), 1000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar.");
    }
  };

  const handleDelete = (item) => {
      setItemToDelete(item);
      setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
      try {
          await api.delete(`/departments/delete/${itemToDelete.id}`);
          setMessage("Departamento eliminado.");
          fetchDepartments();
      } catch (err) {
          setError("No se puede eliminar (posiblemente tiene áreas asignadas).");
      } finally {
          setDeleteDialogOpen(false);
          setItemToDelete(null);
      }
  };

  return (
    <Box>
      {/* --- CABECERA CON BOTÓN DE REGRESAR --- */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={() => navigate('/admin-settings')} color="primary" aria-label="regresar">
                <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" fontWeight="bold" color="primary">
                Departamentos
            </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
            Nuevo Depto
        </Button>
      </Box>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
              {/* Si es vista global mostramos el hotel */}
              {(user.rol === 'ROOT' || user.rol === 'CORP_VIEWER') && !user.hotelId && (
                  <TableCell sx={{ fontWeight: 'bold' }}>Hotel</TableCell>
              )}
              <TableCell sx={{ fontWeight: 'bold', width: 150 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? Array.from(new Array(3)).map((_, i) => (
               <TableRow key={i}><TableCell><Skeleton /></TableCell><TableCell><Skeleton /></TableCell></TableRow>
            )) : departments.length === 0 ? (
               <TableRow><TableCell colSpan={3}><EmptyState title="Sin departamentos" /></TableCell></TableRow>
            ) : departments.map((d) => (
              <TableRow key={d.id} hover>
                <TableCell>{d.nombre}</TableCell>
                {(user.rol === 'ROOT' || user.rol === 'CORP_VIEWER') && !user.hotelId && (
                    <TableCell>{d.hotel?.codigo || "N/A"}</TableCell>
                )}
                <TableCell>
                  <IconButton color="primary" onClick={() => handleOpen(d)}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(d)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* MODAL FORM */}
      <Modal open={openModal} onClose={handleClose} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
        <Fade in={openModal}>
          <Box sx={modalStyle} component="form" onSubmit={handleSubmit}>
            <Typography variant="h6" mb={2}>{editingItem ? "Editar Departamento" : "Nuevo Departamento"}</Typography>
            <TextField fullWidth label="Nombre" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required margin="normal" />
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Guardar</Button>
          </Box>
        </Fade>
      </Modal>

      <ConfirmDialog 
        open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onConfirm={confirmDelete}
        title="Eliminar Departamento" content={`¿Seguro que deseas eliminar "${itemToDelete?.nombre}"?`} 
      />
    </Box>
  );
};

export default DepartmentsTable;