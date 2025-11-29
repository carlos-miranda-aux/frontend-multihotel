// src/components/common/StatusBadge.jsx
import React from 'react';
import { Chip } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';

const getStatusColor = (statusName) => {
  if (!statusName) return 'default';
  const name = statusName.toLowerCase();
  if (name.includes('activo') || name === 'realizado') return 'success';
  if (name.includes('baja') || name === 'cancelado') return 'error';
  if (name.includes('pendiente') || name.includes('revisión')) return 'warning';
  return 'default';
};

const StatusBadge = ({ status }) => {
  const color = getStatusColor(status);
  
  return (
    <Chip
      icon={<CircleIcon sx={{ fontSize: '10px !important' }} />}
      label={status || 'Desconocido'}
      color={color}
      variant="outlined"
      size="small"
      sx={{ fontWeight: 'bold', border: '1px solid', borderColor: `${color}.main` }}
    />
  );
};

export default StatusBadge;