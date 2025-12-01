// src/components/CreateSystemUserForm.jsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import api from "../api/axios";

// ❌ ELIMINADO: import "../pages/styles/ConfigButtons.css";

const CreateSystemUserForm = ({ onClose, onUserCreated, setMessage, setError }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    username: "",
    email: "",
    password: "",
    rol: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (setError) setError("");
    if (setMessage) setMessage("");
    try {
      await api.post("/auth/create-user", formData);
      if (setMessage) setMessage("Usuario del sistema creado exitosamente.");
      onUserCreated();
      onClose();
    } catch (err) {
      if (setError) setError(err.response?.data?.error || "Error al crear el usuario.");
    }
  };

  return (
    <Box>
      {/* ✅ TÍTULO REFACTORIZADO */}
      <Typography 
        variant="h6" 
        sx={{ mb: 2, fontWeight: 'bold' }}
        color="text.primary"
      >
        Crear nuevo usuario del sistema
      </Typography>

      <Box component="form" onSubmit={handleCreateUser} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="Nombre completo"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          label="Nombre de usuario"
          name="username"
          value={formData.username}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          label="Correo electrónico"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          label="Contraseña"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          fullWidth
          required
        />
        <FormControl fullWidth required>
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
        
        {/* ✅ BOTÓN REFACTORIZADO */}
        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
        >
          Crear usuario
        </Button>
      </Box>
    </Box>
  );
};

export default CreateSystemUserForm;