// src/pages/AdminSettings.jsx
import React, { useState, useEffect, useContext } from "react";
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
  Backdrop
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
// import CreateCrownUserForm from "../components/CreateCrownUserForm"; 👈 Quita esta línea
import CreateSystemUserForm from "../components/CreateSystemUserForm"; // 👈 Agrega esta importación

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
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const tables = [
    { name: "Departamentos", url: "/departments" },
    { name: "Sistemas Operativos", url: "/operating-systems" },
    { name: "Tipos de Dispositivo", url: "/device-types" },
    { name: "Estados de Dispositivo", url: "/device-status" },
    { name: "Gestión de Usuarios", url: "/auth" },
  ];

  useEffect(() => {
    if (activeTable === "Gestión de Usuarios") {
      fetchUsers();
    }
  }, [activeTable]);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/auth/get");
      setUsers(response.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Error al cargar la lista de usuarios.");
    }
  };

  const handleDelete = async (id) => {
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
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nombre</TableCell>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Correo</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((u) => (
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      );
    }

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
            onClick={() => setActiveTable(table.name)}
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
      
      {/* Modal para crear usuario */}
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
            <CreateSystemUserForm // 👈 Usa el nuevo componente aquí
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