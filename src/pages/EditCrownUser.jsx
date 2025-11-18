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
  FormControlLabel, 
  Switch,
  ListSubheader // 👈 Importar para agrupar áreas
} from "@mui/material";
import api from "../api/axios";

const EditCrownUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    areaId: "", // 👈 CAMBIO: Usar areaId
    usuario_login: "",
  });
  const [isManager, setIsManager] = useState(false); 
  const [areas, setAreas] = useState([]); // 👈 CAMBIO: Cargar áreas
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  // Estado para el departamento derivado (solo display)
  const [departmentName, setDepartmentName] = useState("N/A");

  useEffect(() => {
    const fetchUserAndAreas = async () => {
      try {
        setLoading(true);
        // Cargar usuario y áreas en paralelo
        const [userResponse, areasRes] = await Promise.all([ // 👈 CAMBIO: areasRes
          api.get(`/users/get/${id}`),
          api.get("/areas/get"), // 👈 CAMBIO: Usar ruta de áreas
        ]);

        const userData = userResponse.data;
        const areasData = areasRes.data || [];
        setAreas(areasData); // Guardar lista de áreas

        setFormData({
          nombre: userData.nombre || "",
          correo: userData.correo || "",
          areaId: userData.areaId || "", // 👈 Cargar areaId
          usuario_login: userData.usuario_login || "",
        });
        
        setIsManager(userData.es_jefe_de_area || false);
        
        // Determinar y establecer el nombre del departamento
        const assignedArea = areasData.find(a => a.id === userData.areaId);
        setDepartmentName(assignedArea?.departamento?.nombre || "N/A");

        setLoading(false);
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("Error al cargar los datos del usuario.");
        setLoading(false);
      }
    };
    fetchUserAndAreas();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Actualizar nombre del departamento si se selecciona una nueva área
    if (name === 'areaId') {
      const selectedArea = areas.find(a => a.id === value);
      setDepartmentName(selectedArea?.departamento?.nombre || "N/A");
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const payload = {
      ...formData,
      areaId: formData.areaId || null, // 👈 ENVIAR areaId
      es_jefe_de_area: isManager
    };
    
    // Convertir areaId a número si no es nulo
    if (payload.areaId) {
        payload.areaId = Number(payload.areaId);
    }

    try {
      await api.put(`/users/put/${id}`, payload);
      setMessage("Usuario de Crown actualizado correctamente.");
      setTimeout(() => navigate("/users"), 2000);
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar el usuario.");
    }
  };

  // Agrupar áreas por departamento para el Select
  const renderAreaOptions = () => {
    const options = [];
    let lastDept = null;

    areas.forEach(area => {
      if (area.departamento?.nombre && area.departamento.nombre !== lastDept) {
        options.push(<ListSubheader key={`header-${area.departamentoId}`}>{area.departamento.nombre}</ListSubheader>);
        lastDept = area.departamento.nombre;
      }
      options.push(
        <MenuItem key={area.id} value={area.id} sx={{ pl: 4 }}>
          {area.nombre}
        </MenuItem>
      );
    });
    return options;
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
          
          {/* SELECTOR DE ÁREA */}
          <FormControl fullWidth>
            <InputLabel>Área</InputLabel>
            <Select
              name="areaId"
              value={formData.areaId || ""} // Asegurar que sea string vacío si es null
              onChange={handleChange}
              label="Área"
            >
              <MenuItem value="">
                <em>Ninguna</em>
              </MenuItem>
              {renderAreaOptions()}
            </Select>
          </FormControl>
          
          {/* DEPARTAMENTO DERIVADO (SOLO LECTURA) */}
          <TextField
            label="Departamento (Automático)"
            name="departamento"
            value={departmentName}
            fullWidth
            InputProps={{ readOnly: true }}
            disabled
          />
          
          <TextField
            label="Usuario de Login"
            name="usuario_login"
            value={formData.usuario_login}
            onChange={handleChange}
            fullWidth
          />

          <FormControlLabel
            control={
              <Switch
                checked={isManager}
                onChange={(e) => setIsManager(e.target.checked)}
              />
            }
            label="Es Jefe de Área (Recibe notificaciones)"
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