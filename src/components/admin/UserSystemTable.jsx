import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Alert, Modal, Fade,
  Backdrop, TablePagination, TableSortLabel, Chip, Tooltip, Skeleton
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContext";
import CreateSystemUserForm from "../CreateSystemUserForm";
import { ROLES, ROLE_LABELS } from "../../config/constants"; 

// Nuevos componentes UX
import ConfirmDialog from "../common/ConfirmDialog";
import EmptyState from "../common/EmptyState";

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
  
  // Estado Delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: 'nombre', direction: 'asc' });

  const navigate = useNavigate();
  const { user: currentUser, selectedHotelId } = useContext(AuthContext);
  
  const isGlobalUser = currentUser?.rol === ROLES.ROOT || currentUser?.rol === ROLES.CORP_VIEWER;
  const showLocationColumn = isGlobalUser && !selectedHotelId;

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
  }, [page, rowsPerPage, sortConfig, selectedHotelId]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleOpenDelete = (u) => {
      setUserToDelete(u);
      setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/auth/delete/${userToDelete.id}`);
      setMessage("Usuario eliminado.");
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || "Error al eliminar.");
    } finally {
      setDeleteDialogOpen(false);
      setUserToDelete(null);
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

  const getLocationLabel = (userData) => {
      const hotels = userData.hotels || [];
      if (hotels.length === 0) return <Chip label="Global" size="small" color="primary" variant="filled" />;
      if (hotels.length === 1) return <Chip label={hotels[0].nombre} size="small" variant="outlined" />;
      const hotelNames = hotels.map(h => h.nombre).join(", ");
      return <Tooltip title={hotelNames} arrow><Chip label="Múltiple" size="small" color="secondary" variant="outlined" /></Tooltip>;
  };

  const getRoleChip = (rol) => {
      const label = ROLE_LABELS[rol] || rol;
      let color = "default";
      let icon = <PersonIcon fontSize="small" />;
      if (rol === ROLES.ROOT) { color = "error"; icon = <AdminPanelSettingsIcon fontSize="small" />; }
      else if (rol === ROLES.HOTEL_ADMIN) { color = "primary"; icon = <AdminPanelSettingsIcon fontSize="small" />; }
      else if (rol === ROLES.HOTEL_AUX) { color = "info"; }
      else if (rol === ROLES.CORP_VIEWER) { color = "warning"; }
      return <Chip icon={icon} label={label} size="small" color={color} variant="outlined" sx={{ fontWeight: 500 }} />;
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
                {showLocationColumn && <TableCell sx={headerStyle}>Ubicación</TableCell>}
                <TableCell sx={headerStyle}><TableSortLabel active={sortConfig.key === 'nombre'} direction={sortConfig.direction} onClick={() => handleRequestSort('nombre')}>Nombre</TableSortLabel></TableCell>
                <TableCell sx={headerStyle}>Usuario</TableCell>
                <TableCell sx={headerStyle}>Correo</TableCell>
                <TableCell sx={headerStyle}><TableSortLabel active={sortConfig.key === 'rol'} direction={sortConfig.direction} onClick={() => handleRequestSort('rol')}>Rol</TableSortLabel></TableCell>
                <TableCell sx={headerStyle}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from(new Array(5)).map((_, i) => (
                    <TableRow key={i}>
                        {showLocationColumn && <TableCell><Skeleton variant="text" /></TableCell>}
                        <TableCell><Skeleton variant="text" /></TableCell>
                        <TableCell><Skeleton variant="text" /></TableCell>
                        <TableCell><Skeleton variant="text" /></TableCell>
                        <TableCell><Skeleton variant="text" width={80} /></TableCell>
                        <TableCell><Skeleton variant="circular" width={30} height={30} /></TableCell>
                    </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow><TableCell colSpan={showLocationColumn ? 6 : 5}><EmptyState title="Sin usuarios" description="No hay usuarios del sistema registrados." /></TableCell></TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id} hover>
                    {showLocationColumn && <TableCell>{getLocationLabel(u)}</TableCell>}
                    <TableCell>{u.nombre}</TableCell>
                    <TableCell>{u.username}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{getRoleChip(u.rol)}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleEditUser(u.id)} disabled={currentUser.id === u.id}><EditIcon /></IconButton>
                      <IconButton color="error" onClick={() => handleOpenDelete(u)} disabled={currentUser.id === u.id}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={totalCount} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />
      </Paper>

      <Modal open={openModal} onClose={() => setOpenModal(false)} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
        <Fade in={openModal}><Box sx={modalStyle}><CreateSystemUserForm onClose={() => setOpenModal(false)} onUserCreated={fetchUsers} setMessage={setMessage} setError={setError} /></Box></Fade>
      </Modal>

      <ConfirmDialog 
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        title="¿Eliminar Usuario?"
        content={`Estás a punto de eliminar a "${userToDelete?.username}". Esta acción es irreversible.`}
      />
    </Box>
  );
};

export default UsersSystemTable;