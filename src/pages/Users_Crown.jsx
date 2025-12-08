import React, { useState, useEffect, useCallback, useContext } from "react"; 
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  IconButton, Button, Alert, Modal, Fade, Backdrop, TablePagination, 
  TableSortLabel, TextField, Chip, Skeleton
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from '@mui/icons-material/Add';
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import CreateCrownUserForm from "../components/CreateCrownUserForm";
import ImportButton from "../components/ImportButton";
import { AuthContext } from "../context/AuthContext"; 
import { ROLES } from "../config/constants"; 
import ConfirmDialog from "../components/common/ConfirmDialog";
import EmptyState from "../components/common/EmptyState";

const modalStyle = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 500, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2 };

const UsersCrownP = () => {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // 👇 Usamos getHotelName
  const { user, selectedHotelId, getHotelName } = useContext(AuthContext);
  const isGlobalUser = user?.rol === ROLES.ROOT || user?.rol === ROLES.CORP_VIEWER || (user?.hotels && user.hotels.length > 1);
  const showHotelColumn = isGlobalUser && !selectedHotelId;
  const canImport = user?.rol === ROLES.HOTEL_ADMIN && user?.hotels?.length === 1;

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [search, setSearch] = useState(""); 
  const [sortConfig, setSortConfig] = useState({ key: 'nombre', direction: 'asc' });

  const fetchUsers = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const sortParam = `&sortBy=${sortConfig.key}&order=${sortConfig.direction}`;
      const response = await api.get(`/users/get?page=${page + 1}&limit=${rowsPerPage}&search=${search}${sortParam}`);
      setUsers(response.data.data);
      setTotalUsers(response.data.totalCount);
    } catch (err) { console.error("Error fetching users:", err); setError("Error al cargar la lista de usuarios."); } 
    finally { setLoading(false); }
  }, [page, rowsPerPage, search, sortConfig, selectedHotelId]); 

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearchChange = (e) => { setSearch(e.target.value); setPage(0); };
  const handleRequestSort = (key) => { setSortConfig({ key, direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc' }); };
  const handleOpenDelete = (u) => { setUserToDelete(u); setDeleteDialogOpen(true); };

  const confirmDelete = async () => {
      if(!userToDelete) return;
      setActionLoading(true);
      try { 
          await api.delete(`/users/delete/${userToDelete.id}`); 
          setMessage("Usuario eliminado."); fetchUsers(); setDeleteDialogOpen(false);
      } catch (err) { setError(err.response?.data?.error || "Error al eliminar."); } 
      finally { setActionLoading(false); setUserToDelete(null); }
  };

  const handleEdit = (id) => navigate(`/users/edit/${id}`);
  const handleChangePage = (e, n) => setPage(n);
  const handleChangeRowsPerPage = (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" color="primary" fontWeight="bold">Usuarios de Staff</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField label="Buscar usuario..." variant="outlined" size="small" value={search} onChange={handleSearchChange} />
          {canImport && <ImportButton endpoint="/users/import" onSuccess={fetchUsers} label="Importar" />}
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
                {showHotelColumn && <TableCell>Hotel</TableCell>}
                <TableCell><TableSortLabel active={sortConfig.key === 'nombre'} direction={sortConfig.direction} onClick={() => handleRequestSort('nombre')}>Nombre</TableSortLabel></TableCell>
                <TableCell>Área</TableCell>
                <TableCell>Usuario</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? Array.from(new Array(5)).map((_, i) => (
                    <TableRow key={i}>
                        {showHotelColumn && <TableCell><Skeleton variant="text" /></TableCell>}
                        <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                        <TableCell><Skeleton variant="text" /></TableCell>
                        <TableCell><Skeleton variant="text" /></TableCell>
                        <TableCell><Skeleton variant="circular" width={30} height={30} /></TableCell>
                    </TableRow>
                )) : users.length === 0 ? (
                <TableRow><TableCell colSpan={showHotelColumn ? 5 : 4}><EmptyState title="Sin usuarios" description="No hay personal registrado que coincida con tu búsqueda."/></TableCell></TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id} hover>
                    {showHotelColumn && (
                        <TableCell>
                            {/* 👇 CORRECCIÓN */}
                            <Chip label={getHotelName(u.hotelId)} size="small" variant="outlined" />
                        </TableCell>
                    )}
                    <TableCell sx={{ fontWeight: '500' }}>{u.nombre}</TableCell>
                    <TableCell>{u.area?.nombre || "Sin Asignar"}</TableCell>
                    <TableCell>{u.usuario_login || "N/A"}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleEdit(u.id)}><EditIcon /></IconButton>
                      <IconButton color="error" onClick={() => handleOpenDelete(u)}><DeleteIcon /></IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={totalUsers} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />
      </Paper>

      <Modal open={openModal} onClose={() => setOpenModal(false)} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}><Fade in={openModal}><Box sx={modalStyle}><CreateCrownUserForm onClose={() => setOpenModal(false)} onUserCreated={fetchUsers} setMessage={setMessage} setError={setError} /></Box></Fade></Modal>

      <ConfirmDialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onConfirm={confirmDelete} title="¿Eliminar Usuario?" content={`Estás eliminando a "${userToDelete?.nombre}". Esta acción afectará a los equipos asignados a esta persona.`} isLoading={actionLoading} />
    </Box>
  );
};

export default UsersCrownP;