// src/pages/EditMaintenance.jsx
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, TextField, Button, Grid, Fade, 
  FormControl, InputLabel, Select, MenuItem, CircularProgress, 
  Divider, Stack, Alert
} from "@mui/material";

// Iconos
import SaveIcon from '@mui/icons-material/Save';
import EventIcon from '@mui/icons-material/Event';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EngineeringIcon from '@mui/icons-material/Engineering';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Importaciones Propias (Verifica que estas rutas existan)
import api from "../api/axios";
import { AlertContext } from "../context/AlertContext";
import PageHeader from "../components/common/PageHeader"; 
import SectionCard from "../components/common/SectionCard";
import StatusBadge from "../components/common/StatusBadge";

// Ajuste de ruta CSS: './styles' asume que 'styles' está en la misma carpeta que este archivo
import "./styles/ConfigButtons.css"; 

// Helper seguro para fechas
const safeDateValue = (dateString) => {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? "" : d.toISOString().substring(0, 10);
  } catch (e) {
    return "";
  }
};

const EditMaintenance = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshAlerts } = useContext(AlertContext);

  const [formData, setFormData] = useState({
    descripcion: "",
    fecha_programada: "",
    fecha_realizacion: "",
    estado: "pendiente",
    deviceId: "",
    diagnostico: "",
    acciones_realizadas: "",
    observaciones: "",
    tipo_mantenimiento: "Preventivo",
  });
  
  const [deviceInfo, setDeviceInfo] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMaintenanceData = async () => {
      try {
        setLoading(true);
        // Validamos que el ID exista
        if (!id) throw new Error("ID de mantenimiento no válido");

        const res = await api.get(`/maintenances/get/${id}`);
        
        // Verificamos que la respuesta tenga datos
        if (!res.data) throw new Error("No se recibieron datos del servidor");
        const data = res.data;
        
        // Guardamos info del equipo de forma segura
        setDeviceInfo(data.device || {}); 

        setFormData({
          descripcion: data.descripcion || "",
          fecha_programada: safeDateValue(data.fecha_programada),
          fecha_realizacion: safeDateValue(data.fecha_realizacion),
          estado: data.estado || "pendiente",
          deviceId: data.deviceId || "",
          diagnostico: data.diagnostico || "",
          acciones_realizadas: data.acciones_realizadas || "",
          observaciones: data.observaciones || "",
          tipo_mantenimiento: data.tipo_mantenimiento || "Preventivo",
        });
      } catch (err) {
        console.error("Error al cargar datos:", err);
        setError("No se pudo cargar el mantenimiento. Verifica la consola.");
      } finally {
        setLoading(false);
      }
    };
    fetchMaintenanceData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Auto-rellenar fecha si se marca como realizado
    if (name === "estado" && value === "realizado" && !formData.fecha_realizacion) {
      setFormData(prev => ({
        ...prev,
        estado: value,
        fecha_realizacion: new Date().toISOString().substring(0, 10)
      }));
    } else {
       setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // Conversión de fechas para enviar al backend
    const prepareDate = (d) => (d ? new Date(d).toISOString() : null);

    const payload = {
      ...formData,
      deviceId: Number(formData.deviceId),
      fecha_programada: prepareDate(formData.fecha_programada),
      fecha_realizacion: prepareDate(formData.fecha_realizacion),
    };

    try {
      await api.put(`/maintenances/put/${id}`, payload);
      if (refreshAlerts) refreshAlerts(); 
      setMessage("Mantenimiento actualizado correctamente.");
      setTimeout(() => navigate("/maintenances"), 1200);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Error al actualizar.");
    }
  };

  // Renderizado de carga
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  }

  // Renderizado de error fatal si no cargó nada
  if (!formData.deviceId && !loading && error) {
      return (
          <Box sx={{ p: 4 }}>
              <Alert severity="error">{error}</Alert>
              <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>Volver</Button>
          </Box>
      )
  }

  const isCompleted = formData.estado === 'realizado';

  return (
    <Box sx={{ pb: 4, bgcolor: '#f4f6f8', minHeight: '100vh' }}>
      
      {/* 1. HEADER */}
      <PageHeader 
        title={`Mantenimiento #${id || '...'}`}
        subtitle={deviceInfo?.nombre_equipo ? `${deviceInfo.nombre_equipo} (${deviceInfo.etiqueta || 'S/E'})` : "Equipo desconocido"}
        status={<StatusBadge status={formData.estado} />}
        onBack={() => navigate(-1)}
        actions={
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />} 
            onClick={handleUpdate}
            className="primary-action-button"
          >
            Guardar Cambios
          </Button>
        }
      />

      {/* 2. ALERTAS */}
      <Box sx={{ px: 3, mb: 2 }}>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      </Box>

      {/* 3. CONTENIDO (SPLIT VIEW) */}
      <Box component="form" noValidate sx={{ px: 3 }}>
        <Grid container spacing={3}>
          
          {/* === PANEL IZQUIERDO: PLANIFICACIÓN (Contexto) === */}
          <Grid item xs={12} md={5} lg={4}>
            <SectionCard title="Planificación Original" icon={<EventIcon />} color="text.secondary">
               <Stack spacing={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        Equipo Afectado
                    </Typography>
                    <Typography variant="body1" fontWeight="500">
                        {deviceInfo?.nombre_equipo || "N/A"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        SN: {deviceInfo?.numero_serie || "N/A"}
                    </Typography>
                  </Box>

                  <Divider />

                  <TextField
                    label="Tipo de Mantenimiento"
                    value={formData.tipo_mantenimiento}
                    fullWidth
                    InputProps={{ readOnly: true }} 
                    variant="filled"
                    size="small"
                  />

                  <TextField
                    label="Fecha Programada"
                    type="date"
                    value={formData.fecha_programada}
                    fullWidth
                    InputProps={{ readOnly: true }}
                    variant="filled"
                    size="small"
                  />

                  <TextField
                    label="Tarea Solicitada"
                    value={formData.descripcion}
                    fullWidth
                    multiline
                    rows={4}
                    InputProps={{ readOnly: true }}
                    variant="filled"
                  />
               </Stack>
            </SectionCard>
          </Grid>

          {/* === PANEL DERECHO: EJECUCIÓN (Editable) === */}
          <Grid item xs={12} md={7} lg={8}>
            <Stack spacing={3}>
                
                {/* TARJETA DE ESTADO */}
                <SectionCard title="Estado del Servicio" icon={<AssignmentIcon />}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Estado Actual</InputLabel>
                                <Select
                                  name="estado"
                                  value={formData.estado}
                                  onChange={handleChange}
                                  label="Estado Actual"
                                >
                                  <MenuItem value="pendiente">Pendiente</MenuItem>
                                  <MenuItem value="realizado">Realizado</MenuItem>
                                  <MenuItem value="cancelado">Cancelado</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Fecha de Realización"
                                name="fecha_realizacion"
                                type="date"
                                value={formData.fecha_realizacion}
                                onChange={handleChange}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                disabled={!isCompleted}
                                helperText={isCompleted ? "Fecha real del trabajo" : "Se habilita al completar"}
                            />
                        </Grid>
                    </Grid>
                </SectionCard>

                {/* TARJETA DE REPORTE TÉCNICO (Condicional) */}
                <Fade in={isCompleted} unmountOnExit>
                    <Box>
                        <SectionCard 
                            title="Informe Técnico" 
                            icon={<EngineeringIcon />}
                            color="success.main"
                        >
                            <Stack spacing={3}>
                                <Alert severity="info" icon={<CheckCircleIcon />} sx={{ mb: 1 }}>
                                    Documenta los hallazgos y soluciones para el historial del equipo.
                                </Alert>
                                
                                <TextField
                                    label="Diagnóstico (Hallazgos)"
                                    name="diagnostico"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={formData.diagnostico}
                                    onChange={handleChange}
                                    placeholder="¿Qué problema se encontró?"
                                />
                                <TextField
                                    label="Acciones Realizadas"
                                    name="acciones_realizadas"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    value={formData.acciones_realizadas}
                                    onChange={handleChange}
                                    placeholder="¿Qué procedimiento se aplicó?"
                                />
                                <TextField
                                    label="Observaciones Finales"
                                    name="observaciones"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    value={formData.observaciones}
                                    onChange={handleChange}
                                    placeholder="Recomendaciones o notas extra."
                                />
                            </Stack>
                        </SectionCard>
                    </Box>
                </Fade>

            </Stack>
          </Grid>

        </Grid>
      </Box>
    </Box>
  );
};

export default EditMaintenance;