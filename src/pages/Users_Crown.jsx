// src/pages/Users_Crown.jsx
import React, { useState, useEffect, useCallback, useContext } from "react"; // 👈 useContext
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Button, Alert, Modal, Fade, Backdrop, TablePagination, CircularProgress,
  TableSortLabel, TextField, Chip // 👈 Chip
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from '@mui/icons-material/Add';
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import CreateCrownUserForm from "../components/CreateCrownUserForm";
import ImportButton from "../components/ImportButton";
import { AuthContext } from "../context/AuthContext"; // 👈 Contexto
import { ROLES } from "../config/constants"; // 👈 Roles

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: 500, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2
};

const UsersCrownP = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // 👈 LOGICA ROOT
  const { user } = useContext(AuthContext);
  const isRoot = user?.rol === ROLES.ROOT;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [search, setSearch] = useState(""); 

  const [sortConfig, setSortConfig] = useState({ key: 'nombre', direction: 'asc' });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const sortParam = `&sortBy=${sortConfig.key}&order=${sortConfig.direction}`;
      const response = await api.get(`/users/get?page=${page + 1}&limit=${rowsPerPage}&search=${search}${sortParam}`);
      setUsers(response.data.data);
      setTotalUsers(response.data.totalCount);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Error al cargar la lista de usuarios.");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, sortConfig]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearchChange = (e) => { setSearch(e.target.value); setPage(0); };
  const handleRequestSort = (key) => {
    const isAsc = sortConfig.key === key && sortConfig.direction === 'asc';
    setSortConfig({ key, direction: isAsc ? 'desc' : 'asc' });
  };
  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      try {
        await api.delete(`/users/delete/${id}`);
        setMessage("Usuario eliminado.");
        fetchUsers();
      } catch (err) {
        setError(err.response?.data?.error || "Error al eliminar.");
      }
    }
  };
  const handleEdit = (id) => navigate(`/users/edit/${id}`);
  const handleChangePage = (e, n) => setPage(n);
  const handleChangeRowsPerPage = (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); };

  const headerStyle = { fontWeight: 'bold', color: 'text.primary' };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" color="primary" fontWeight="bold">Usuarios de Staff</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField label="Buscar usuario..." variant="outlined" size="small" value={search} onChange={handleSearchChange} />
          <ImportButton endpoint="/users/import" onSuccess={fetchUsers} label="Importar" />
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setOpenModal(true)}>Crear Usuario</Button>
        </Box>
      </Box>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}>
                {/* 👇 COLUMNA ROOT */}
                {isRoot && <TableCell sx={headerStyle}>Hotel</TableCell>}
                
                <TableCell sx={headerStyle}>
                  <TableSortLabel active={sortConfig.key === 'nombre'} direction={sortConfig.direction} onClick={() => handleRequestSort('nombre')}>Nombre</TableSortLabel>
                </TableCell>
                <TableCell sx={headerStyle}>Área</TableCell>
                <TableCell sx={headerStyle}>Usuario</TableCell>
                <TableCell sx={headerStyle}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={isRoot ? 5 : 4} align="center"><CircularProgress /></TableCell></TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    {/* 👇 DATA ROOT */}
                    {isRoot && (
                        <TableCell>
                            <Chip label={u.hotelId === 1 ? "Cancún" : u.hotelId === 2 ? "Sensira" : "N/A"} size="small" variant="outlined" />
                        </TableCell>
                    )}
                    <TableCell>{u.nombre}</TableCell>
                    <TableCell>{u.area?.nombre || "Sin Asignar"}</TableCell>
                    <TableCell>{u.usuario_login || "N/A"}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleEdit(u.id)}><EditIcon /></IconButton>
                      <IconButton color="error" onClick={() => handleDelete(u.id)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]} component="div" count={totalUsers}
          rowsPerPage={rowsPerPage} page={page}
          onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <Modal open={openModal} onClose={() => setOpenModal(false)} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
        <Fade in={openModal}>
          <Box sx={modalStyle}>
            <CreateCrownUserForm onClose={() => setOpenModal(false)} onUserCreated={fetchUsers} setMessage={setMessage} setError={setError} />
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default UsersCrownP;