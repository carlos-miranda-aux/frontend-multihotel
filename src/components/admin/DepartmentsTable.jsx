import React, { useState, useEffect, useCallback, useContext } from "react";
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, Modal, Fade, Backdrop, TablePagination, CircularProgress, Chip, TableSortLabel } from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import api from "../../api/axios";
import CreateDepartmentForm from "../CreateDepartmentForm";
import { AuthContext } from "../../context/AuthContext";
import { ROLES } from "../../config/constants";

const modalStyle = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2 };

const DepartmentsTable = () => {
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortConfig, setSortConfig] = useState({ key: 'nombre', direction: 'asc' });

  const { user, selectedHotelId } = useContext(AuthContext);
  const showHotelColumn = (user?.rol === ROLES.ROOT || user?.rol === ROLES.CORP_VIEWER) && !selectedHotelId;

  const fetchDepts = useCallback(async () => {
    setLoading(true);
    try {
      const sortParam = `&sortBy=${sortConfig.key}&order=${sortConfig.direction}`;
      const res = await api.get(`/departments/get?page=${page + 1}&limit=${rowsPerPage}${sortParam}`);
      if (res.data.data) { setDepts(res.data.data); setTotalCount(res.data.totalCount); }
      else { setDepts(res.data); setTotalCount(res.data.length); }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [page, rowsPerPage, sortConfig, selectedHotelId]);

  useEffect(() => { fetchDepts(); }, [fetchDepts]);

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar departamento?")) return;
    try { await api.delete(`/departments/delete/${id}`); fetchDepts(); } catch (e) { alert("Error al eliminar"); }
  };

  const handleSort = (key) => setSortConfig({ key, direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc' });

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" color="primary" fontWeight="bold">Departamentos</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingItem(null); setOpenModal(true); }}>Nuevo</Button>
      </Box>
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                {showHotelColumn && (
                    <TableCell>
                        <TableSortLabel active={sortConfig.key === 'hotel.nombre'} direction={sortConfig.direction} onClick={() => handleSort('hotel.nombre')}>Hotel</TableSortLabel>
                    </TableCell>
                )}
                <TableCell>
                    <TableSortLabel active={sortConfig.key === 'nombre'} direction={sortConfig.direction} onClick={() => handleSort('nombre')}>Nombre</TableSortLabel>
                </TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={showHotelColumn ? 3 : 2} align="center"><CircularProgress /></TableCell></TableRow> : depts.map((d) => (
                <TableRow key={d.id}>
                  {showHotelColumn && (
                    <TableCell>
                        <Chip 
                            label={d.hotel?.nombre || d.hotel?.codigo || `ID:${d.hotelId}`} 
                            size="small" 
                            variant="outlined" 
                        />
                    </TableCell>
                  )}
                  <TableCell>{d.nombre}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => { setEditingItem(d); setOpenModal(true); }}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(d.id)}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={totalCount} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} />
      </Paper>
      <Modal open={openModal} onClose={() => setOpenModal(false)} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
        <Fade in={openModal}><Box sx={modalStyle}><CreateDepartmentForm onClose={() => setOpenModal(false)} onSuccess={fetchDepts} initialData={editingItem} /></Box></Fade>
      </Modal>
    </Box>
  );
};
export default DepartmentsTable;