import React, { useState, useEffect, useContext } from "react";
import { useForm, Controller } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, TextField, Button, Grid, CircularProgress, Alert, MenuItem, ListSubheader,
  Stack, FormControlLabel, Switch, Divider, Chip, Avatar, FormControl, InputLabel, Select
} from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import BadgeIcon from '@mui/icons-material/Badge';
import DomainIcon from '@mui/icons-material/Domain';

import api from "../api/axios";
import PageHeader from "../components/common/PageHeader";
import SectionCard from "../components/common/SectionCard";
import { AuthContext } from "../context/AuthContext";
import { ROLES } from "../config/constants";

const EditCrownUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, getHotelName } = useContext(AuthContext);
  const isRoot = user?.rol === ROLES.ROOT;

  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: { nombre: "", correo: "", areaId: "", usuario_login: "", isManager: false, hotelId: "" }
  });

  const [areas, setAreas] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  const watchedName = watch("nombre");
  const watchedHotelId = watch("hotelId");

  useEffect(() => {
    const fetchUserAndAreas = async () => {
      try {
        setLoading(true);
        const [userResponse, areasRes] = await Promise.all([
          api.get(`/users/get/${id}`),
          api.get("/areas/get?limit=0"), 
        ]);

        const userData = userResponse.data;
        setAreas(areasRes.data || []);

        reset({
          nombre: userData.nombre || "",
          correo: userData.correo || "",
          areaId: userData.areaId || "", 
          usuario_login: userData.usuario_login || "", 
          isManager: userData.es_jefe_de_area || false,
          hotelId: userData.hotelId
        });
        setLoading(false);
      } catch (err) {
        setError("Error al cargar los datos.");
        setLoading(false);
      }
    };
    fetchUserAndAreas();
  }, [id, reset]);

  const onSubmit = async (data) => {
    setError(""); setMessage("");
    const payload = {
      ...data,
      areaId: data.areaId ? Number(data.areaId) : null,
      es_jefe_de_area: data.isManager
    };
    delete payload.isManager; 
    delete payload.hotelId;

    try {
      await api.put(`/users/put/${id}`, payload);
      setMessage("Guardado.");
      setTimeout(() => navigate("/users"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar.");
    }
  };

  const renderAreaOptions = () => {
    const options = [];
    let lastDept = null;
    // Filtrar áreas por el hotel del usuario editado
    const filteredAreas = areas.filter(a => !isRoot || (a.hotelId === Number(watchedHotelId)));
    const sortedAreas = [...filteredAreas].sort((a, b) => (a.departamento?.nombre || "").localeCompare(b.departamento?.nombre || ""));

    sortedAreas.forEach(area => {
      if (area.departamento?.nombre && area.departamento.nombre !== lastDept) {
        options.push(<ListSubheader key={`header-${area.id}`}>{area.departamento.nombre}</ListSubheader>);
        lastDept = area.departamento.nombre;
      }
      options.push(<MenuItem key={area.id} value={area.id} sx={{ pl: 4 }}>{area.nombre}</MenuItem>);
    });
    return options;
  };
  
  const hotelLabel = getHotelName(watchedHotelId);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ pb: 4, bgcolor: 'background.default', minHeight: '100vh' }}>
      <PageHeader 
        title={watchedName}
        subtitle={isRoot ? `Hotel: ${hotelLabel}` : "Editar información"}
        onBack={() => navigate(-1)}
        actions={<Button variant="contained" startIcon={<SaveIcon />} onClick={handleSubmit(onSubmit)} color="primary">Guardar</Button>}
      />

      <Box sx={{ px: 3 }}>
         {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
         <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
                <SectionCard title="Datos Personales" icon={<BadgeIcon />}>
                    <Stack spacing={2}>
                        <Controller name="nombre" control={control} render={({field}) => <TextField {...field} label="Nombre" fullWidth />} />
                        <Controller name="correo" control={control} render={({field}) => <TextField {...field} label="Correo" fullWidth />} />
                        <Controller name="usuario_login" control={control} render={({field}) => <TextField {...field} label="Usuario Login" fullWidth />} />
                    </Stack>
                </SectionCard>
            </Grid>
            <Grid item xs={12} md={4}>
                <SectionCard title="Asignación" icon={<DomainIcon />}>
                    <Stack spacing={2}>
                        <FormControl fullWidth><InputLabel>Área</InputLabel><Controller name="areaId" control={control} render={({field})=><Select {...field} label="Área"><MenuItem value=""><em>Ninguna</em></MenuItem>{renderAreaOptions()}</Select>}/></FormControl>
                        <Controller name="isManager" control={control} render={({field:{onChange, value}})=><FormControlLabel control={<Switch checked={value} onChange={onChange}/>} label="Es Jefe de Área"/>} />
                    </Stack>
                </SectionCard>
            </Grid>
         </Grid>
      </Box>
    </Box>
  );
};

export default EditCrownUser;