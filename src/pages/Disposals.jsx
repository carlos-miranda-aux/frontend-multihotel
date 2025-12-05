import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress, Alert, IconButton, TablePagination, TableSortLabel, TextField, Chip
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { ROLES } from "../config/constants"; 
import { useNavigate } from "react-router-dom";
import { useSortableData } from "../hooks/useSortableData";

const Disposals = () => {
  const [disposals, setDisposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // 👇 CONTEXTO
  const { user, selectedHotelId } = useContext(AuthContext);
  
  // 👇 LOGICA CONDICIONAL
  const isGlobalUser = user?.rol === ROLES.ROOT || user?.rol === ROLES.CORP_VIEWER || (user?.hotels && user.hotels.length > 1);
  const showHotelColumn = isGlobalUser && !selectedHotelId;

  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalDisposals, setTotalDisposals] = useState(0);
  const [search, setSearch] = useState(""); 

  const { sortedItems: sortedDisposals, requestSort, sortConfig } = useSortableData(disposals, { key: 'fecha_baja', direction: 'desc' });

  const fetchDisposals = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(`/disposals/get?page=${page + 1}&limit=${rowsPerPage}&search=${search}`);
      setDisposals(response.data.data);
      setTotalDisposals(response.data.totalCount);
    } catch (err) {
      console.error("Error fetching disposals:", err);
      setError("Error al cargar la lista de bajas.");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, selectedHotelId]); // 🔄 Dependencia

  useEffect(() => { fetchDisposals(); }, [fetchDisposals]);

  const handleSearchChange = (e) => { setSearch(e.target.value); setPage(0); };
  const handleEdit = (id) => navigate(`/inventory/edit/${id}`);
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };

  const headerStyle = { fontWeight: 'bold', color: 'text.primary' };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color="primary">Equipos dados de Baja</Typography>
        <TextField label="Buscar..." variant="outlined" size="small" value={search} onChange={handleSearchChange} placeholder="Serie, nombre o motivo..." />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'background.default' }}> 
                
                {/* 👇 HEADER CONDICIONAL */}
                {showHotelColumn && <TableCell sx={headerStyle}>Hotel</TableCell>}

                <TableCell sx={headerStyle}>
                  <TableSortLabel active={sortConfig?.key === 'nombre_equipo'} direction={sortConfig?.direction} onClick={() => requestSort('nombre_equipo')}>
                    Nombre Equipo
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={headerStyle}>Serie</TableCell>
                <TableCell sx={headerStyle}>Tipo</TableCell>
                <TableCell sx={headerStyle}>Motivo</TableCell>
                <TableCell sx={headerStyle}>Observaciones</TableCell>
                <TableCell sx={headerStyle}>
                  <TableSortLabel active={sortConfig?.key === 'fecha_baja'} direction={sortConfig?.direction} onClick={() => requestSort('fecha_baja')}>
                    Fecha de Baja
                  </TableSortLabel>
                </TableCell>
                {(user?.rol === "HOTEL_ADMIN" || isGlobalUser) && <TableCell sx={headerStyle}>Acciones</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={showHotelColumn ? 8 : 7} align="center"><CircularProgress /></TableCell></TableRow>
              ) : sortedDisposals.length > 0 ? (
                sortedDisposals.map((disposal) => (
                  <TableRow key={disposal.id}>
                    
                    {/* 👇 CELDA CONDICIONAL */}
                    {showHotelColumn && (
                        <TableCell>
                            <Chip 
                                label={disposal.hotelId === 1 ? "Cancún" : disposal.hotelId === 2 ? "Sensira" : "ID:"+disposal.hotelId} 
                                size="small" 
                                variant="outlined" 
                            />
                        </TableCell>
                    )}

                    <TableCell>
                        <Typography variant="body2" fontWeight="bold">{disposal.nombre_equipo || 'N/A'}</Typography>
                        <Typography variant="caption" color="textSecondary">{disposal.etiqueta}</Typography>
                    </TableCell>
                    <TableCell>{disposal.numero_serie || 'N/A'}</TableCell>
                    <TableCell>{disposal.tipo?.nombre || 'N/A'}</TableCell>
                    <TableCell>{disposal.motivo_baja || 'N/A'}</TableCell>
                    <TableCell>{disposal.observaciones_baja || 'N/A'}</TableCell>
                    <TableCell>{disposal.fecha_baja ? new Date(disposal.fecha_baja).toLocaleDateString() : 'N/A'}</TableCell>
                    
                    {(user?.rol === "HOTEL_ADMIN" || isGlobalUser) && (
                      <TableCell>
                        <IconButton color="primary" onClick={() => handleEdit(disposal.id)} title="Editar detalle">
                            <EditIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={showHotelColumn ? 8 : 7} align="center">No hay equipos dados de baja.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]} component="div" count={totalDisposals}
          rowsPerPage={rowsPerPage} page={page}
          onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default Disposals;