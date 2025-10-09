// pages/EditDevice.jsx
import React, { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, Paper, Alert } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const EditDevice = () => {
  const { id } = useParams(); // ID del dispositivo que viene de la URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    modelo: "",
    serial: "",
    estado: "",
    tipo: "",
    sistema_operativo: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // 🔹 Traer información del dispositivo al cargar la página
  useEffect(() => {
    const fetchDevice = async () => {
      try {
        const response = await api.get(`/devices/get/${id}`);
        setFormData(response.data);
      } catch (err) {
        setError("Error al cargar el dispositivo");
      }
    };
    fetchDevice();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    setError("");
    setMessage("");
    try {
      await api.put(`/devices/put/${id}`, formData);
      setMessage("Equipo actualizado correctamente.");
      // Redirigir al inventario después de actualizar
      setTimeout(() => navigate("/inventory"), 1000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar el equipo.");
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Editar equipo
      </Typography>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3 }}>
        <TextField
          label="Nombre"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Modelo"
          name="modelo"
          value={formData.modelo}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Serial"
          name="serial"
          value={formData.serial}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Estado"
          name="estado"
          value={formData.estado}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Tipo"
          name="tipo"
          value={formData.tipo}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Sistema operativo"
          name="sistema_operativo"
          value={formData.sistema_operativo}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button variant="contained" onClick={handleUpdate}>
          Guardar cambios
        </Button>
      </Paper>
    </Box>
  );
};

export default EditDevice;
