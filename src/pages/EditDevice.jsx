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
  CircularProgress,
  Grid,
  Divider,
  Stack,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const EditDevice = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre_equipo: "",
    modelo: "",
    numero_serie: "",
    ip_equipo: "",
    etiqueta: "",
    descripcion: "",
    usuarioId: "",
    tipoId: "",
    estadoId: "",
    sistemaOperativoId: "",
    marca: "",
    licencia_so: "",
    office_version: "",
    office_tipo_licencia: "",
    office_serial: "",
    office_key: "",
    garantia_numero_producto: "",
    garantia_inicio: "",
    garantia_fin: "",
    departamentoId: "",
  });

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [deviceTypes, setDeviceTypes] = useState([]);
  const [deviceStatuses, setDeviceStatuses] = useState([]);
  const [operatingSystems, setOperatingSystems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        setLoading(true);
        const [
          deviceResponse,
          usersRes,
          deviceTypesRes,
          deviceStatusesRes,
          operatingSystemsRes,
          departmentsRes,
        ] = await Promise.all([
          api.get(`/devices/get/${id}`),
          api.get("/users/get"),
          api.get("/device-types/get"),
          api.get("/device-status/get"),
          api.get("/operating-systems/get"),
          api.get("/departments/get"),
        ]);

        const deviceData = deviceResponse.data;
        setFormData({
          nombre_equipo: deviceData.nombre_equipo || "",
          modelo: deviceData.modelo || "",
          numero_serie: deviceData.numero_serie || "",
          ip_equipo: deviceData.ip_equipo || "",
          etiqueta: deviceData.etiqueta || "",
          descripcion: deviceData.descripcion || "",
          usuarioId: deviceData.usuarioId || "",
          tipoId: deviceData.tipoId || "",
          estadoId: deviceData.estadoId || "",
          sistemaOperativoId: deviceData.sistemaOperativoId || "",
          marca: deviceData.marca || "",
          licencia_so: deviceData.licencia_so || "",
          office_version: deviceData.office_version || "",
          office_tipo_licencia: deviceData.office_tipo_licencia || "",
          office_serial: deviceData.office_serial || "",
          office_key: deviceData.office_key || "",
          garantia_numero_producto: deviceData.garantia_numero_producto || "",
          garantia_inicio: deviceData.garantia_inicio
            ? deviceData.garantia_inicio.substring(0, 10)
            : "",
          garantia_fin: deviceData.garantia_fin
            ? deviceData.garantia_fin.substring(0, 10)
            : "",
          departamentoId: deviceData.departamentoId || "",
        });
        setUsers(usersRes.data);
        setDeviceTypes(deviceTypesRes.data);
        setDeviceStatuses(deviceStatusesRes.data);
        setOperatingSystems(operatingSystemsRes.data);
        setDepartments(departmentsRes.data);
      } catch (err) {
        console.error("Error al cargar el dispositivo:", err);
        setError("Error al cargar el dispositivo");
      } finally {
        setLoading(false);
      }
    };
    fetchDeviceData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const payload = { ...formData };
    
    payload.garantia_inicio = payload.garantia_inicio ? new Date(payload.garantia_inicio).toISOString() : null;
    payload.garantia_fin = payload.garantia_fin ? new Date(payload.garantia_fin).toISOString() : null;

    try {
      await api.put(`/devices/put/${id}`, payload);
      setMessage("Equipo actualizado correctamente.");
      setTimeout(() => navigate("/inventory"), 1200);
    } catch (err) {
      setError(err.response?.data?.error || "Error al actualizar el equipo.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, width: "100%", minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Editar equipo
        </Typography>
        <Button variant="outlined" onClick={() => navigate("/inventory")}>
          Volver
        </Button>
      </Stack>

      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3, width: "100%" }}>
        <form onSubmit={handleUpdate}>
          {/* DATOS GENERALES */}
          <Typography variant="h6" sx={{ mb: 1 }}>
            Datos generales
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="Etiqueta" name="etiqueta" fullWidth value={formData.etiqueta} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Nombre del equipo" name="nombre_equipo" fullWidth value={formData.nombre_equipo} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Número de serie" name="numero_serie" fullWidth value={formData.numero_serie} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="IP del equipo" name="ip_equipo" fullWidth value={formData.ip_equipo} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Marca" name="marca" fullWidth value={formData.marca} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Modelo" name="modelo" fullWidth value={formData.modelo} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Descripción"
                name="descripcion"
                fullWidth
                multiline
                minRows={2}
                value={formData.descripcion}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          {/* SOFTWARE */}
          <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
            Software y licencias
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Sistema Operativo</InputLabel>
                <Select
                  name="sistemaOperativoId"
                  value={formData.sistemaOperativoId || ''}
                  onChange={handleChange}
                  label="Sistema Operativo"
                >
                  <MenuItem value="">
                    <em>Ninguno</em>
                  </MenuItem>
                  {operatingSystems.map((os) => (
                    <MenuItem key={os.id} value={os.id}>
                      {os.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Licencia SO" name="licencia_so" fullWidth value={formData.licencia_so} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Versión Office" name="office_version" fullWidth value={formData.office_version} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Tipo de licencia Office" name="office_tipo_licencia" fullWidth value={formData.office_tipo_licencia} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Serial de Office" name="office_serial" fullWidth value={formData.office_serial} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Clave de Office" name="office_key" fullWidth value={formData.office_key} onChange={handleChange} />
            </Grid>
          </Grid>

          {/* GARANTÍA */}
          <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
            Garantía
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="Número de producto" name="garantia_numero_producto" fullWidth value={formData.garantia_numero_producto} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Inicio de garantía"
                type="date"
                name="garantia_inicio"
                fullWidth
                value={formData.garantia_inicio}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Fin de garantía"
                type="date"
                name="garantia_fin"
                fullWidth
                value={formData.garantia_fin}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          {/* ASIGNACIÓN */}
          <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
            Asignación
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Usuario asignado</InputLabel>
                <Select
                  name="usuarioId"
                  value={formData.usuarioId || ''}
                  onChange={handleChange}
                  label="Usuario asignado"
                >
                  <MenuItem value="">
                    <em>Ninguno</em>
                  </MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      {user.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Departamento</InputLabel>
                <Select
                  name="departamentoId"
                  value={formData.departamentoId || ''}
                  onChange={handleChange}
                  label="Departamento"
                >
                  <MenuItem value="">
                    <em>Ninguno</em>
                  </MenuItem>
                  {departments.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* ESTADO */}
          <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
            Estado
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Estado del equipo</InputLabel>
                <Select
                  name="estadoId"
                  value={formData.estadoId || ''}
                  onChange={handleChange}
                  label="Estado del equipo"
                >
                  <MenuItem value="">
                    <em>Ninguno</em>
                  </MenuItem>
                  {deviceStatuses.map((status) => (
                    <MenuItem key={status.id} value={status.id}>
                      {status.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* ACCIONES */}
          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button type="submit" variant="contained">
              Guardar cambios
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default EditDevice;