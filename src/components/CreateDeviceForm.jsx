// src/components/CreateDeviceForm.jsx
import React, { useEffect, useState, useContext } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, 
  Button, Divider, Stack, ListSubheader, OutlinedInput, Chip, Checkbox, ListItemText,
  FormControlLabel, Switch, Fade, FormHelperText
} from "@mui/material";
import api from "../api/axios";
import { AlertContext } from "../context/AlertContext";
import { AuthContext } from "../context/AuthContext"; 
import { ROLES } from "../config/constants"; 
import HotelSelect from "./common/HotelSelect"; 

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: { style: { maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP, width: 250 } },
};

const CreateDeviceForm = ({ onClose, onDeviceCreated, setMessage, setError }) => {
  const { user } = useContext(AuthContext);
  
  // Detectar si es usuario Multihotel (Root, Corp, o Regional con >1 hotel)
  const isMultiHotelUser = user?.rol === ROLES.ROOT || user?.rol === ROLES.CORP_VIEWER || (user?.hotels && user.hotels.length > 1);

  const { control, handleSubmit, watch, setError: setFormError, setValue, formState: { errors } } = useForm({
    defaultValues: {
      etiqueta: "", nombre_equipo: "", descripcion: "", comentarios: "", ip_equipo: "",
      usuarioId: "", perfiles_usuario: [], tipoId: "", marca: "", modelo: "", numero_serie: "",
      sistemaOperativoId: "", licencia_so: "", office_version: "", office_tipo_licencia: "",
      office_serial: "", office_key: "", es_panda: false, garantia_numero_producto: "",
      garantia_numero_reporte: "", garantia_notes: "", garantia_inicio: "", garantia_fin: "",
      areaId: "", fecha_proxima_revision: "", isWarrantyApplied: false,
      hotelId: "" // Campo para Hotel (solo visible para MultiHotel)
    }
  });

  const isWarrantyApplied = watch("isWarrantyApplied");
  const selectedHotelId = watch("hotelId"); 

  const [users, setUsers] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [operatingSystems, setOperatingSystems] = useState([]);
  const [areas, setAreas] = useState([]); 
  const { refreshAlerts } = useContext(AlertContext);

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const [usersRes, deviceTypesRes, operatingSystemsRes, areasRes] = 
          await Promise.all([
            api.get("/users/get/all"),
            api.get("/device-types/get?limit=0"),
            api.get("/operating-systems/get?limit=0"),
            api.get("/areas/get?limit=0"), 
          ]);
        
        setUsers(Array.isArray(usersRes.data) ? usersRes.data : []);
        setDeviceTypes(Array.isArray(deviceTypesRes.data) ? deviceTypesRes.data : []);
        setOperatingSystems(Array.isArray(operatingSystemsRes.data) ? operatingSystemsRes.data : []);
        setAreas(Array.isArray(areasRes.data) ? areasRes.data : []); 
      } catch (err) {
        console.error("Error fetching form data:", err);
        if (setError) setError("Error al cargar los datos del formulario.");
      }
    };
    fetchFormData();
  }, [setError]);

  // Si cambia el hotel, limpiamos área y usuario
  useEffect(() => {
      if (isMultiHotelUser) {
          setValue("areaId", "");
          setValue("usuarioId", "");
      }
  }, [selectedHotelId, isMultiHotelUser, setValue]);

  const renderAreaOptions = () => {
    const options = [];
    let lastDept = null;
    
    // Filtro de áreas
    let filteredAreas = areas;
    if (isMultiHotelUser) {
        if (selectedHotelId) {
            filteredAreas = areas.filter(a => a.hotelId === Number(selectedHotelId));
        } else {
            filteredAreas = []; 
        }
    }

    const sortedAreas = [...filteredAreas].sort((a, b) => (a.departamento?.nombre || "").localeCompare(b.departamento?.nombre || ""));

    sortedAreas.forEach(area => {
      if (area.departamento?.nombre && area.departamento.nombre !== lastDept) {
        options.push(<ListSubheader key={`header-${area.departamentoId}`}>{area.departamento.nombre}</ListSubheader>);
        lastDept = area.departamento.nombre;
      }
      options.push(<MenuItem key={area.id} value={area.id} sx={{ pl: 4 }}>{area.nombre}</MenuItem>);
    });
    
    if (isMultiHotelUser && !selectedHotelId) {
        options.push(<MenuItem key="no-hotel" disabled>Primero selecciona un Hotel</MenuItem>);
    }
    
    return options;
  };

  const onSubmit = async (data) => {
    if (setError) setError("");
    if (setMessage) setMessage("");

    const payload = { ...data };
    
    if (payload.areaId) payload.areaId = Number(payload.areaId); else payload.areaId = null;
    if (payload.usuarioId) payload.usuarioId = Number(payload.usuarioId); else payload.usuarioId = null;
    if (payload.tipoId) payload.tipoId = Number(payload.tipoId);
    if (payload.sistemaOperativoId) payload.sistemaOperativoId = Number(payload.sistemaOperativoId); else payload.sistemaOperativoId = null;
    
    // Validación de Hotel
    if (isMultiHotelUser) {
        if (!payload.hotelId) {
            if (setError) setError("Es obligatorio seleccionar un Hotel.");
            return;
        }
        payload.hotelId = Number(payload.hotelId);
    } else {
        delete payload.hotelId; // Admin local: el backend lo inyecta
    }

    if (Array.isArray(payload.perfiles_usuario)) {
        payload.perfiles_usuario = payload.perfiles_usuario.length > 0 ? payload.perfiles_usuario.join(", ") : null;
    }

    if (!payload.isWarrantyApplied) {
        payload.garantia_numero_reporte = null;
        payload.garantia_notes = null;
    }
    delete payload.isWarrantyApplied; 

    ['garantia_inicio', 'garantia_fin', 'fecha_proxima_revision'].forEach(key => {
        if (!payload[key]) payload[key] = null;
        else payload[key] = new Date(payload[key]).toISOString();
    });

    try {
      await api.post("/devices/post", payload);
      if (setMessage) setMessage("Equipo creado exitosamente.");
      refreshAlerts();
      if (onDeviceCreated) onDeviceCreated();
      onClose();
    } catch (err) {
      const serverData = err.response?.data;
      if (serverData?.details && Array.isArray(serverData.details)) {
          const errorList = serverData.details.map(d => `• ${d.message}`).join("\n");
          if (setError) setError(`Corrige los siguientes errores:\n${errorList}`);
      } else {
          if (setError) setError(serverData?.error || "Error al crear el equipo.");
      }
    }
  };

  return (
    <Box sx={{ maxHeight: "85vh", overflowY: "auto", p: 3, bgcolor: "background.paper", borderRadius: 2 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }} color="text.primary">Crear nuevo equipo</Typography>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        
        {/* 👇 SELECCIÓN DE HOTEL (Para usuarios Multi-Hotel) */}
        {isMultiHotelUser && (
            <Box sx={{ mb: 3, p: 2, bgcolor: 'primary.50', borderRadius: 2, border: '1px dashed', borderColor: 'primary.main' }}>
                <Typography variant="subtitle2" color="primary.main" fontWeight="bold" mb={1}>
                    Ubicación del Activo
                </Typography>
                <Controller
                    name="hotelId"
                    control={control}
                    render={({ field }) => (
                        <HotelSelect 
                            value={field.value} 
                            onChange={field.onChange} 
                            error={!!errors.hotelId}
                            helperText="Selecciona la propiedad donde se asignará el equipo"
                            multiple={false} // Creación manual es de uno en uno
                        />
                    )}
                />
            </Box>
        )}
        
        <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }} color="text.secondary" fontWeight="bold">Información General</Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Controller
                    name="etiqueta" control={control}
                    render={({ field }) => <TextField {...field} label="Etiqueta" fullWidth />}
                />
                <Controller
                    name="numero_serie" control={control}
                    rules={{ required: "El número de serie es obligatorio" }}
                    render={({ field }) => <TextField {...field} label="Número de Serie" fullWidth required error={!!errors.numero_serie} helperText={errors.numero_serie?.message} />}
                />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Controller
                    name="nombre_equipo" control={control}
                    rules={{ required: "El nombre es obligatorio" }}
                    render={({ field }) => <TextField {...field} label="Nombre del equipo" fullWidth required error={!!errors.nombre_equipo} helperText={errors.nombre_equipo?.message} />}
                />
                <Controller
                    name="descripcion" control={control}
                    render={({ field }) => <TextField {...field} label="Descripción" fullWidth />}
                />
            </Stack>
            <Controller
                name="comentarios" control={control}
                render={({ field }) => <TextField {...field} label="Comentarios" fullWidth multiline rows={2} />}
            />
            {/* Resto de campos (IP, Marca, Modelo) igual que antes... */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Controller name="ip_equipo" control={control} render={({ field }) => <TextField {...field} label="Dirección IP" fullWidth />} />
                <Controller name="marca" control={control} rules={{ required: "Requerido" }} render={({ field }) => <TextField {...field} label="Marca" fullWidth required error={!!errors.marca} />} />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                 <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
                    <Controller name="modelo" control={control} rules={{ required: "Requerido" }} render={({ field }) => <TextField {...field} label="Modelo" fullWidth required error={!!errors.modelo} />} />
                 </Box>
            </Stack>
        </Stack>

        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }} color="text.secondary" fontWeight="bold">Asignación y Ubicación</Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Box sx={{ width: '100%' }}>
                    <FormControl fullWidth error={!!errors.areaId}>
                        <InputLabel>Área</InputLabel>
                        <Controller
                            name="areaId" control={control}
                            render={({ field }) => (
                                <Select {...field} label="Área">
                                    <MenuItem value=""><em>Ninguno</em></MenuItem>
                                    {renderAreaOptions()}
                                </Select>
                            )}
                        />
                    </FormControl>
                </Box>
                <Box sx={{ width: '100%' }}>
                    <FormControl fullWidth error={!!errors.usuarioId}>
                        <InputLabel>Responsable</InputLabel>
                        <Controller
                            name="usuarioId" control={control}
                            render={({ field }) => (
                                <Select {...field} label="Responsable">
                                    <MenuItem value=""><em>Ninguno</em></MenuItem>
                                    {users
                                      // Filtrar usuarios por el hotel seleccionado si es MultiHotel
                                      .filter(u => !isMultiHotelUser || (selectedHotelId && u.hotelId === Number(selectedHotelId)))
                                      .map((user) => (<MenuItem key={user.id} value={user.id}>{user.nombre}</MenuItem>))
                                    }
                                </Select>
                            )}
                        />
                    </FormControl>
                </Box>
            </Stack>
            
            <Box sx={{ width: '100%' }}>
                <FormControl fullWidth>
                    <InputLabel>Tipo *</InputLabel>
                    <Controller
                        name="tipoId" control={control}
                        rules={{ required: "El tipo es obligatorio" }}
                        render={({ field }) => (
                            <Select {...field} label="Tipo *">
                                <MenuItem value=""><em>Ninguno</em></MenuItem>
                                {deviceTypes.map((type) => (<MenuItem key={type.id} value={type.id}>{type.nombre}</MenuItem>))}
                            </Select>
                        )}
                    />
                    <FormHelperText>{errors.tipoId?.message}</FormHelperText>
                </FormControl>
            </Box>
        </Stack>
        
        {/* Resto del formulario (Software, Garantía) se mantiene igual... */}
        
        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 4 }}>
          <Button type="submit" variant="contained" color="primary">Crear Equipo</Button>
        </Stack>
      </form>
    </Box>
  );
};

export default CreateDeviceForm;