// src/components/InventoryTable.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Chip
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

const InventoryTable = () => {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [search, setSearch] = useState("");
  
  // Estados para filtros
  const [filterType, setFilterType] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [filterDepto, setFilterDepto] = useState("");

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await axios.get("/devices/get");
      // Soporte tanto si viene paginado { data: [] } o directo []
      const data = res.data.data || res.data;
      setDevices(data);
      setFilteredDevices(data);
    } catch (err) {
      console.error("Error al obtener dispositivos:", err);
    }
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    filterData(e.target.value, filterType, filterEstado, filterDepto);
  };

  const handleFilter = (type, estado, depto) => {
    setFilterType(type);
    setFilterEstado(estado);
    setFilterDepto(depto);
    filterData(search, type, estado, depto);
  };

  const filterData = (searchValue, type, estado, depto) => {
    let temp = [...devices];

    if (searchValue) {
      const lowerSearch = searchValue.toLowerCase();
      temp = temp.filter(
        (d) =>
          d.etiqueta?.toLowerCase().includes(lowerSearch) ||
          d.numero_serie?.toLowerCase().includes(lowerSearch) ||
          d.nombre_equipo?.toLowerCase().includes(lowerSearch)
      );
    }
    if (type) temp = temp.filter((d) => d.tipo?.nombre === type);
    if (estado) temp = temp.filter((d) => d.estado?.nombre === estado);
    
    // CORRECCIÓN: El departamento vive dentro del área
    if (depto) temp = temp.filter((d) => d.area?.departamento?.nombre === depto);

    setFilteredDevices(temp);
  };

  const handleEdit = (id) => {
    // Aseguramos la ruta correcta (/inventory/edit/ID)
    navigate(`/inventory/edit/${id}`);
  };

  const handleExport = () => {
    // Aseguramos usar la URL base correcta de la API
    window.open("http://localhost:3000/api/devices/export/inactivos", "_blank");
  };

  // Listas únicas para filtros (corregido path de departamento)
  const tipos = [...new Set(devices.map((d) => d.tipo?.nombre).filter(Boolean))];
  const estados = [...new Set(devices.map((d) => d.estado?.nombre).filter(Boolean))];
  const departamentos = [...new Set(devices.map((d) => d.area?.departamento?.nombre).filter(Boolean))];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#A73698' }}>
        Inventario de Equipos Activos
      </Typography>

      {/* BARRA DE HERRAMIENTAS Y FILTROS */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: 'center' }}>
        <TextField
          label="Buscar (Etiqueta, Serie, Nombre)"
          value={search}
          onChange={handleSearch}
          size="small"
          sx={{ minWidth: 250 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Tipo</InputLabel>
          <Select
            value={filterType}
            onChange={(e) => handleFilter(e.target.value, filterEstado, filterDepto)}
            label="Tipo"
          >
            <MenuItem value=""><em>Todos</em></MenuItem>
            {tipos.map((t) => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            value={filterEstado}
            onChange={(e) => handleFilter(filterType, e.target.value, filterDepto)}
            label="Estado"
          >
            <MenuItem value=""><em>Todos</em></MenuItem>
            {estados.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Departamento</InputLabel>
          <Select
            value={filterDepto}
            onChange={(e) => handleFilter(filterType, filterEstado, e.target.value)}
            label="Departamento"
          >
            <MenuItem value=""><em>Todos</em></MenuItem>
            {departamentos.map((d) => (
              <MenuItem key={d} value={d}>{d}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button 
            variant="contained" 
            color="secondary" 
            onClick={handleExport}
            sx={{ ml: 'auto' }}
        >
          Exportar Bajas
        </Button>
      </Box>

      {/* TABLA DE DATOS */}
      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>N°</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Equipo</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Serie</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Marca / Modelo</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Sistema Operativo</TableCell> {/* 👈 COLUMNA NUEVA */}
              <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Usuario</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Departamento</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDevices.map((device, index) => (
              <TableRow key={device.id} hover>
                <TableCell>{index + 1}</TableCell>
                
                {/* Nombre y Etiqueta (Combinados para ahorrar espacio) */}
                <TableCell>
                    <Typography variant="body2" fontWeight="bold">{device.nombre_equipo}</Typography>
                    <Typography variant="caption" color="textSecondary">{device.etiqueta}</Typography>
                </TableCell>
                
                <TableCell>{device.numero_serie}</TableCell>
                <TableCell>{device.tipo?.nombre || "N/A"}</TableCell>
                
                {/* Marca y Modelo (Combinados) */}
                <TableCell>
                    {device.marca} {device.modelo}
                </TableCell>

                {/* 👈 NUEVA CELDA: SISTEMA OPERATIVO */}
                <TableCell>
                    {device.sistema_operativo ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">{device.sistema_operativo.nombre}</Typography>
                        </Box>
                    ) : (
                        <Typography variant="caption" color="text.disabled">Sin SO</Typography>
                    )}
                </TableCell>

                <TableCell>
                    <Chip 
                        label={device.estado?.nombre} 
                        size="small" 
                        color={device.estado?.nombre === 'Activo' ? 'success' : 'default'} 
                        variant="outlined"
                    />
                </TableCell>
                
                <TableCell>{device.usuario?.nombre || "Sin Asignar"}</TableCell>
                
                {/* CORRECCIÓN: Ruta correcta al departamento */}
                <TableCell>{device.area?.departamento?.nombre || "N/A"}</TableCell>
                
                <TableCell align="center">
                  <IconButton 
                    color="primary"
                    onClick={() => handleEdit(device.id)}
                    size="small"
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            
            {filteredDevices.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="textSecondary">
                    No se encontraron dispositivos con los filtros actuales.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default InventoryTable;