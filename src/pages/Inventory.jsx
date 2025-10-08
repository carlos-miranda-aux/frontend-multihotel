<div>Pagina inventarios</div>// src/pages/Inventory.jsx
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const Inventory = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await api.get("/devices/get"); // endpoint protegido
        setDevices(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDevices();
  }, []);

  const handleEdit = (id) => {
    navigate(`/inventory/${id}`); // navegar a página de detalle
  };

  return (
    <TableContainer component={Paper} sx={{ marginTop: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>N°</TableCell>
            <TableCell>Etiqueta</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Marca</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {devices.map((device, index) => (
            <TableRow key={device.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{device.etiqueta}</TableCell>
              <TableCell>{device.nombre_equipo}</TableCell>
              <TableCell>{device.tipo?.nombre}</TableCell>
              <TableCell>{device.marca}</TableCell>
              <TableCell>{device.estado?.nombre}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleEdit(device.id)}
                >
                  Editar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Inventory;
