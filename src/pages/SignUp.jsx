import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Paper,
  Alert,
} from "@mui/material";

import Logo from "../assets/logo.png"; // Ruta de tu logo

const SignUp = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    nombre: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/auth/register", formData);

      if (response.data.token) {
        const { token, user } = response.data;
        login(token, user);
        navigate("/home");
      } else {
        setSuccess("Usuario creado correctamente, ahora puedes iniciar sesión.");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (err) {
      console.error("Error completo:", err);

      if (err.response && err.response.data) {
        setError(
          err.response.data.message ||
            err.response.data.error ||
            "Error al crear el usuario."
        );
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
        backgroundColor: "#F8F9FA",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <Paper
        elevation={4}
        sx={{
          padding: 4,
          borderRadius: 2,
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
        }}
      >
        {/* Logo */}
        <Box sx={{ mb: 2 }}>
          <img src={Logo} alt="SIMET Logo" style={{ width: "100px", height: "auto" }} />
        </Box>

        <Typography variant="subtitle1" sx={{ mb: 3, color: "#555" }}>
          Crea tu cuenta
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Nombre completo"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
          />
          <TextField
            label="Nombre de usuario"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <TextField
            label="Correo electrónico"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <TextField
            label="Contraseña"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <Button
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: "#9D3194",
              ":hover": { backgroundColor: "#7a2473" },
              mt: 1,
            }}
          >
            Registrarse
          </Button>
        </Box>

        <Typography sx={{ mt: 2, fontSize: "0.9rem", color: "#555" }}>
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" sx={{ color: "#9D3194", textDecoration: "none" }}>
            Inicia sesión
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default SignUp;
