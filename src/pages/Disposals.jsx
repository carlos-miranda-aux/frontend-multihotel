// src/pages/Disposals.jsx
import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  TablePagination,
  TableSortLabel // 👈 CORRECCIÓN: Importar
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useSortableData } from "../hooks/useSortableData"; // 👈 CORRECCIÓN: Importar Hook

const Disposals = () => {
  const [disposals, setDisposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalDisposals, setTotalDisposals] = useState(0);

  // 👈 CORRECCIÓN: Usar el hook de ordenamiento
  const { sortedItems: sortedDisposals, requestSort, sortConfig } = useSortableData(disposals, { key: 'etiqueta', direction: 'ascending' });

  useEffect(() => {
    fetchDisposals();
  }, [page, rowsPerPage]);

  const fetchDisposals = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get(`/disposals/get?page=${page + 1}&limit=${rowsPerPage}`);
      setDisposals(response.data.data);
      setTotalDisposals(response.data.totalCount);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching disposals:", err);
      setError("Error al cargar la lista de bajas.");
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/inventory/edit/${id}`);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Equipos dados de Baja
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {/* 👈 CORRECCIÓN: Encabezados con TableSortLabel */}
                <TableCell sortDirection={sortConfig?.key === 'etiqueta' ? sortConfig.direction : false}>
                  <TableSortLabel
                    active={sortConfig?.key === 'etiqueta'}
                    direction={sortConfig?.key === 'etiqueta' ? sortConfig.direction : 'asc'}
                    onClick={() => requestSort('etiqueta')}
                  >
                    Etiqueta
                  </TableSortLabel>
                </TableCell>
                <TableCell>N° Serie</TableCell>
                <TableCell sortDirection={sortConfig?.key === 'tipo.nombre' ? sortConfig.direction : false}>
                  <TableSortLabel
                    active={sortConfig?.key === 'tipo.nombre'}
                    direction={sortConfig?.key === 'tipo.nombre' ? sortConfig.direction : 'asc'}
                    onClick={() => requestSort('tipo.nombre')}
                  >
                    Tipo
                  </TableSortLabel>
                </TableCell>
                <TableCell>Estado</TableCell>
                <TableCell sortDirection={sortConfig?.key === 'motivo_baja' ? sortConfig.direction : false}>
                  <TableSortLabel
                    active={sortConfig?.key === 'motivo_baja'}
                    direction={sortConfig?.key === 'motivo_baja' ? sortConfig.direction : 'asc'}
                    onClick={() => requestSort('motivo_baja')}
                  >
                    Motivo
                  </TableSortLabel>
                </TableCell>
                <TableCell>Observaciones</TableCell>
                <TableCell sortDirection={sortConfig?.key === 'fecha_baja' ? sortConfig.direction : false}>
                  <TableSortLabel
                    active={sortConfig?.key === 'fecha_baja'}
                    direction={sortConfig?.key === 'fecha_baja' ? sortConfig.direction : 'asc'}
                    onClick={() => requestSort('fecha_baja')}
                  >
                    Fecha de Baja
                  </TableSortLabel>
                </TableCell>
                {(user?.rol === "ADMIN" || user?.rol === "EDITOR") && <TableCell>Acciones</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : sortedDisposals.length > 0 ? (
                // 👈 CORRECCIÓN: Mapear sobre 'sortedDisposals'
                sortedDisposals.map((disposal) => (
                  <TableRow key={disposal.id}>
                    <TableCell>{disposal.etiqueta || 'N/A'}</TableCell>
                    <TableCell>{disposal.numero_serie || 'N/A'}</TableCell>
                    <TableCell>{disposal.tipo?.nombre || 'N/A'}</TableCell>
                    <TableCell>{disposal.estado?.nombre || 'N/A'}</TableCell>
                    <TableCell>{disposal.motivo_baja || 'N/A'}</TableCell>
                    <TableCell>{disposal.observaciones_baja || 'N/A'}</TableCell>
                    <TableCell>
                      {disposal.fecha_baja ? new Date(disposal.fecha_baja).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    {(user?.rol === "ADMIN" || user?.rol === "EDITOR") && (
                      <TableCell>
                        <IconButton
                          color="primary"
                          onClick={() => handleEdit(disposal.id)}
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No hay equipos dados de baja.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalDisposals}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
        />
      </Paper>
    </Box>
  );
};

export default Disposals;