// pages/EditDevice.jsx
import React, { useState, useEffect } from "react";
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
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const EditDevice = () => {
  const { id } = useParams(); // ID del dispositivo que viene de la URL
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre_equipo: "",
    modelo: "",
    numero_serie: "",
    ip_equipo: "", // 👈 Campo agregado aquí
    etiqueta: "",
    descripcion: "",
    usuarioId: "",
    tipoId: "",
    estadoId: "",
    sistemaOperativoId: "",
    marca: "",
  });

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [deviceStatuses, setDeviceStatuses] = useState([]);
  const [operatingSystems, setOperatingSystems] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // 🔹 Traer información del dispositivo al cargar la página
  useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        setLoading(true);
        const [deviceResponse, usersRes, deviceTypesRes, deviceStatusesRes, operatingSystemsRes] = await Promise.all([
          api.get(`/devices/get/${id}`),
          api.get("/users/get"),
          api.get("/device-types/get"),
          api.get("/device-status/get"),
          api.get("/operating-systems/get"),
        ]);

        const deviceData = deviceResponse.data;
        setFormData({
          nombre_equipo: deviceData.nombre_equipo || "",
          modelo: deviceData.modelo || "",
          numero_serie: deviceData.numero_serie || "",
          ip_equipo: deviceData.ip_equipo || "", // 👈 Asignación del valor
          etiqueta: deviceData.etiqueta || "",
          descripcion: deviceData.descripcion || "",
          usuarioId: deviceData.usuarioId || "",
          tipoId: deviceData.tipoId || "",
          estadoId: deviceData.estadoId || "",
          sistemaOperativoId: deviceData.sistemaOperativoId || "",
          marca: deviceData.marca || "",
        });
        setUsers(usersRes.data);
        setDeviceTypes(deviceTypesRes.data);
        setDeviceStatuses(deviceStatusesRes.data);
        setOperatingSystems(operatingSystemsRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Error al cargar el dispositivo:", err);
        setError("Error al cargar el dispositivo");
        setLoading(false);
      }
    };
    fetchDeviceData();
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
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Editar equipo
      </Typography>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleUpdate} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Etiqueta"
            name="etiqueta"
            value={formData.etiqueta}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Nombre"
            name="nombre_equipo"
            value={formData.nombre_equipo}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Número de Serie"
            name="numero_serie"
            value={formData.numero_serie}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="IP del equipo"
            name="ip_equipo"
            value={formData.ip_equipo}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Marca"
            name="marca"
            value={formData.marca}
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
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Tipo</InputLabel>
            <Select
              name="tipoId"
              value={formData.tipoId}
              onChange={handleChange}
              label="Tipo"
            >
              <MenuItem value="">
                <em>Ninguno</em>
              </MenuItem>
              {deviceTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>{type.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Estado</InputLabel>
            <Select
              name="estadoId"
              value={formData.estadoId}
              onChange={handleChange}
              label="Estado"
            >
              <MenuItem value="">
                <em>Ninguno</em>
              </MenuItem>
              {deviceStatuses.map((status) => (
                <MenuItem key={status.id} value={status.id}>{status.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Sistema Operativo</InputLabel>
            <Select
              name="sistemaOperativoId"
              value={formData.sistemaOperativoId}
              onChange={handleChange}
              label="Sistema Operativo"
            >
              <MenuItem value="">
                <em>Ninguno</em>
              </MenuItem>
              {operatingSystems.map((os) => (
                <MenuItem key={os.id} value={os.id}>{os.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Usuario Asignado</InputLabel>
            <Select
              name="usuarioId"
              value={formData.usuarioId}
              onChange={handleChange}
              label="Usuario Asignado"
            >
              <MenuItem value="">
                <em>Ninguno</em>
              </MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>{user.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button type="submit" variant="contained" onClick={handleUpdate}>
            Guardar cambios
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default EditDevice;