// src/components/admin/UserSystemTable.jsx
import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Alert, Modal, Fade,
  Backdrop, TablePagination, CircularProgress, TableSortLabel, Chip
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import CreateSystemUserForm from "../CreateSystemUserForm";
import { ROLES } from "../../config/constants"; // 👈 Importar

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: 500, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2
};

const UsersSystemTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: 'nombre', direction: 'asc' });

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isRoot = user?.rol === ROLES.ROOT; // 👈 Check Root

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const sortParam = `&sortBy=${sortConfig.key}&order=${sortConfig.direction}`;
      const response = await api.get(`/auth/get?page=${page + 1}&limit=${rowsPerPage}${sortParam}`);
      
      if (response.data.data) {
          setUsers(response.data.data);
          setTotalCount(response.data.totalCount);
      } else {
          setUsers(response.data);
          setTotalCount(response.data.length);
      }
    } catch (err) {
      console.error(err);
      setError("Error al cargar usuarios.");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, sortConfig]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
      await api.delete(`/auth/delete/${id}`);
      setMessage("Usuario eliminado.");
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || "Error al eliminar.");
    }
  };

  const handleRequestSort = (key) => {
    const isAsc = sortConfig.key === key && sortConfig.direction === 'asc';
    setSortConfig({ key, direction: isAsc ? 'desc' : 'asc' });
  };
  const handleChangePage = (e, p) => setPage(p);
  const handleChangeRowsPerPage = (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); };
  const handleEditUser = (id) => navigate(`/user-manager/edit/${id}`);
  
  const headerStyle = { fontWeight: 'bold', color: 'text.primary' };

  // Helper nombre hotel
  const getHotelName = (id) => {
      if (id === 1) return "Cancún";
      if (id === 2) return "Sensira";
      if (id === 3) return "Corporativo";
      return "Global";
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" color="primary" fontWeight="bold">Gestión de Usuarios del Sistema</Typography>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setOpenModal(true)}>Crear Usuario</Button>
      </Box>
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                {/* Columna Hotel para Root */}
                {isRoot && <TableCell sx={headerStyle}>Hotel</TableCell>}
                
                <TableCell sx={headerStyle}>
                    <TableSortLabel active={sortConfig.key === 'nombre'} direction={sortConfig.direction} onClick={() => handleRequestSort('nombre')}>Nombre</TableSortLabel>
                </TableCell>
                <TableCell sx={headerStyle}>Usuario</TableCell>
                <TableCell sx={headerStyle}>Correo</TableCell>
                <TableCell sx={headerStyle}>Rol</TableCell>
                <TableCell sx={headerStyle}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={isRoot ? 6 : 5} align="center"><CircularProgress /></TableCell></TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    {isRoot && (
                        <TableCell>
                            <Chip label={getHotelName(u.hotelId)} size="small" variant="outlined" />
                        </TableCell>
                    )}
                    <TableCell>{u.nombre}</TableCell>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.rol}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleEditUser(u.id)} disabled={user.id === u.id}><EditIcon /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(u.id)} disabled={user.id === u.id}><DeleteIcon /></IconButton>
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

      <Modal open={openModal} onClose={() => setOpenModal(false)} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
        <Fade in={openModal}>
          <Box sx={modalStyle}>
            <CreateSystemUserForm onClose={() => setOpenModal(false)} onUserCreated={fetchUsers} setMessage={setMessage} setError={setError} />
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default UsersSystemTable;