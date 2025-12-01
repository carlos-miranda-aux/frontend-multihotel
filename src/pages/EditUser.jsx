// src/pages/EditUser.jsx
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

// ❌ ELIMINADO: import "../pages/styles/ConfigButtons.css";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    nombre: "",
    username: "",
    email: "",
    rol: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get(`/auth/get/${id}`);
        setFormData({
          nombre: response.data.nombre || "",
          username: response.data.username || "",
          email: response.data.email || "",
          rol: response.data.rol || "USER",
          password: "",
        });
      } catch (err) {
        setError(err.response?.data?.error || "Error al cargar los datos del usuario.");
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (formData.username === "superadmin" && formData.rol !== "ADMIN") {
      setError("No se puede cambiar el rol del superadministrador.");
      return;
    }
    
    const payload = {};
    if (formData.nombre) payload.nombre = formData.nombre;
    if (formData.email) payload.email = formData.email;
    if (formData.rol) payload.rol = formData.rol;
    if (formData.password) payload.password = formData.password;

    try {
      await api.put(`/auth/put/${id}`, payload);
      setMessage("Usuario actualizado correctamente.");
      setTimeout(() => navigate("/admin-settings"), 2000); // Redirige a AdminSettings o UserManager según prefieras
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar el usuario.");
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }} color="primary">
        Editar Usuario: {formData.username}
      </Typography>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <Box component="form" onSubmit={handleUpdateUser} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Correo electrónico"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
          />
          <FormControl fullWidth disabled={formData.username === "superadmin"}>
            <InputLabel>Rol</InputLabel>
            <Select
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              label="Rol"
            >
              <MenuItem value="USER">USER</MenuItem>
              <MenuItem value="EDITOR">EDITOR</MenuItem>
              <MenuItem value="ADMIN">ADMIN</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Nueva Contraseña"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
            helperText="Dejar en blanco para no cambiar la contraseña."
          />
          
          {/* ✅ BOTÓN REFACTORIZADO */}
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            sx={{ alignSelf: 'flex-start', mt: 1 }}
          >
            Guardar cambios
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default EditUser;