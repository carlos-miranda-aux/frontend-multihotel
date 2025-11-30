// src/components/CrudTable.jsx
import React, { useState, useEffect } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, TextField, Button, Alert, Modal, Fade, Backdrop, TablePagination, CircularProgress,
  TableSortLabel
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from '@mui/icons-material/Add';
import api from "../api/axios";
import "../components/styles/CrudTable.css";
import "../pages/styles/ConfigButtons.css";

const CrudTable = ({ title, apiUrl }) => {
  const [data, setData] = useState([]);
  const [itemName, setItemName] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // 👇 Estado de ordenamiento
  const [sortConfig, setSortConfig] = useState({ key: 'nombre', direction: 'asc' });

  useEffect(() => {
    fetchData();
  }, [apiUrl, page, rowsPerPage, sortConfig]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 👇 Enviamos orden
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

  // ... (handleCreate, handleEdit, handleDelete, modal handlers son iguales) ...
  const handleCreate = async () => { /* ... código igual ... */ 
    try { await api.post(`${apiUrl}/post`, { nombre: itemName }); setMessage("Creado."); setPage(0); fetchData(); setItemName(""); setOpenModal(false); } catch(e) { setError("Error."); }
  };
  const handleEdit = async () => { /* ... código igual ... */
    try { await api.put(`${apiUrl}/put/${currentId}`, { nombre: itemName }); setMessage("Actualizado."); fetchData(); setItemName(""); setOpenModal(false); setIsEdit(false); } catch(e) { setError("Error."); }
  };
  const handleDelete = async (id) => { /* ... código igual ... */
    if(window.confirm("¿Eliminar?")) { try { await api.delete(`${apiUrl}/delete/${id}`); setMessage("Eliminado."); fetchData(); } catch(e) { setError("Error."); } }
  };
  const openEditModal = (item) => { setItemName(item.nombre); setCurrentId(item.id); setIsEdit(true); setOpenModal(true); };
  const handleOpenModal = () => { setIsEdit(false); setItemName(""); setOpenModal(true); };
  const handleCloseModal = () => { setOpenModal(false); };
  const handleChangePage = (e, n) => setPage(n);
  const handleChangeRowsPerPage = (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); };

  const headerStyle = { fontWeight: 'bold', color: '#333' };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">{title}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenModal} className="crud-add-button">Añadir</Button>
      </Box>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={headerStyle} sortDirection={sortConfig.key === 'nombre' ? sortConfig.direction : false}>
                  <TableSortLabel
                    active={sortConfig.key === 'nombre'}
                    direction={sortConfig.key === 'nombre' ? sortConfig.direction : 'asc'}
                    onClick={() => handleRequestSort('nombre')}
                  >
                    Nombre
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={headerStyle}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                 <TableRow><TableCell colSpan={2} align="center"><CircularProgress /></TableCell></TableRow>
              ) : (
                data.map((item) => ( 
                  <TableRow key={item.id}>
                    <TableCell>{item.nombre}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => openEditModal(item)} className="crud-edit-icon"><EditIcon /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(item.id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
               {!loading && data.length === 0 && <TableRow><TableCell colSpan={2} align="center">No hay datos.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]} component="div" count={totalCount}
          rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
        />
      </Paper>

      <Modal open={openModal} onClose={handleCloseModal} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
        <Fade in={openModal}>
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2 }}>
            <Typography variant="h6" mb={2} className="modal-title-color">{isEdit ? "Editar" : "Añadir"}</Typography>
            <TextField fullWidth label="Nombre" value={itemName} onChange={(e) => setItemName(e.target.value)} sx={{ mb: 2 }} />
            <Button variant="contained" fullWidth onClick={isEdit ? handleEdit : handleCreate} className="crud-add-button">{isEdit ? "Guardar" : "Añadir"}</Button>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default CrudTable;