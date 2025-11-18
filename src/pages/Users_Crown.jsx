// src/pages/Users_Crown.jsx
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
  Button,
  Alert,
  Modal,
  Fade,
  Backdrop,
  TablePagination,
  CircularProgress,
  TableSortLabel // 👈 CORRECCIÓN: Importar
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from '@mui/icons-material/Add';
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import CreateCrownUserForm from "../components/CreateCrownUserForm";
import { useSortableData } from "../hooks/useSortableData"; // 👈 CORRECCIÓN: Importar Hook

// ... (modalStyle sigue igual)
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2
};

const UsersCrownP = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  // 👈 CORRECCIÓN: Usar el hook de ordenamiento
  const { sortedItems: sortedUsers, requestSort, sortConfig } = useSortableData(users, { key: 'nombre', direction: 'ascending' });

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage]);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(`/users/get?page=${page + 1}&limit=${rowsPerPage}`);
      setUsers(response.data.data);
      setTotalUsers(response.data.totalCount);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Error al cargar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setMessage("");
    setError("");
    if (window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      try {
        await api.delete(`/users/delete/${id}`);
        setMessage("Usuario eliminado correctamente.");
        fetchUsers();
      } catch (err) {
        setError(err.response?.data?.error || "Error al eliminar el usuario.");
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/users/edit/${id}`);
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Usuarios de Crown
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenModal}
        >
          Crear Usuario
        </Button>
      </Box>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {/* 👈 CORRECCIÓN: Encabezados con TableSortLabel */}
                <TableCell sortDirection={sortConfig?.key === 'nombre' ? sortConfig.direction : false}>
                  <TableSortLabel
                    active={sortConfig?.key === 'nombre'}
                    direction={sortConfig?.key === 'nombre' ? sortConfig.direction : 'asc'}
                    onClick={() => requestSort('nombre')}
                  >
                    Nombre
                  </TableSortLabel>
                </TableCell>
                <TableCell>Correo</TableCell>
                <TableCell sortDirection={sortConfig?.key === 'departamento.nombre' ? sortConfig.direction : false}>
                  <TableSortLabel
                    active={sortConfig?.key === 'departamento.nombre'}
                    direction={sortConfig?.key === 'departamento.nombre' ? sortConfig.direction : 'asc'}
                    onClick={() => requestSort('departamento.nombre')}
                  >
                    Departamento
                  </TableSortLabel>
                </TableCell>
                <TableCell>Usuario Login</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                // 👈 CORRECCIÓN: Mapear sobre 'sortedUsers'
                sortedUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.nombre}</TableCell>
                    <TableCell>{u.correo}</TableCell>
                    <TableCell>{u.departamento?.nombre || "N/A"}</TableCell>
                    <TableCell>{u.usuario_login || "N/A"}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(u.id)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(u.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalUsers}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
        />
      </Paper>

      {/* ... (Modal sigue igual) ... */}
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
            <CreateCrownUserForm
              onClose={handleCloseModal}
              onUserCreated={fetchUsers}
              setMessage={setMessage}
              setError={setError}
            />
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default UsersCrownP;