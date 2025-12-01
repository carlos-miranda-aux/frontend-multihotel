// src/pages/EditMaintenance.jsx
import React, { useState, useEffect, useContext } from "react";
import { useForm, Controller } from "react-hook-form"; // 👈 Hook Form
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, TextField, Button, Grid, Fade, 
  FormControl, InputLabel, Select, MenuItem, CircularProgress, 
  Divider, Stack, Alert
} from "@mui/material";

import SaveIcon from '@mui/icons-material/Save';
import EventIcon from '@mui/icons-material/Event';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EngineeringIcon from '@mui/icons-material/Engineering';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import api from "../api/axios";
import { AlertContext } from "../context/AlertContext";
import PageHeader from "../components/common/PageHeader"; 
import SectionCard from "../components/common/SectionCard";
import StatusBadge from "../components/common/StatusBadge";
import { MAINTENANCE_STATUS, MAINTENANCE_TYPE } from "../config/constants"; 

const safeDateValue = (dateString) => {
  if (!dateString) return "";
  try { return new Date(dateString).toISOString().substring(0, 10); } catch (e) { return ""; }
};

const EditMaintenance = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshAlerts } = useContext(AlertContext);

  const { control, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      descripcion: "", fecha_programada: "", fecha_realizacion: "",
      estado: MAINTENANCE_STATUS.PENDING, deviceId: "", diagnostico: "",
      acciones_realizadas: "", observaciones: "", tipo_mantenimiento: MAINTENANCE_TYPE.PREVENTIVE,
    }
  });

  const estadoActual = watch("estado"); // Observamos el estado para mostrar campos extra
  const fechaRealizacionActual = watch("fecha_realizacion");

  const [deviceInfo, setDeviceInfo] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMaintenanceData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/maintenances/get/${id}`);
        const data = res.data;
        setDeviceInfo(data.device || {}); 

        reset({
          descripcion: data.descripcion || "",
          fecha_programada: safeDateValue(data.fecha_programada),
          fecha_realizacion: safeDateValue(data.fecha_realizacion),
          estado: data.estado || MAINTENANCE_STATUS.PENDING,
          deviceId: data.deviceId || "",
          diagnostico: data.diagnostico || "",
          acciones_realizadas: data.acciones_realizadas || "",
          observaciones: data.observaciones || "",
          tipo_mantenimiento: data.tipo_mantenimiento || MAINTENANCE_TYPE.PREVENTIVE,
        });
      } catch (err) {
        setError("No se pudo cargar el mantenimiento.");
      } finally {
        setLoading(false);
      }
    };
    fetchMaintenanceData();
  }, [id, reset]);

  // Efecto para auto-llenar fecha si cambia a completado
  useEffect(() => {
    if (estadoActual === MAINTENANCE_STATUS.COMPLETED && !fechaRealizacionActual) {
        setValue("fecha_realizacion", new Date().toISOString().substring(0, 10));
    }
  }, [estadoActual, fechaRealizacionActual, setValue]);

  const onSubmit = async (data) => {
    setError(""); setMessage("");
    const prepareDate = (d) => (d ? new Date(d).toISOString() : null);

    const payload = {
      ...data,
      deviceId: Number(data.deviceId),
      fecha_programada: prepareDate(data.fecha_programada),
      fecha_realizacion: prepareDate(data.fecha_realizacion),
    };

    try {
      await api.put(`/maintenances/put/${id}`, payload);
      if (refreshAlerts) refreshAlerts(); 
      setMessage("Mantenimiento actualizado correctamente.");
      setTimeout(() => navigate("/maintenances"), 1200);
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar.");
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ pb: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      
      <PageHeader 
        title={`Mantenimiento #${id || '...'}`}
        subtitle={deviceInfo?.nombre_equipo ? `${deviceInfo.nombre_equipo} (${deviceInfo.etiqueta || 'S/E'})` : "Equipo desconocido"}
        status={<StatusBadge status={estadoActual} />}
        onBack={() => navigate(-1)}
        actions={
          <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={handleSubmit(onSubmit)}>
            Guardar Cambios
          </Button>
        }
      />

      <Box sx={{ px: 3, mb: 2 }}>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      </Box>

      <Box component="form" noValidate sx={{ px: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={5} lg={4}>
            <SectionCard title="Planificación Original" icon={<EventIcon />} color="text.secondary">
               <Stack spacing={3}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Equipo Afectado</Typography>
                    <Typography variant="body1" fontWeight="500">{deviceInfo?.nombre_equipo || "N/A"}</Typography>
                    <Typography variant="body2" color="text.secondary">SN: {deviceInfo?.numero_serie || "N/A"}</Typography>
                  </Box>
                  <Divider />
                  <Controller name="tipo_mantenimiento" control={control} render={({ field }) => <TextField {...field} label="Tipo" fullWidth InputProps={{ readOnly: true }} variant="filled" size="small" />} />
                  <Controller name="fecha_programada" control={control} render={({ field }) => <TextField {...field} label="Fecha Programada" type="date" fullWidth InputProps={{ readOnly: true }} variant="filled" size="small" />} />
                  <Controller name="descripcion" control={control} render={({ field }) => <TextField {...field} label="Tarea Solicitada" fullWidth multiline rows={4} InputProps={{ readOnly: true }} variant="filled" />} />
               </Stack>
            </SectionCard>
          </Grid>

          <Grid item xs={12} md={7} lg={8}>
            <Stack spacing={3}>
                <SectionCard title="Estado del Servicio" icon={<AssignmentIcon />}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                                <InputLabel>Estado Actual</InputLabel>
                                <Controller
                                    name="estado" control={control}
                                    render={({ field }) => (
                                        <Select {...field} label="Estado Actual">
                                            <MenuItem value={MAINTENANCE_STATUS.PENDING}>Pendiente</MenuItem>
                                            <MenuItem value={MAINTENANCE_STATUS.COMPLETED}>Realizado</MenuItem>
                                            <MenuItem value={MAINTENANCE_STATUS.CANCELLED}>Cancelado</MenuItem>
                                        </Select>
                                    )}
                                />
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Controller
                                name="fecha_realizacion" control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Fecha de Realización" type="date" fullWidth InputLabelProps={{ shrink: true }} disabled={estadoActual !== MAINTENANCE_STATUS.COMPLETED} helperText={estadoActual === MAINTENANCE_STATUS.COMPLETED ? "Fecha real del trabajo" : "Se habilita al completar"} />
                                )}
                            />
                        </Grid>
                    </Grid>
                </SectionCard>

                <Fade in={estadoActual === MAINTENANCE_STATUS.COMPLETED} unmountOnExit>
                    <Box>
                        <SectionCard title="Informe Técnico" icon={<EngineeringIcon />} color="success.main">
                            <Stack spacing={3}>
                                <Alert severity="info" icon={<CheckCircleIcon />} sx={{ mb: 1 }}>Documenta los hallazgos y soluciones.</Alert>
                                <Controller name="diagnostico" control={control} render={({ field }) => <TextField {...field} label="Diagnóstico" fullWidth multiline rows={3} placeholder="¿Qué problema se encontró?" />} />
                                <Controller name="acciones_realizadas" control={control} render={({ field }) => <TextField {...field} label="Acciones Realizadas" fullWidth multiline rows={3} placeholder="¿Qué procedimiento se aplicó?" />} />
                                <Controller name="observaciones" control={control} render={({ field }) => <TextField {...field} label="Observaciones Finales" fullWidth multiline rows={2} placeholder="Recomendaciones o notas extra." />} />
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