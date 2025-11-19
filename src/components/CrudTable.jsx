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
  Backdrop,
  TablePagination, // ✅ Habilitado
  CircularProgress, // ✅ Habilitado
  TableSortLabel // 👈 Importado para el sorting
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from '@mui/icons-material/Add';
import api from "../api/axios";
import { useSortableData } from "../hooks/useSortableData"; // 👈 Importado el hook de sorting


const CrudTable = ({ title, apiUrl }) => {
  const [data, setData] = useState([]);
  const [itemName, setItemName] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estados de Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // 👈 1. Inicializar el hook de sorting (por defecto por nombre)
  const { sortedItems, requestSort, sortConfig } = useSortableData(data, { key: 'nombre', direction: 'ascending' });


  useEffect(() => {
    fetchData();
  }, [apiUrl, page, rowsPerPage]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // ENVIAR PARÁMETROS DE PAGINACIÓN
      const response = await api.get(`${apiUrl}/get?page=${page + 1}&limit=${rowsPerPage}`);
      
      // LEER LA NUEVA ESTRUCTURA PAGINADA DEL BACKEND
      setData(response.data.data || response.data);
      setTotalCount(response.data.totalCount || response.data.length);

    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Error al cargar los datos.");
    } finally {
      setLoading(false);
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
      setPage(0); // Volver a la primera página al crear
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
        // Retrocede la página si se elimina el último elemento
        if (data.length === 1 && page > 0) {
            setPage(page - 1);
        } else {
            fetchData();
        }
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
  
  // HANDLERS DE PAGINACIÓN
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // Resetear a la primera página
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

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {/* 👈 2. Implementar TableSortLabel para ID */}
                <TableCell sortDirection={sortConfig?.key === 'id' ? sortConfig.direction : false}>
                  <TableSortLabel
                    active={sortConfig?.key === 'id'}
                    direction={sortConfig?.key === 'id' ? sortConfig.direction : 'asc'}
                    onClick={() => requestSort('id')}
                  >
                    ID
                  </TableSortLabel>
                </TableCell>
                
                {/* 👈 3. Implementar TableSortLabel para Nombre */}
                <TableCell sortDirection={sortConfig?.key === 'nombre' ? sortConfig.direction : false}>
                  <TableSortLabel
                    active={sortConfig?.key === 'nombre'}
                    direction={sortConfig?.key === 'nombre' ? sortConfig.direction : 'asc'}
                    onClick={() => requestSort('nombre')}
                  >
                    Nombre
                  </TableSortLabel>
                </TableCell>
                
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                 <TableRow>
                    <TableCell colSpan={3} align="center">
                       <CircularProgress />
                    </TableCell>
                  </TableRow>
              ) : (
                // 👈 4. Usar sortedItems para renderizar
                sortedItems.map((item) => ( 
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
                ))
              )}
               {!loading && data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No hay datos.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* COMPONENTE DE PAGINACIÓN */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
        />

      </Paper>

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