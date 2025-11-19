// src/pages/Inventory.jsx
import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Typography,
  Alert,
  Modal,
  Fade,
  Backdrop,
  TablePagination,
  CircularProgress,
  TableSortLabel,
  TextField // 👈 CORRECCIÓN: Importar TextField
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from '@mui/icons-material/Add';
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import CreateDeviceForm from "../components/CreateDeviceForm";
import { AlertContext } from "../context/AlertContext";
import { useSortableData } from "../hooks/useSortableData";

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2
};

const Inventory = () => {
  const [devices, setDevices] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalDevices, setTotalDevices] = useState(0);
  const [search, setSearch] = useState(""); // 👈 Estado para búsqueda

  const navigate = useNavigate();
  const { refreshAlerts } = useContext(AlertContext);

  // Ordenamiento inicial por 'nombre_equipo'
  const { sortedItems: sortedDevices, requestSort, sortConfig } = useSortableData(devices, { key: 'nombre_equipo', direction: 'ascending' });

  useEffect(() => {
    fetchDevices(); 
  }, [page, rowsPerPage, search]); 

  const fetchDevices = async () => {
    setLoading(true);
    setError("");
    try {
      // 👈 Enviar parámetro search
      const res = await api.get(`/devices/get?page=${page + 1}&limit=${rowsPerPage}&search=${search}`);
      setDevices(res.data.data);
      setTotalDevices(res.data.totalCount);
    } catch (err) {
      console.error("Error al obtener dispositivos:", err);
      setError("Error al cargar el inventario.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(0); // Resetear a página 1 al buscar
  };

  const handleEdit = (id) => {
    navigate(`/inventory/edit/${id}`);
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
          Inventario de Equipos
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
           {/* 👈 CORRECCIÓN: Barra de Búsqueda */}
          <TextField
            label="Buscar equipo..."
            variant="outlined"
            size="small"
            value={search}
            onChange={handleSearchChange}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenModal}
          >
            Crear Equipo
          </Button>
        </Box>
      </Box>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {/* 1. Nombre del equipo (Sortable) */}
                <TableCell sortDirection={sortConfig?.key === 'nombre_equipo' ? sortConfig.direction : false}>
                  <TableSortLabel
                    active={sortConfig?.key === 'nombre_equipo'}
                    direction={sortConfig?.key === 'nombre_equipo' ? sortConfig.direction : 'asc'}
                    onClick={() => requestSort('nombre_equipo')}
                  >
                    Nombre Equipo
                  </TableSortLabel>
                </TableCell>
                
                {/* 2. Descripción */}
                <TableCell>Descripción</TableCell>

                {/* 3. Usuario Asignado (Sortable) */}
                <TableCell sortDirection={sortConfig?.key === 'usuario.nombre' ? sortConfig.direction : false}>
                  <TableSortLabel
                    active={sortConfig?.key === 'usuario.nombre'}
                    direction={sortConfig?.key === 'usuario.nombre' ? sortConfig.direction : 'asc'}
                    onClick={() => requestSort('usuario.nombre')}
                  >
                    Usuario Asignado
                  </TableSortLabel>
                </TableCell>
                
                {/* 4. IP */}
                <TableCell>IP</TableCell>
                
                {/* 5. N° Serie */}
                <TableCell>N° Serie</TableCell>

                {/* 6. Tipo (Sortable) */}
                <TableCell sortDirection={sortConfig?.key === 'tipo.nombre' ? sortConfig.direction : false}>
                  <TableSortLabel
                    active={sortConfig?.key === 'tipo.nombre'}
                    direction={sortConfig?.key === 'tipo.nombre' ? sortConfig.direction : 'asc'}
                    onClick={() => requestSort('tipo.nombre')}
                  >
                    Tipo
                  </TableSortLabel>
                </TableCell>
                
                {/* Acciones */}
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center"> {/* ColSpan: 6 datos + 1 acción = 7 */}
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : (
                sortedDevices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell>{device.nombre_equipo}</TableCell>
                    <TableCell>{device.descripcion || 'N/A'}</TableCell>
                    <TableCell>{device.usuario?.nombre || 'N/A'}</TableCell>
                    <TableCell>{device.ip_equipo || 'N/A'}</TableCell>
                    <TableCell>{device.numero_serie}</TableCell>
                    <TableCell>{device.tipo?.nombre || 'N/A'}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(device.id)}
                      >
                        <EditIcon />
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
          count={totalDevices}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
        />
      </Paper>

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
            <CreateDeviceForm
              onClose={handleCloseModal}
              onDeviceCreated={() => {
                fetchDevices(); 
                refreshAlerts(); 
              }}
              setMessage={setMessage}
              setError={setError}
            />
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default Inventory;