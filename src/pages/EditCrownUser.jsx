// src/pages/EditCrownUser.jsx
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, TextField, Button, Grid,
  CircularProgress, Alert, MenuItem, ListSubheader,
  Stack, FormControlLabel, Switch, Divider, Chip, Avatar, FormControl, InputLabel,
  Select // 👈 AGREGADO: Faltaba importar Select
} from "@mui/material";

import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import DomainIcon from '@mui/icons-material/Domain';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import BadgeIcon from '@mui/icons-material/Badge';

import api from "../api/axios";
import PageHeader from "../components/common/PageHeader";
import SectionCard from "../components/common/SectionCard";

const EditCrownUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: { nombre: "", correo: "", areaId: "", usuario_login: "", isManager: false }
  });

  const [areas, setAreas] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  // Watchers para visualización
  const watchedName = watch("nombre");
  const watchedCorreo = watch("correo");
  const watchedAreaId = watch("areaId");
  const isManager = watch("isManager");

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

        reset({
          nombre: userData.nombre || "",
          correo: userData.correo || "",
          areaId: userData.areaId || "", 
          usuario_login: userData.usuario_login || "", 
          isManager: userData.es_jefe_de_area || false
        });
        
        setLoading(false);
      } catch (err) {
        setError("Error al cargar los datos del usuario.");
        setLoading(false);
      }
    };
    fetchUserAndAreas();
  }, [id, reset]);

  // Actualizar depto cuando cambia el area
  useEffect(() => {
      const selectedArea = areas.find(a => a.id === watchedAreaId);
      setDepartmentName(selectedArea?.departamento?.nombre || "N/A");
  }, [watchedAreaId, areas]);

  const onSubmit = async (data) => {
    setError(""); setMessage("");
    const payload = {
      ...data,
      areaId: data.areaId ? Number(data.areaId) : null,
      es_jefe_de_area: data.isManager
    };

    try {
      await api.put(`/users/put/${id}`, payload);
      setMessage("Usuario de Crown actualizado correctamente.");
      setTimeout(() => navigate("/users"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar.");
    }
  };

  const renderAreaOptions = () => {
    const options = [];
    let lastDept = null;
    const sortedAreas = [...areas].sort((a, b) => (a.departamento?.nombre || "").localeCompare(b.departamento?.nombre || ""));

    sortedAreas.forEach(area => {
      if (area.departamento?.nombre && area.departamento.nombre !== lastDept) {
        options.push(<ListSubheader key={`header-${area.id}`} sx={{ fontWeight: 'bold', color: 'primary.main' }}>{area.departamento.nombre}</ListSubheader>);
        lastDept = area.departamento.nombre;
      }
      options.push(<MenuItem key={area.id} value={area.id} sx={{ pl: 4 }}>{area.nombre}</MenuItem>);
    });
    return options;
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ pb: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      <PageHeader 
        title={watchedName}
        status={
            isManager ? <Chip icon={<SupervisorAccountIcon />} label="Jefe de Área" color="primary" size="small" sx={{ fontWeight: 'bold' }} /> 
                      : <Chip icon={<PersonIcon />} label="Staff" variant="outlined" size="small" />
        }
        onBack={() => navigate(-1)}
        actions={
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSubmit(onSubmit)} color="primary">Guardar Cambios</Button>
        }
      />

      <Box sx={{ px: 3, mb: 2 }}>
        {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      </Box>

      <Box component="form" noValidate sx={{ px: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <SectionCard title="Información Personal" icon={<BadgeIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
                    <Avatar sx={{ width: 64, height: 64, bgcolor: isManager ? 'primary.main' : 'grey.400', fontSize: '1.75rem' }}>
                        {watchedName ? watchedName.charAt(0).toUpperCase() : "?"}
                    </Avatar>
                    <Box>
                        <Typography variant="h6">{watchedName}</Typography>
                        <Typography variant="body2" color="text.secondary">{watchedCorreo || "Sin correo registrado"}</Typography>
                    </Box>
                </Box>

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Controller name="nombre" control={control} rules={{required:true}} render={({field})=><TextField {...field} label="Nombre" fullWidth required />} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Controller name="correo" control={control} render={({field})=><TextField {...field} label="Correo Electrónico" type="email" fullWidth />} />
                    </Grid>
                    <Grid item xs={12}>
                        <Controller name="usuario_login" control={control} render={({field})=><TextField {...field} label="Usuario" fullWidth helperText="Ej: CROWNCUN\usuario" />} />
                    </Grid>
                </Grid>
            </SectionCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
                <SectionCard title="Organización" icon={<DomainIcon />}>
                    <Stack spacing={3}>
                        <FormControl fullWidth>
                            <InputLabel>Área Asignada</InputLabel>
                            <Controller
                                name="areaId" control={control}
                                render={({ field }) => (
                                    <Select {...field} label="Área Asignada">
                                        <MenuItem value=""><em>Ninguna</em></MenuItem>
                                        {renderAreaOptions()}
                                    </Select>
                                )}
                            />
                        </FormControl>
                        <TextField label="Departamento" value={departmentName} fullWidth InputProps={{ readOnly: true }} variant="filled" size="small" />
                        <Divider />
                        <Controller
                            name="isManager" control={control}
                            render={({ field: { onChange, value } }) => (
                                <FormControlLabel control={<Switch checked={value} onChange={onChange} color="primary" />} label="Es Jefe de Área" />
                            )}
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