// src/pages/AdminSettings.jsx
import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Modal,
  Fade,
  Backdrop,
  TablePagination,
  CircularProgress,
  TableSortLabel // 👈 CORRECCIÓN: Importar
} from "@mui/material";
import ListIcon from '@mui/icons-material/List';
import PeopleIcon from '@mui/icons-material/People';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import CrudTable from "../components/CrudTable";
import CreateSystemUserForm from "../components/CreateSystemUserForm";
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

const AdminSettings = () => {
  const [activeTable, setActiveTable] = useState(null);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  // 👈 CORRECCIÓN: Usar el hook de ordenamiento
  const { sortedItems: sortedUsers, requestSort, sortConfig } = useSortableData(users, { key: 'nombre', direction: 'ascending' });

  const tables = [
    { name: "Departamentos", url: "/departments" },
    { name: "Sistemas Operativos", url: "/operating-systems" },
    { name: "Tipos de Dispositivo", url: "/device-types" },
    { name: "Estados de Dispositivo", url: "/device-status" },
    { name: "Gestión de Usuarios", url: "/auth" },
  ];

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(`/auth/get?page=${page + 1}&limit=${rowsPerPage}`);
      setUsers(response.data.data);
      setTotalUsers(response.data.totalCount);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Error al cargar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage]);

  useEffect(() => {
    if (activeTable === "Gestión de Usuarios") {
      fetchUsers();
    }
  }, [activeTable, fetchUsers]);

  const handleDelete = async (id) => {
    setMessage("");
    setError("");
    if (window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      try {
        await api.delete(`/auth/delete/${id}`);
        setMessage("Usuario eliminado correctamente.");
        fetchUsers();
      } catch (err) {
        setError(err.response?.data?.error || "Error al eliminar el usuario.");
      }
    }
  };

  const handleEditUser = (id) => {
    navigate(`/user-manager/edit/${id}`);
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

  const renderActiveTable = () => {
    if (!activeTable) {
      return (
        <Typography variant="body1" sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
          Selecciona una tabla para ver y editar su contenido.
        </Typography>
      );
    }

    if (activeTable === "Gestión de Usuarios") {
      return (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">
              Gestión de Usuarios del Sistema
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
                    <TableCell sortDirection={sortConfig?.key === 'username' ? sortConfig.direction : false}>
                      <TableSortLabel
                        active={sortConfig?.key === 'username'}
                        direction={sortConfig?.key === 'username' ? sortConfig.direction : 'asc'}
                        onClick={() => requestSort('username')}
                      >
                        Usuario
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Correo</TableCell>
                    <TableCell sortDirection={sortConfig?.key === 'rol' ? sortConfig.direction : false}>
                      <TableSortLabel
                        active={sortConfig?.key === 'rol'}
                        direction={sortConfig?.key === 'rol' ? sortConfig.direction : 'asc'}
                        onClick={() => requestSort('rol')}
                      >
                        Rol
                      </TableSortLabel>
                    </TableCell>
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
                        <TableCell>{u.username}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{u.rol}</TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => handleEditUser(u.id)}
                            disabled={user.id === u.id}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(u.id)}
                            disabled={user.id === u.id}
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
        </Box>
      );
    }

    // ⚠️ AVISO: Las tablas CRUD (Departamentos, SO, etc.)
    // no están paginadas porque usan un componente genérico 'CrudTable'.
    // Si tienen muchos datos, también habría que refactorizar 'CrudTable.jsx'.
    const tableData = tables.find(t => t.name === activeTable);
    return <CrudTable title={tableData.name} apiUrl={tableData.url} />;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Configuración de Administrador
      </Typography>

      <Typography variant="h6" sx={{ mb: 2 }}>
        Selecciona una tabla para gestionar:
      </Typography>

      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
        {tables.map((table) => (
          <Button
            key={table.name}
            variant={activeTable === table.name ? "contained" : "outlined"}
            onClick={() => {
              setActiveTable(table.name);
              setPage(0);
            }}
            startIcon={table.name === "Gestión de Usuarios" ? <PeopleIcon /> : <ListIcon />}
          >
            {table.name}
          </Button>
        ))}
      </Stack>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ minHeight: 400 }}>
        {renderActiveTable()}
      </Box>
      
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
            <CreateSystemUserForm
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

export default AdminSettings;