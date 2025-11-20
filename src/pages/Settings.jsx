// src/pages/Settings.jsx
import React, { useState, useContext } from "react";
import { Box, Typography, TextField, Button, Paper, Alert } from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import "../pages/styles/ConfigButtons.css"; // 👈 REUTILIZAR LA IMPORTACIÓN

const Settings = () => {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "",
    newPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      // Endpoint para cambiar la contraseña del usuario logueado
      await api.put(`/auth/put/${user.id}/password`, {
        password: formData.newPassword,
      });
      setMessage("Contraseña actualizada correctamente.");
      setFormData({ password: "", newPassword: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Error al cambiar contraseña.");
    }
  };

  const handleAdminSettings = () => {
    navigate("/admin-settings"); // 👈 Nueva ruta para las configuraciones de admin
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Configuraciones
      </Typography>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {/* Cambiar contraseña */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Cambiar mi contraseña
        </Typography>
        <TextField
          label="Contraseña actual"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Nueva contraseña"
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button 
            variant="contained" 
            onClick={handleUpdate}
            className="primary-action-button" // 👈 Aplicar clase CSS
        >
          Cambiar contraseña
        </Button>
      </Paper>

      {/* Solo visible para administradores */}
      {user?.rol === "ADMIN" && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Gestión del sistema
          </Typography>
          <Typography sx={{ mb: 2 }}>
            Como administrador, puedes gestionar las tablas de datos maestros del sistema.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAdminSettings}
            className="primary-action-button" // 👈 Aplicar clase CSS
          >
            Ir a configuración de administrador
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default Settings;