// src/components/CrudTable.jsx
import React, { useState, useEffect } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, TextField, Button, Alert, Modal, Fade, Backdrop, TablePagination,
  TableSortLabel, Skeleton
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from '@mui/icons-material/Add';
import api from "../api/axios";

// 👇 Nuevos componentes
import ConfirmDialog from "./common/ConfirmDialog";
import EmptyState from "./common/EmptyState";

const CrudTable = ({ title, apiUrl }) => {
  const [data, setData] = useState([]);
  const [itemName, setItemName] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estado para Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  const [sortConfig, setSortConfig] = useState({ key: 'nombre', direction: 'asc' });

  useEffect(() => {
    fetchData();
  }, [apiUrl, page, rowsPerPage, sortConfig]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const sortParam = `&sortBy=${sortConfig.key}&order=${sortConfig.direction}`;
      const response = await api.get(`${apiUrl}/get?page=${page + 1}&limit=${rowsPerPage}${sortParam}`);
      setData(response.data.data || response.data);
      setTotalCount(response.data.totalCount || response.data.length);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error al cargar los datos.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSort = (key) => {
    const isAsc = sortConfig.key === key && sortConfig.direction === 'asc';
    setSortConfig({ key, direction: isAsc ? 'desc' : 'asc' });
  };

  const handleCreate = async () => {
    try { await api.post(`${apiUrl}/post`, { nombre: itemName }); setMessage("Creado."); setPage(0); fetchData(); setItemName(""); setOpenModal(false); } catch(e) { setError("Error."); }
  };
  const handleEdit = async () => {
    try { await api.put(`${apiUrl}/put/${currentId}`, { nombre: itemName }); setMessage("Actualizado."); fetchData(); setItemName(""); setOpenModal(false); setIsEdit(false); } catch(e) { setError("Error."); }
  };

  // 👇 Lógica Delete Actualizada
  const handleOpenDelete = (item) => {
      setItemToDelete(item);
      setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if(!itemToDelete) return;
    try { 
        await api.delete(`${apiUrl}/delete/${itemToDelete.id}`); 
        setMessage("Eliminado."); 
        fetchData(); 
    } catch(e) { 
        setError("Error al eliminar."); 
    } finally {
        setDeleteDialogOpen(false);
        setItemToDelete(null);
    }
  };

  const openEditModal = (item) => { setItemName(item.nombre); setCurrentId(item.id); setIsEdit(true); setOpenModal(true); };
  const handleOpenModal = () => { setIsEdit(false); setItemName(""); setOpenModal(true); };
  const handleCloseModal = () => { setOpenModal(false); };
  const handleChangePage = (e, n) => setPage(n);
  const handleChangeRowsPerPage = (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); };

  const headerStyle = { fontWeight: 'bold', color: 'text.primary' };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" color="primary" fontWeight="bold">{title}</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenModal}>Añadir</Button>
      </Box>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper variant="outlined">
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                <TableCell sx={headerStyle}>
                  <TableSortLabel
                    active={sortConfig.key === 'nombre'}
                    direction={sortConfig.key === 'nombre' ? sortConfig.direction : 'asc'}
                    onClick={() => handleRequestSort('nombre')}
                  >
                    Nombre
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={headerStyle} align="right">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                 // 👇 SKELETONS
                 Array.from(new Array(5)).map((_, i) => (
                    <TableRow key={i}>
                        <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                        <TableCell align="right"><Skeleton variant="circular" width={30} height={30} sx={{ display:'inline-block' }} /></TableCell>
                    </TableRow>
                 ))
              ) : data.length === 0 ? (
                 // 👇 EMPTY STATE
                 <TableRow><TableCell colSpan={2}>
                    <EmptyState title="Catálogo vacío" description="No hay elementos registrados aún."/>
                 </TableCell></TableRow>
              ) : (
                data.map((item) => ( 
                  <TableRow key={item.id} hover>
                    <TableCell>{item.nombre}</TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => openEditModal(item)} size="small"><EditIcon /></IconButton>
                      <IconButton color="error" onClick={() => handleOpenDelete(item)} size="small"><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]} component="div" count={totalCount}
          rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Modal open={openModal} onClose={handleCloseModal} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
        <Fade in={openModal}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2 }}>
            <Typography variant="h6" mb={2} color="text.primary">{isEdit ? "Editar" : "Añadir"}</Typography>
            <TextField fullWidth label="Nombre" value={itemName} onChange={(e) => setItemName(e.target.value)} sx={{ mb: 2 }} />
            <Button variant="contained" fullWidth onClick={isEdit ? handleEdit : handleCreate} color="primary">{isEdit ? "Guardar" : "Añadir"}</Button>
          </Box>
        </Fade>
      </Modal>

      {/* 👇 DIÁLOGO */}
      <ConfirmDialog 
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="¿Eliminar Registro?"
        content={`¿Seguro que deseas eliminar "${itemToDelete?.nombre}"? Esta acción podría afectar a los equipos que usen este valor.`}
      />
    </Box>
  );
};

export default CrudTable;