// src/components/CreateCrownUserForm.jsx
import React, { useState, useEffect } from "react";
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

const CreateCrownUserForm = ({ onClose, onUserCreated, setMessage, setError }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    departamentoId: "",
    usuario_login: "",
  });
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    fetchDepartments();
  }, []);

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
      onUserCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Error al crear el usuario.");
    }
  };

  return (
    <Box>
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
          label="Usuario de Login"
          name="usuario_login"
          value={formData.usuario_login}
          onChange={handleChange}
          fullWidth
        />
        <Button type="submit" variant="contained" color="primary">
          Crear usuario
        </Button>
      </Box>
    </Box>
  );
};

export default CreateCrownUserForm;