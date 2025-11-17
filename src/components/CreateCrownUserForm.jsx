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
  FormControlLabel, // 👈 AÑADIR
  Switch            // 👈 AÑADIR
} from "@mui/material";
import api from "../api/axios";

const CreateCrownUserForm = ({ onClose, onUserCreated, setMessage, setError }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    departamentoId: "",
    usuario_login: "",
  });
  const [isManager, setIsManager] = useState(false); // 👈 AÑADIR ESTADO
  const [departments, setDepartments] = useState([]);
  
  useEffect(() => {
    // Cargar Departamentos
    const fetchDepartments = async () => {
      try {
        const res = await api.get("/departments/get");
        setDepartments(res.data || []);
      } catch (err) {
        console.error("Error fetching departments:", err);
        setError("Error al cargar departamentos.");
      }
    };
    fetchDepartments();
  }, [setError]); // Dependencia corregida

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    
    const payload = {
      ...formData,
      departamentoId: formData.departamentoId || null,
      es_jefe_de_area: isManager // 👈 AÑADIR CAMPO AL PAYLOAD
    };

    try {
      await api.post("/users/post", payload);
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

        {/* 👇 AÑADIR ESTE BLOQUE 👇 */}
        <FormControlLabel
          control={
            <Switch
              checked={isManager}
              onChange={(e) => setIsManager(e.target.checked)}
            />
          }
          label="Es Jefe de Área (Recibe notificaciones)"
        />
        {/* 👆 FIN DEL BLOQUE NUEVO 👆 */}

        <Button type="submit" variant="contained" color="primary">
          Crear usuario
        </Button>
      </Box>
    </Box>
  );
};

export default CreateCrownUserForm;