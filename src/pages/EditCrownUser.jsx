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
  CircularProgress,
  FormControlLabel, // 👈 AÑADIR
  Switch            // 👈 AÑADIR
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
  const [isManager, setIsManager] = useState(false); // 👈 AÑADIR ESTADO
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserAndDepartments = async () => {
      try {
        setLoading(true);
        // Cargar ambos en paralelo
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
        
        setIsManager(userData.es_jefe_de_area || false); // 👈 AÑADIR (cargar el valor)

        setDepartments(deptResponse.data || []);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("Error al cargar los datos del usuario.");
        setLoading(false);
      }
    };
    fetchUserAndDepartments();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const payload = {
      ...formData,
      departamentoId: formData.departamentoId || null,
      es_jefe_de_area: isManager // 👈 AÑADIR CAMPO AL PAYLOAD
    };

    try {
      await api.put(`/users/put/${id}`, payload);
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
          {/* ... (Campos Nombre, Correo, Departamento) ... */}
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
            Guardar cambios
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default EditCrownUser;