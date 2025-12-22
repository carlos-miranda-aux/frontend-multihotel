import React, { useEffect, useState, useContext } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Box, Typography, TextField, FormControl, InputLabel, Select, MenuItem, 
  Button, Divider, Stack, ListSubheader, OutlinedInput, Chip, Checkbox, ListItemText,
  FormControlLabel, Switch, Fade, FormHelperText, Grid, Alert, Autocomplete // 👈 Autocomplete importado
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
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const contextHotelId = auth?.selectedHotelId;
  
  const isMultiHotelUser = user?.rol === ROLES.ROOT || user?.rol === ROLES.CORP_VIEWER || (user?.hotels && user.hotels.length > 1);
  const isContextActive = !!contextHotelId; 

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      // General
      etiqueta: "", nombre_equipo: "", descripcion: "", comentarios: "", ip_equipo: "",
      marca: "", modelo: "", numero_serie: "",
      
      // Asignación
      usuarioId: "", perfiles_usuario: [], tipoId: "", areaId: "", 
      
      // Software
      sistemaOperativoId: "", licencia_so: "", office_version: "", office_tipo_licencia: "",
      office_serial: "", office_key: "", es_panda: false, 
      
      // Garantía
      garantia_numero_producto: "", garantia_numero_reporte: "", garantia_notes: "", 
      garantia_inicio: "", garantia_fin: "", fecha_proxima_revision: "", isWarrantyApplied: false,
      
      // Multi-tenant
      hotelId: contextHotelId ? Number(contextHotelId) : "" 
    }
  });

  const isWarrantyApplied = watch("isWarrantyApplied");
  const formHotelId = watch("hotelId"); 
  const watchedAreaId = watch("areaId"); // 👈 Observamos el área seleccionada para filtrar usuarios

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

  // Si cambia el hotel (y no estamos en modo contexto fijo), limpiamos área y usuario
  useEffect(() => {
      if (isMultiHotelUser && !isContextActive) {
          setValue("areaId", "");
          setValue("usuarioId", "");
      }
  }, [formHotelId, isMultiHotelUser, setValue, isContextActive]);

  const renderAreaOptions = () => {
    const options = [];
    let lastDept = null;
    
    let filteredAreas = areas;
    if (isMultiHotelUser) {
        if (formHotelId) {
            filteredAreas = areas.filter(a => a.hotelId === Number(formHotelId));
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
    
    if (isMultiHotelUser && !formHotelId) {
        options.push(<MenuItem key="no-hotel" disabled>Primero selecciona un Hotel</MenuItem>);
    }
    
    return options;
  };

  /**
   * Lógica de filtrado de usuarios para el Autocomplete
   */
  const getFilteredUsers = () => {
    let list = users;
    
    // 1. Filtrar por Hotel seleccionado
    if (isMultiHotelUser && formHotelId) {
        list = list.filter(u => u.hotelId === Number(formHotelId));
    }
    
    // 2. Filtrar por Área si ya se seleccionó una manualmente
    if (watchedAreaId) {
        list = list.filter(u => u.areaId === Number(watchedAreaId));
    }
    
    return list;
  };

  const onSubmit = async (data) => {
    if (setError) setError("");
    if (setMessage) setMessage("");

    const payload = { ...data };
    
    // Convertir IDs
    if (payload.areaId) payload.areaId = Number(payload.areaId); else payload.areaId = null;
    if (payload.usuarioId) payload.usuarioId = Number(payload.usuarioId); else payload.usuarioId = null;
    if (payload.tipoId) payload.tipoId = Number(payload.tipoId);
    if (payload.sistemaOperativoId) payload.sistemaOperativoId = Number(payload.sistemaOperativoId); else payload.sistemaOperativoId = null;
    
    if (isMultiHotelUser) {
        if (!payload.hotelId) {
            if (setError) setError("Es obligatorio seleccionar un Hotel.");
            return;
        }
        payload.hotelId = Number(payload.hotelId);
    } else {
        delete payload.hotelId; 
    }

    if (Array.isArray(payload.perfiles_usuario)) {
        payload.perfiles_usuario = payload.perfiles_usuario.length > 0 ? payload.perfiles_usuario.join(", ") : null;
    }

    if (!payload.isWarrantyApplied) {
        payload.garantia_numero_reporte = null;
        payload.garantia_notes = null;
    }
    delete payload.isWarrantyApplied; 

    // Fechas
    ['garantia_inicio', 'garantia_fin', 'fecha_proxima_revision'].forEach(key => {
        if (!payload[key]) payload[key] = null;
        else payload[key] = new Date(payload[key]).toISOString();
    });

    try {
      await api.post("/devices/post", payload);
      if (setMessage) setMessage("Equipo creado exitosamente.");
      if (refreshAlerts) refreshAlerts();
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
        
        {/* SECCIÓN 0: HOTEL (Multi-Tenant) */}
        {isMultiHotelUser && (
            <Box sx={{ mb: 3, p: 2, bgcolor: isContextActive ? 'action.hover' : 'primary.50', borderRadius: 2, border: '1px dashed', borderColor: 'primary.main' }}>
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
                            helperText={isContextActive ? "Hotel fijado por la vista actual" : "Selecciona la propiedad"}
                            multiple={false}
                            disabled={isContextActive} 
                        />
                    )}
                />
            </Box>
        )}
        
        {/* SECCIÓN 1: INFORMACIÓN GENERAL */}
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
                render={({ field }) => <TextField {...field} label="Comentarios / Observaciones" fullWidth multiline rows={2} />}
            />
            
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

        {/* SECCIÓN 2: ASIGNACIÓN */}
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
                    <Controller
                        name="usuarioId"
                        control={control}
                        render={({ field: { value, onChange } }) => (
                            <Autocomplete
                                options={getFilteredUsers()}
                                getOptionLabel={(option) => option.nombre || ""}
                                value={getFilteredUsers().find(u => u.id === value) || null}
                                isOptionEqualToValue={(option, val) => option.id === val.id}
                                onChange={(_, newValue) => {
                                    onChange(newValue ? newValue.id : "");
                                    if (newValue?.areaId) {
                                        setValue("areaId", newValue.areaId);
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField 
                                        {...params} 
                                        label="Responsable (Staff)" 
                                        placeholder="Buscar por nombre..."
                                        error={!!errors.usuarioId}
                                        helperText={errors.usuarioId?.message}
                                    />
                                )}
                                noOptionsText="No se encontraron usuarios"
                            />
                        )}
                    />
                </Box>
            </Stack>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Box sx={{ width: '100%' }}>
                    <FormControl fullWidth error={!!errors.tipoId}>
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
                <Box sx={{ width: '100%' }}>
                    <FormControl fullWidth>
                        <InputLabel>Perfiles de Usuario</InputLabel>
                        <Controller
                            name="perfiles_usuario"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    multiple
                                    input={<OutlinedInput label="Perfiles de Usuario" />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => <Chip key={value} label={value} size="small" />)}
                                        </Box>
                                    )}
                                    MenuProps={MenuProps}
                                >
                                    {users
                                        .filter(u => !isMultiHotelUser || (formHotelId && u.hotelId === Number(formHotelId)))
                                        .map((user) => (
                                        <MenuItem key={user.id} value={user.nombre}>
                                            <Checkbox checked={field.value.indexOf(user.nombre) > -1} />
                                            <ListItemText primary={user.nombre} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            )}
                        />
                    </FormControl>
                </Box>
            </Stack>
        </Stack>

        {/* SECCIÓN 3: SOFTWARE */}
        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }} color="text.secondary" fontWeight="bold">Software y Red</Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={2}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel>Sistema Operativo</InputLabel>
                        <Controller
                            name="sistemaOperativoId" control={control}
                            render={({ field }) => (
                                <Select {...field} label="Sistema Operativo">
                                    <MenuItem value=""><em>Ninguno</em></MenuItem>
                                    {operatingSystems.map((os) => (<MenuItem key={os.id} value={os.id}>{os.nombre}</MenuItem>))}
                                </Select>
                            )}
                        />
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Controller name="licencia_so" control={control} render={({ field }) => <TextField {...field} label="Licencia Windows" fullWidth />} />
                </Grid>
            </Grid>
            
            <Grid container spacing={2}>
                <Grid item xs={12} sm={4}><Controller name="office_version" control={control} render={({ field }) => <TextField {...field} label="Versión Office" fullWidth />} /></Grid>
                <Grid item xs={12} sm={4}><Controller name="office_serial" control={control} render={({ field }) => <TextField {...field} label="Serial Office" fullWidth />} /></Grid>
                <Grid item xs={12} sm={4}><Controller name="office_key" control={control} render={({ field }) => <TextField {...field} label="Key Office" fullWidth />} /></Grid>
            </Grid>

            <Controller
                name="es_panda" control={control}
                render={({ field: { onChange, value } }) => (
                    <FormControlLabel 
                        control={<Switch checked={value} onChange={onChange} color="success" />} 
                        label="¿Tiene Antivirus Panda Instalado?" 
                    />
                )}
            />
        </Stack>

        {/* SECCIÓN 4: GARANTÍA */}
        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }} color="text.secondary" fontWeight="bold">Garantía y Mantenimiento</Typography>
        <Divider sx={{ mb: 2 }} />
        <Stack spacing={2}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><Controller name="garantia_numero_producto" control={control} render={({ field }) => <TextField {...field} label="N° Producto / Servicio" fullWidth />} /></Grid>
                <Grid item xs={12} sm={6}><Controller name="fecha_proxima_revision" control={control} render={({ field }) => <TextField {...field} label="Próxima Revisión" type="date" fullWidth InputLabelProps={{ shrink: true }} />} /></Grid>
            </Grid>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><Controller name="garantia_inicio" control={control} render={({ field }) => <TextField {...field} label="Inicio Garantía" type="date" fullWidth InputLabelProps={{ shrink: true }} />} /></Grid>
                <Grid item xs={12} sm={6}><Controller name="garantia_fin" control={control} render={({ field }) => <TextField {...field} label="Fin Garantía" type="date" fullWidth InputLabelProps={{ shrink: true }} />} /></Grid>
            </Grid>

            <Controller
                name="isWarrantyApplied" control={control}
                render={({ field: { onChange, value } }) => (
                    <FormControlLabel control={<Switch checked={value} onChange={onChange} />} label="¿Se ha aplicado garantía anteriormente?" />
                )}
            />
            
            <Fade in={isWarrantyApplied} unmountOnExit>
                <Stack spacing={2} sx={{ pl: 2, borderLeft: '3px solid #ddd' }}>
                    <Controller name="garantia_numero_reporte" control={control} render={({ field }) => <TextField {...field} label="Número de Reporte" fullWidth />} />
                    <Controller name="garantia_notes" control={control} render={({ field }) => <TextField {...field} label="Notas de Garantía" fullWidth multiline rows={2} />} />
                </Stack>
            </Fade>
        </Stack>
        
        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 4 }}>
          <Button onClick={onClose} sx={{ mr: 2 }}>Cancelar</Button>
          <Button type="submit" variant="contained" color="primary">Crear Equipo</Button>
        </Stack>
      </form>
    </Box>
  );
};

export default CreateDeviceForm;