// src/pages/EditCrownUser.jsx
import React, { useState, useEffect } from "react";
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
  CircularProgress
} from "@mui/material";
import api from "../api/axios";

const EditCrownUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    departamentoId: "",
    usuario_login: "",
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUserAndDepartments();
  }, [id]);

  const fetchUserAndDepartments = async () => {
    try {
      setLoading(true);
      const [userResponse, deptResponse] = await Promise.all([
        api.get(`/users/get/${id}`),
        api.get("/departments/get"),
      ]);

      const userData = userResponse.data;
      setFormData({
        nombre: userData.nombre || "",
        correo: userData.correo || "",
        departamentoId: userData.departamentoId || "",
        usuario_login: userData.usuario_login || "",
      });
      setDepartments(deptResponse.data);
      setLoading(false);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("Error al cargar los datos del usuario.");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.put(`/users/put/${id}`, formData);
      setMessage("Usuario de Crown actualizado correctamente.");
      setTimeout(() => navigate("/users"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar el usuario.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Editar Usuario: {formData.nombre}
      </Typography>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleUpdateUser} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
            Guardar cambios
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default EditCrownUser;