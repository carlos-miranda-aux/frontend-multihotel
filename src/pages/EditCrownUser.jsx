// src/pages/EditCrownUser.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, TextField, Button, Grid,
  CircularProgress, Alert, MenuItem, ListSubheader,
  Stack, FormControlLabel, Switch, Divider, Chip, Avatar
} from "@mui/material";

// Iconos
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import DomainIcon from '@mui/icons-material/Domain';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import BadgeIcon from '@mui/icons-material/Badge';

// Importaciones propias
import api from "../api/axios";
import PageHeader from "../components/common/PageHeader";
import SectionCard from "../components/common/SectionCard";
import "../pages/styles/ConfigButtons.css"; 

const EditCrownUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    areaId: "", 
    usuario_login: "",
  });
  const [isManager, setIsManager] = useState(false); 
  const [areas, setAreas] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  const [departmentName, setDepartmentName] = useState("N/A");

  useEffect(() => {
    const fetchUserAndAreas = async () => {
      try {
        setLoading(true);
        const [userResponse, areasRes] = await Promise.all([
          api.get(`/users/get/${id}`),
          api.get("/areas/get?limit=0"), 
        ]);

        const userData = userResponse.data;
        const areasData = areasRes.data || [];
        setAreas(areasData);

        setFormData({
          nombre: userData.nombre || "",
          correo: userData.correo || "",
          areaId: userData.areaId || "", 
          usuario_login: userData.usuario_login || "", 
        });
        
        setIsManager(userData.es_jefe_de_area || false);
        
        // Calcular nombre del departamento inicial
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
    
    // Auto-actualizar el nombre del departamento al cambiar el área
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
      areaId: formData.areaId ? Number(formData.areaId) : null,
      es_jefe_de_area: isManager
    };

    try {
      await api.put(`/users/put/${id}`, payload);
      setMessage("Usuario de Crown actualizado correctamente.");
      setTimeout(() => navigate("/users"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar el usuario.");
    }
  };

  // Renderizador de opciones agrupadas (mismo estilo que EditDevice)
  const renderAreaOptions = () => {
    const options = [];
    let lastDept = null;
    // Ordenar por departamento para agrupar visualmente
    const sortedAreas = [...areas].sort((a, b) => (a.departamento?.nombre || "").localeCompare(b.departamento?.nombre || ""));

    sortedAreas.forEach(area => {
      if (area.departamento?.nombre && area.departamento.nombre !== lastDept) {
        options.push(<ListSubheader key={`header-${area.id}`} sx={{ fontWeight: 'bold', color: 'primary.main' }}>{area.departamento.nombre}</ListSubheader>);
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
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4, bgcolor: '#f4f6f8', minHeight: '100vh' }}>
      
      {/* 1. HEADER */}
      <PageHeader 
        title={formData.nombre}
        // Badge personalizado para Jefes
        status={
            isManager ? (
                <Chip 
                    icon={<SupervisorAccountIcon />} 
                    label="Jefe de Área" 
                    color="primary" 
                    size="small" 
                    sx={{ fontWeight: 'bold' }}
                />
            ) : (
                <Chip 
                    icon={<PersonIcon />} 
                    label="Staff" 
                    variant="outlined" 
                    size="small" 
                />
            )
        }
        onBack={() => navigate(-1)}
        actions={
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />} 
            onClick={handleUpdateUser}
            className="primary-action-button"
          >
            Guardar Cambios
          </Button>
        }
      />

      {/* 2. MENSAJES */}
      <Box sx={{ px: 3, mb: 2 }}>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      </Box>

      {/* 3. CONTENIDO */}
      <Box component="form" noValidate sx={{ px: 3 }}>
        <Grid container spacing={3}>
          
          {/* === COLUMNA IZQUIERDA: DATOS PERSONALES === */}
          <Grid item xs={12} md={8}>
            <SectionCard title="Información Personal" icon={<BadgeIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
                    <Avatar 
                        sx={{ width: 64, height: 64, bgcolor: isManager ? 'primary.main' : 'grey.400', fontSize: '1.75rem' }}
                    >
                        {formData.nombre.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="h6">{formData.nombre}</Typography>
                        <Typography variant="body2" color="text.secondary">{formData.correo || "Sin correo registrado"}</Typography>
                    </Box>
                </Box>

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Correo Electrónico"
                            name="correo"
                            type="email"
                            value={formData.correo}
                            onChange={handleChange}
                            fullWidth
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            label="Usuario"
                            name="usuario_login"
                            value={formData.usuario_login}
                            onChange={handleChange}
                            fullWidth
                            helperText="Ej: CROWNCUN\usuario o ARRIVA\usuario"
                            InputProps={{
                                startAdornment: <Typography color="text.secondary" sx={{ mr: 1, fontSize: '0.8rem' }}></Typography>
                            }}
                        />
                    </Grid>
                </Grid>
            </SectionCard>
          </Grid>

          {/* === COLUMNA DERECHA: ORGANIZACIÓN === */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
                <SectionCard title="Organización" icon={<DomainIcon />}>
                    <Stack spacing={3}>
                        
                        {/* Selector de Área con estilo consistente */}
                        <TextField
                            select
                            label="Área Asignada"
                            name="areaId"
                            value={formData.areaId || ""}
                            onChange={handleChange}
                            fullWidth

                        >
                            <MenuItem value=""><em>Ninguna</em></MenuItem>
                            {renderAreaOptions()}
                        </TextField>
                        
                        {/* Departamento (Solo lectura) */}
                        <TextField
                            label="Departamento"
                            name="departamento"
                            value={departmentName}
                            fullWidth
                            InputProps={{ readOnly: true }}
                            variant="filled"
                            size="small"
                        />

                        <Divider />

                        {/* Switch de Jefe */}
                        <FormControlLabel
                            control={
                            <Switch
                                checked={isManager}
                                onChange={(e) => setIsManager(e.target.checked)}
                                color="primary"
                            />
                            }
                            label={
                                <Box>
                                    <Typography variant="body1" fontWeight={isManager ? "bold" : "normal"}>Es Jefe de Área</Typography>
                                </Box>
                            }
                        />
                    </Stack>
                </SectionCard>
            </Stack>
          </Grid>

        </Grid>
      </Box>
    </Box>
  );
};

export default EditCrownUser;