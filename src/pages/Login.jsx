// src/pages/Login.jsx
import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography, Paper, Alert } from "@mui/material";

import Logo from "../assets/Logo.png";
import HotelLogo from "../assets/cpcc.png";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/auth/login", formData);

      if (response.data.token) {
        const { token, user } = response.data;
        login(token, user);
        navigate("/home");
      } else {
        setError("No se recibió token. Intenta nuevamente.");
      }
    } catch (err) {
      console.error("Error completo:", err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || err.response.data.error || "Usuario o contraseña incorrectos.");
      } else if (err.request) {
        setError("No se pudo conectar con el servidor. Intenta más tarde.");
      } else {
        setError(err.message || "Ocurrió un error inesperado.");
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Paper elevation={4} sx={{ p: 4, borderRadius: 2, maxWidth: 450, width: "100%", textAlign: "center" }}>
        <Box sx={{ mb: 0.5, display: "flex", justifyContent: "center" }}>
          <img src={HotelLogo} alt="Crown Paradise Club" style={{ maxWidth: "150%", height: "auto" }} />
        </Box>

        <Box sx={{ mb: 0.5 }}>
          <img src={Logo} alt="SIMET Logo" style={{ width: "80px", height: "auto", opacity: 0.9 }} />
        </Box>

        <Typography variant="subtitle1" sx={{ mb: 3, color: "text.secondary" }}>
          Inicia sesión en tu cuenta
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Usuario o correo"
            name="identifier"
            value={formData.identifier}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Contraseña"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 1 }}
          >
            Ingresar
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;