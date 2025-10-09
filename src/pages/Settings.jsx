// pages/Settings.jsx
import React, { useState, useContext } from "react";
import { Box, Typography, TextField, Button, Paper, Alert } from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { user } = useContext(AuthContext);
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

  const handleChangePassword = async () => {
    setError("");
    setMessage("");
    try {
      await api.put(`/users/change-password/${user.id}`, {
        currentPassword: formData.password,
        newPassword: formData.newPassword,
      });
      setMessage("Contraseña actualizada correctamente.");
      setFormData({ password: "", newPassword: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Error al cambiar contraseña.");
    }
  };

  const handleManageUsers = () => {
    navigate("/user-manager"); // Redirige a la página de gestión de usuarios
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
          Cambiar contraseña
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
        <Button variant="contained" onClick={handleChangePassword}>
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
            Como administrador, puedes acceder a la gestión de usuarios del sistema.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleManageUsers}
          >
            Ir a gestión de usuarios
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default Settings;
