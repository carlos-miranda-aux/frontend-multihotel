import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  Box, Typography, Button, Stack, Divider, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Alert, Modal, Fade,
  Backdrop, TablePagination, CircularProgress, TableSortLabel
} from "@mui/material";
import ListIcon from '@mui/icons-material/List';
import PeopleIcon from '@mui/icons-material/People';
import DomainIcon from '@mui/icons-material/Domain'; // Icono para Áreas
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import CrudTable from "../components/CrudTable";
import CreateSystemUserForm from "../components/CreateSystemUserForm";
import CreateAreaForm from "../components/CreateAreaForm"; // 👈 IMPORTAR EL NUEVO FORMULARIO
import { useSortableData } from "../hooks/useSortableData";

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: 500, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2
};

const AdminSettings = () => {
  const [activeTable, setActiveTable] = useState(null);
  
  // Estados generales
  const [dataList, setDataList] = useState([]); // Reutilizable para usuarios o áreas
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  // Estados de Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Estados del Modal
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState(""); // 'USER', 'AREA'
  const [editingItem, setEditingItem] = useState(null); // Para editar áreas

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Hook de ordenamiento (clave dinámica según la tabla activa)
  const getSortKey = () => {
    if (activeTable === "Gestión de Usuarios") return 'nombre';
    if (activeTable === "Áreas") return 'nombre';
    return 'id';
  };
  const { sortedItems, requestSort, sortConfig } = useSortableData(dataList, { key: getSortKey(), direction: 'ascending' });

  const tables = [
    { name: "Departamentos", url: "/departments" },
    { name: "Áreas", url: "/areas", icon: <DomainIcon /> }, // 👈 Nueva configuración
    { name: "Sistemas Operativos", url: "/operating-systems" },
    { name: "Tipos de Dispositivo", url: "/device-types" },
    { name: "Estados de Dispositivo", url: "/device-status" },
    { name: "Gestión de Usuarios", url: "/auth", icon: <PeopleIcon /> },
  ];

  // --- FETCHERS ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      let url = "";
      if (activeTable === "Gestión de Usuarios") {
        url = `/auth/get?page=${page + 1}&limit=${rowsPerPage}`;
      } else if (activeTable === "Áreas") {
        // Asumiendo que tu endpoint de áreas NO paginado es '/areas/get'
        // Si lo paginaste en el backend, usa params. Si no, filtra en frontend.
        // Para mantener consistencia con CrudTable que no pagina, pediremos todo por ahora
        // O si creaste el controller nuevo sin paginación:
        url = `/areas/get`; 
      }

      if (url) {
        const response = await api.get(url);
        // Ajustar según si el backend devuelve paginación o array directo
        if (response.data.data) {
            setDataList(response.data.data);
            setTotalCount(response.data.totalCount);
        } else {
            // Caso Áreas (si el controller devuelve array directo)
            setDataList(response.data);
            setTotalCount(response.data.length);
        }
      }
    } catch (err) {
      console.error(`Error fetching ${activeTable}:`, err);
      setError(`Error al cargar los datos de ${activeTable}.`);
    } finally {
      setLoading(false);
    }
  }, [activeTable, page, rowsPerPage]);

  useEffect(() => {
    if (activeTable === "Gestión de Usuarios" || activeTable === "Áreas") {
      fetchData();
    }
  }, [activeTable, fetchData]);

  // --- HANDLERS ---

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este registro?")) return;
    
    let url = "";
    if (activeTable === "Gestión de Usuarios") url = `/auth/delete/${id}`;
    if (activeTable === "Áreas") url = `/areas/delete/${id}`;

    try {
      await api.delete(url);
      setMessage("Registro eliminado correctamente.");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || "Error al eliminar.");
    }
  };

  const handleEditUser = (id) => navigate(`/user-manager/edit/${id}`);

  const handleEditArea = (item) => {
    setEditingItem(item);
    setModalType("AREA");
    setOpenModal(true);
  };

  const handleCreateClick = () => {
    setEditingItem(null);
    if (activeTable === "Gestión de Usuarios") setModalType("USER");
    if (activeTable === "Áreas") setModalType("AREA");
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setEditingItem(null);
  };

  // --- RENDERS ---

  const renderActiveTable = () => {
    if (!activeTable) return <Typography sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>Selecciona una opción.</Typography>;

    // 1. TABLA DE USUARIOS
    if (activeTable === "Gestión de Usuarios") {
      return (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Gestión de Usuarios del Sistema</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateClick}>Crear Usuario</Button>
          </Box>
          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><TableSortLabel active={sortConfig?.key === 'nombre'} direction={sortConfig?.direction} onClick={() => requestSort('nombre')}>Nombre</TableSortLabel></TableCell>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Correo</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? <TableRow><TableCell colSpan={5} align="center"><CircularProgress /></TableCell></TableRow> :
                    sortedItems.map((u) => (
                      <TableRow key={u.id}>
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
                  }
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]} component="div" count={totalCount}
              rowsPerPage={rowsPerPage} page={page}
              onPageChange={(e, p) => setPage(p)} onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
            />
          </Paper>
        </Box>
      );
    }

    // 2. TABLA DE ÁREAS (NUEVA)
    if (activeTable === "Áreas") {
      return (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Gestión de Áreas</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateClick}>Nueva Área</Button>
          </Box>
          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><TableSortLabel active={sortConfig?.key === 'nombre'} direction={sortConfig?.direction} onClick={() => requestSort('nombre')}>Nombre Área</TableSortLabel></TableCell>
                    <TableCell><TableSortLabel active={sortConfig?.key === 'departamento.nombre'} direction={sortConfig?.direction} onClick={() => requestSort('departamento.nombre')}>Departamento (Padre)</TableSortLabel></TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? <TableRow><TableCell colSpan={3} align="center"><CircularProgress /></TableCell></TableRow> :
                    sortedItems.map((area) => (
                      <TableRow key={area.id}>
                        <TableCell>{area.nombre}</TableCell>
                        <TableCell>{area.departamento?.nombre || "N/A"}</TableCell>
                        <TableCell>
                          <IconButton color="primary" onClick={() => handleEditArea(area)}><EditIcon /></IconButton>
                          <IconButton color="error" onClick={() => handleDelete(area.id)}><DeleteIcon /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </TableContainer>
            {/* Paginación local si el endpoint no pagina, o remota si sí */}
            <TablePagination
               rowsPerPageOptions={[5, 10, 25]} component="div" count={dataList.length}
               rowsPerPage={rowsPerPage} page={page}
               onPageChange={(e, p) => setPage(p)} onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
            />
          </Paper>
        </Box>
      );
    }

    // 3. TABLAS CRUD GENÉRICAS
    const tableData = tables.find(t => t.name === activeTable);
    return <CrudTable title={tableData.name} apiUrl={tableData.url} />;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Configuración de Administrador</Typography>
      <Typography variant="h6" sx={{ mb: 2 }}>Selecciona una tabla para gestionar:</Typography>

      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
        {tables.map((table) => (
          <Button
            key={table.name}
            variant={activeTable === table.name ? "contained" : "outlined"}
            onClick={() => { setActiveTable(table.name); setPage(0); setMessage(""); setError(""); }}
            startIcon={table.icon || <ListIcon />}
          >
            {table.name}
          </Button>
        ))}
      </Stack>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ minHeight: 400 }}>
        {renderActiveTable()}
      </Box>

      <Modal open={openModal} onClose={handleCloseModal} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ timeout: 500 }}>
        <Fade in={openModal}>
          <Box sx={modalStyle}>
            {modalType === "USER" && (
              <CreateSystemUserForm onClose={handleCloseModal} onUserCreated={fetchData} setMessage={setMessage} setError={setError} />
            )}
            {modalType === "AREA" && (
              <CreateAreaForm 
                onClose={handleCloseModal} 
                onSuccess={fetchData} 
                initialData={editingItem} // Para editar
              />
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default AdminSettings;