// src/pages/Users_Crown.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const UsersCrownP = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    departamentoId: "",
    ip_equipo: "",
    usuario_login: "",
    password_login: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users/get");
      setUsers(response.data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Error al cargar la lista de usuarios.");
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await api.get("/departments/get");
      setDepartments(response.data);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api.post("/users/post", formData);
      setMessage("Usuario de Crown creado exitosamente.");
      fetchUsers(); // Recargar la lista de usuarios
      setFormData({
        // Limpiar formulario
        nombre: "",
        correo: "",
        departamentoId: "",
        ip_equipo: "",
        usuario_login: "",
        password_login: "",
      });
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear el usuario.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
      try {
        await api.delete(`/users/delete/${id}`);
        setMessage("Usuario eliminado correctamente.");
        fetchUsers();
      } catch (err) {
        setError(err.response?.data?.error || "Error al eliminar el usuario.");
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/users/edit/${id}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Usuarios de Crown
      </Typography>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Formulario de creación de usuario */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Crear nuevo usuario
        </Typography>
        <Box component="form" onSubmit={handleCreateUser} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Correo"
            name="correo"
            type="email"
            value={formData.correo}
            onChange={handleChange}
            fullWidth
            required
          />
          <FormControl fullWidth>
            <InputLabel>Departamento</InputLabel>
            <Select
              name="departamentoId"
              value={formData.departamentoId}
              onChange={handleChange}
              label="Departamento"
            >
              <MenuItem value="">
                <em>Ninguno</em>
              </MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>{dept.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="IP del equipo"
            name="ip_equipo"
            value={formData.ip_equipo}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Usuario de Login"
            name="usuario_login"
            value={formData.usuario_login}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Contraseña de Login"
            name="password_login"
            type="password"
            value={formData.password_login}
            onChange={handleChange}
            fullWidth
          />
          <Button type="submit" variant="contained" color="primary">
            Crear usuario
          </Button>
        </Box>
      </Paper>

      {/* Tabla de usuarios */}
      <Typography variant="h5" sx={{ mb: 2 }}>
        Lista de Usuarios de Crown
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Correo</TableCell>
              <TableCell>Departamento</TableCell>
              <TableCell>IP Equipo</TableCell>
              <TableCell>Usuario Login</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.nombre}</TableCell>
                <TableCell>{u.correo}</TableCell>
                <TableCell>{u.departamento?.nombre || "N/A"}</TableCell>
                <TableCell>{u.ip_equipo || "N/A"}</TableCell>
                <TableCell>{u.usuario_login || "N/A"}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => handleEdit(u.id)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(u.id)}
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
};

export default UsersCrownP;