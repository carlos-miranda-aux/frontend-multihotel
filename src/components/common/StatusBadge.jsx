// src/components/common/StatusBadge.jsx
import React from 'react';
import { Chip } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
// 👇 IMPORTAR CONSTANTES
import { MAINTENANCE_STATUS, DEVICE_STATUS } from '../../config/constants'; 

const getStatusColor = (statusName) => {
  if (!statusName) return 'default';
  const name = statusName.toLowerCase();
  
  // Lógica segura usando las constantes
  if (name.includes(DEVICE_STATUS.ACTIVE.toLowerCase()) || name === MAINTENANCE_STATUS.COMPLETED) return 'success';
  if (name.includes(DEVICE_STATUS.DISPOSED.toLowerCase()) || name === MAINTENANCE_STATUS.CANCELLED) return 'error';
  // "Pendiente" suele coincidir con la constante
  if (name.includes(MAINTENANCE_STATUS.PENDING) || name.includes('revisión')) return 'warning';
  
  return 'default';
};

const StatusBadge = ({ status }) => {
  const colorKey = getStatusColor(status);
  
  return (
    <Chip
      icon={<CircleIcon sx={{ fontSize: '10px !important' }} />}
      label={status || 'Desconocido'}
      color={colorKey} // 'success', 'error', 'warning', 'default'
      variant="outlined"
      size="small"
      sx={{ 
        fontWeight: 'bold', 
        borderColor: colorKey === 'default' ? 'divider' : `${colorKey}.main`
      }}
    />
  );
};

export default StatusBadge;