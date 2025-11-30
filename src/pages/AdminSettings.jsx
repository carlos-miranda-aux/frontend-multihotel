// src/pages/AdminSettings.jsx
import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  Box, Typography, Button, Stack, Divider, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Alert, Modal, Fade,
  Backdrop, TablePagination, CircularProgress, TableSortLabel
} from "@mui/material";
import ListIcon from '@mui/icons-material/List';
import PeopleIcon from '@mui/icons-material/People';
import DomainIcon from '@mui/icons-material/Domain'; 
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import CrudTable from "../components/CrudTable";
import CreateSystemUserForm from "../components/CreateSystemUserForm";
import CreateAreaForm from "../components/CreateAreaForm"; 
import "./styles/ConfigButtons.css"; 

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: 500, bgcolor: 'background.paper', boxShadow: 24, p: 4, borderRadius: 2
};

const AdminSettings = () => {
  const [activeTable, setActiveTable] = useState(null);
  
  // Estados generales
  const [dataList, setDataList] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  // Estados de Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0); 

  // Estado de Ordenamiento (Servidor)
  const [sortConfig, setSortConfig] = useState({ key: 'nombre', direction: 'asc' });

  // Estados del Modal
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState(""); 
  const [editingItem, setEditingItem] = useState(null); 

  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const tables = [
    { name: "Departamentos", url: "/departments" },
    { name: "Áreas", url: "/areas", icon: <DomainIcon /> }, 
    { name: "Sistemas Operativos", url: "/operating-systems" },
    { name: "Tipos de Dispositivo", url: "/device-types" },
    { name: "Estados de Dispositivo", url: "/device-status" },
    { name: "Gestión de Usuarios", url: "/auth", icon: <PeopleIcon /> },
  ];

  // --- FETCHERS ---
  const fetchData = useCallback(async () => {
    // Si no hay tabla activa o es una tabla genérica (que usa CrudTable), no hacemos fetch aquí
    if (!activeTable || (activeTable !== "Gestión de Usuarios" && activeTable !== "Áreas")) {
        return;
    }

    setLoading(true);
    setError("");
    try {
      let url = "";
      // Parametros de orden
      const sortParam = `&sortBy=${sortConfig.key}&order=${sortConfig.direction}`;

      if (activeTable === "Gestión de Usuarios") {
        url = `/auth/get?page=${page + 1}&limit=${rowsPerPage}${sortParam}`;
      } else if (activeTable === "Áreas") {
        url = `/areas/get?page=${page + 1}&limit=${rowsPerPage}${sortParam}`; 
      }

      const response = await api.get(url);

      if (response.data.data) {
          setDataList(response.data.data);
          setTotalCount(response.data.totalCount);
      } else {
          // Fallback por si la API cambia formato
          setDataList(response.data);
          setTotalCount(response.data.length);
      }
      
    } catch (err) {
      console.error(`Error fetching ${activeTable}:`, err);
      setError(`Error al cargar los datos de ${activeTable}.`);
    } finally {
      setLoading(false);
    }
  }, [activeTable, page, rowsPerPage, sortConfig]); // Agregamos sortConfig a dependencias

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- HANDLERS ---
  const handleRequestSort = (key) => {
    const isAsc = sortConfig.key === key && sortConfig.direction === 'asc';
    setSortConfig({ key, direction: isAsc ? 'desc' : 'asc' });
  };

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

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleTableChange = (tableName) => {
    setActiveTable(tableName);
    setPage(0); 
    setRowsPerPage(10);
    setTotalCount(0);
    setDataList([]); 
    setMessage(""); 
    setError(""); 
    // Reiniciar ordenamiento al cambiar de tabla
    setSortConfig({ key: 'nombre', direction: 'asc' });
  }

  // Estilo para encabezado
  const headerStyle = { fontWeight: 'bold', color: '#333' };

  const renderActiveTable = () => {
    if (!activeTable) return <Typography sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>Selecciona una opción.</Typography>;

    // 1. TABLA DE USUARIOS
    if (activeTable === "Gestión de Usuarios") {
      return (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Gestión de Usuarios del Sistema</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateClick} className="primary-action-button">
                Crear Usuario
            </Button>
          </Box>
          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={headerStyle} sortDirection={sortConfig.key === 'nombre' ? sortConfig.direction : false}>
                        <TableSortLabel active={sortConfig.key === 'nombre'} direction={sortConfig.key === 'nombre' ? sortConfig.direction : 'asc'} onClick={() => handleRequestSort('nombre')}>
                            Nombre
                        </TableSortLabel>
                    </TableCell>
                    <TableCell sx={headerStyle} sortDirection={sortConfig.key === 'username' ? sortConfig.direction : false}>
                        <TableSortLabel active={sortConfig.key === 'username'} direction={sortConfig.key === 'username' ? sortConfig.direction : 'asc'} onClick={() => handleRequestSort('username')}>
                            Usuario
                        </TableSortLabel>
                    </TableCell>
                    <TableCell sx={headerStyle}>Correo</TableCell>
                    <TableCell sx={headerStyle} sortDirection={sortConfig.key === 'rol' ? sortConfig.direction : false}>
                        <TableSortLabel active={sortConfig.key === 'rol'} direction={sortConfig.key === 'rol' ? sortConfig.direction : 'asc'} onClick={() => handleRequestSort('rol')}>
                            Rol
                        </TableSortLabel>
                    </TableCell>
                    <TableCell sx={headerStyle}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? <TableRow><TableCell colSpan={5} align="center"><CircularProgress /></TableCell></TableRow> :
                    dataList.map((u) => ( // 👈 Usamos dataList directo (ya viene ordenado del server)
                      <TableRow key={u.id}>
                        <TableCell>{u.nombre}</TableCell>
                        <TableCell>{u.username}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{u.rol}</TableCell>
                        <TableCell>
                          <IconButton color="primary" onClick={() => handleEditUser(u.id)} disabled={user.id === u.id} className="action-icon-color"><EditIcon /></IconButton>
                          <IconButton color="error" onClick={() => handleDelete(u.id)} disabled={user.id === u.id}><DeleteIcon /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  }
                   {!loading && dataList.length === 0 && (
                        <TableRow><TableCell colSpan={5} align="center">No hay usuarios en el sistema.</TableCell></TableRow>
                    )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]} component="div" count={totalCount}
              rowsPerPage={rowsPerPage} page={page}
              onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página:"
            />
          </Paper>
        </Box>
      );
    }

    // 2. TABLA DE ÁREAS (La que reportaste con problemas)
    if (activeTable === "Áreas") {
      return (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">Gestión de Áreas</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateClick} className="primary-action-button">
                Nueva Área
            </Button>
          </Box>
          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Paper>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={headerStyle} sortDirection={sortConfig.key === 'nombre' ? sortConfig.direction : false}>
                        <TableSortLabel active={sortConfig.key === 'nombre'} direction={sortConfig.key === 'nombre' ? sortConfig.direction : 'asc'} onClick={() => handleRequestSort('nombre')}>
                            Nombre Área
                        </TableSortLabel>
                    </TableCell>
                    <TableCell sx={headerStyle} sortDirection={sortConfig.key === 'departamento.nombre' ? sortConfig.direction : false}>
                        <TableSortLabel active={sortConfig.key === 'departamento.nombre'} direction={sortConfig.key === 'departamento.nombre' ? sortConfig.direction : 'asc'} onClick={() => handleRequestSort('departamento.nombre')}>
                            Departamento
                        </TableSortLabel>
                    </TableCell>
                    <TableCell sx={headerStyle}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? <TableRow><TableCell colSpan={3} align="center"><CircularProgress /></TableCell></TableRow> :
                    dataList.map((area) => ( // 👈 Usamos dataList directo
                      <TableRow key={area.id}>
                        <TableCell>{area.nombre}</TableCell>
                        <TableCell>{area.departamento?.nombre || "N/A"}</TableCell>
                        <TableCell>
                          <IconButton color="primary" onClick={() => handleEditArea(area)} className="action-icon-color"><EditIcon /></IconButton>
                          <IconButton color="error" onClick={() => handleDelete(area.id)}><DeleteIcon /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  }
                   {!loading && dataList.length === 0 && (
                        <TableRow><TableCell colSpan={3} align="center">No hay áreas registradas.</TableCell></TableRow>
                    )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
               rowsPerPageOptions={[5, 10, 25]} component="div" count={totalCount} 
               rowsPerPage={rowsPerPage} page={page}
               onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}
               labelRowsPerPage="Filas por página:"
            />
          </Paper>
        </Box>
      );
    }

    // 3. TABLAS CRUD GENÉRICAS
    // Estas usan el componente CrudTable que ya tiene su propia lógica de ordenamiento servidor interna
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
            onClick={() => handleTableChange(table.name)} 
            startIcon={table.icon || <ListIcon />}
            className={activeTable === table.name ? "primary-action-button" : "selector-button-outlined"}
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
              <CreateAreaForm onClose={handleCloseModal} onSuccess={fetchData} initialData={editingItem} />
            )}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};

export default AdminSettings;