// src/components/admin/AreasTable.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Alert, Modal, Fade,
  Backdrop, TablePagination, CircularProgress, TableSortLabel
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../../api/axios";
import CreateAreaForm from "../CreateAreaForm";

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: 500, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2
};

const AreasTable = () => {
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  // Estado para Modal (Crear y Editar)
  const [openModal, setOpenModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: 'nombre', direction: 'asc' });

  const fetchAreas = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const sortParam = `&sortBy=${sortConfig.key}&order=${sortConfig.direction}`;
      const response = await api.get(`/areas/get?page=${page + 1}&limit=${rowsPerPage}${sortParam}`);
      
      if (response.data.data) {
          setAreas(response.data.data);
          setTotalCount(response.data.totalCount);
      } else {
          setAreas(response.data);
          setTotalCount(response.data.length);
      }
    } catch (err) {
      console.error("Error fetching areas:", err);
      setError("Error al cargar las áreas.");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, sortConfig]);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este registro?")) return;
    try {
        await api.delete(`/areas/delete/${id}`);
        setMessage("Área eliminada correctamente.");
        fetchAreas();
    } catch (err) {
      setError(err.response?.data?.error || "Error al eliminar.");
    }
  };

  const handleCreateClick = () => {
    setEditingItem(null);
    setOpenModal(true);
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingItem(null);
  };

  const handleRequestSort = (key) => {
    const isAsc = sortConfig.key === key && sortConfig.direction === 'asc';
    setSortConfig({ key, direction: isAsc ? 'desc' : 'asc' });
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const headerStyle = { fontWeight: 'bold', color: 'text.primary' };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" color="primary" fontWeight="bold">Gestión de Áreas</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleCreateClick}>
            Nueva Área
        </Button>
      </Box>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                <TableCell sx={headerStyle}>
                    <TableSortLabel active={sortConfig.key === 'nombre'} direction={sortConfig.direction} onClick={() => handleRequestSort('nombre')}>
                        Nombre Área
                    </TableSortLabel>
                </TableCell>
                <TableCell sx={headerStyle}>
                    <TableSortLabel active={sortConfig.key === 'departamento.nombre'} direction={sortConfig.direction} onClick={() => handleRequestSort('departamento.nombre')}>
                        Departamento
                    </TableSortLabel>
                </TableCell>
                <TableCell sx={headerStyle}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={3} align="center"><CircularProgress /></TableCell></TableRow>
              ) : (
                areas.map((area) => (
                  <TableRow key={area.id}>
                    <TableCell>{area.nombre}</TableCell>
                    <TableCell>{area.departamento?.nombre || "N/A"}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleEditClick(area)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(area.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {!loading && areas.length === 0 && (
                  <TableRow><TableCell colSpan={3} align="center">No se encontraron áreas.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
           rowsPerPageOptions={[5, 10, 25]} component="div" count={totalCount} 
           rowsPerPage={rowsPerPage} page={page}
           onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Modal open={openModal} onClose={handleCloseModal} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
        <Fade in={openModal}>
          <Box sx={modalStyle}>
            <CreateAreaForm 
                onClose={handleCloseModal} 
                onSuccess={() => { fetchAreas(); setMessage(editingItem ? "Actualizado." : "Creado."); }} 
                initialData={editingItem} 
            />
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default AreasTable;