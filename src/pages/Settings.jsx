// src/pages/Settings.jsx
import React, { useState, useContext } from "react";
import {
  Box, Typography, TextField, Button, Alert, 
  Stack, Divider, Avatar, Container, Paper
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import SaveIcon from '@mui/icons-material/Save';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import VpnKeyIcon from '@mui/icons-material/VpnKey';

import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import PageHeader from "../components/common/PageHeader";

// ❌ ELIMINADO: import "../pages/styles/ConfigButtons.css";

const Settings = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: "", newPassword: "", confirmPassword: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");

    if (!formData.password || !formData.newPassword) {
        setError("Por favor ingresa tu contraseña actual y la nueva.");
        return;
    }
    if (formData.newPassword.length < 6) {
        setError("La nueva contraseña debe tener al menos 6 caracteres.");
        return;
    }
    if (formData.confirmPassword && formData.newPassword !== formData.confirmPassword) {
        setError("Las nuevas contraseñas no coinciden.");
        return;
    }

    try {
      await api.put(`/auth/put/${user.id}/password`, { password: formData.newPassword });
      setMessage("Tu contraseña ha sido actualizada exitosamente.");
      setFormData({ password: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Error al cambiar la contraseña.");
    }
  };

  return (
    <Box sx={{ pb: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      
      <PageHeader 
        title="Configuración"
        subtitle="Gestiona tu perfil y seguridad"
        actions={
          user?.rol === "ADMIN" && (
            <Button 
              variant="outlined" 
              color="primary"
              startIcon={<AdminPanelSettingsIcon />}
              onClick={() => navigate("/admin-settings")}
              sx={{ bgcolor: 'background.paper' }}
            >
              Panel de Administración
            </Button>
          )
        }
      />

      <Container maxWidth="md" sx={{ mt: -2 }}>
        {message && <Alert severity="success" sx={{ mb: 3 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            
            {/* SECCIÓN PERFIL */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 3, mb: 4 }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2.5rem' }}>
                    {user?.nombre?.charAt(0) || user?.username?.charAt(0)}
                </Avatar>
                <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                    <Typography variant="h5" fontWeight="bold">
                        {user?.nombre || user?.username}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 0.5 }}>
                        {user?.email}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                        <Typography variant="caption" sx={{ bgcolor: 'action.hover', px: 1, py: 0.5, borderRadius: 1, fontWeight: 'bold', color: 'text.secondary', border: '1px solid', borderColor: 'divider' }}>
                            ROL: {user?.rol}
                        </Typography>
                      <Typography variant="caption" sx={{ bgcolor: 'action.hover', px: 1, py: 0.5, borderRadius: 1, fontWeight: 'bold', color: 'text.secondary', border: '1px solid', borderColor: 'divider' }}>
                            USUARIO: {user?.username}
                      </Typography>
                    </Box>
                </Box>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* SECCIÓN SEGURIDAD */}
            <Box component="form" onSubmit={handleUpdate} sx={{ maxWidth: 500, margin: '0 auto' }}>
                <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VpnKeyIcon color="action" /> Cambiar Contraseña
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Actualiza tu contraseña periódicamente para mantener tu cuenta segura.
                </Typography>

                <Stack spacing={2}>
                    <TextField label="Contraseña Actual" type="password" name="password" value={formData.password} onChange={handleChange} fullWidth required />
                    <Box sx={{ height: 8 }} />
                    <TextField label="Nueva Contraseña" type="password" name="newPassword" value={formData.newPassword} onChange={handleChange} fullWidth required helperText="Mínimo 6 caracteres" />
                    <TextField label="Confirmar Nueva Contraseña" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} fullWidth placeholder="Repite la nueva contraseña" />
                </Stack>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                    <Button 
                        type="submit"
                        variant="contained" 
                        color="primary"
                        size="large"
                        startIcon={<SaveIcon />}
                        sx={{ px: 4, py: 1.2 }}
                    >
                        Actualizar Seguridad
                    </Button>
                </Box>
            </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Settings;