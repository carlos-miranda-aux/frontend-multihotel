// src/components/common/PageHeader.jsx
import React from 'react';
import { Box, Typography, Stack, Button, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const PageHeader = ({ title, subtitle, status, onBack, actions }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(6px)',
        borderBottom: '1px solid #e0e0e0',
        borderRadius: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
      }}
    >
      {/* Sección Izquierda: Título y Estado */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {onBack && (
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={onBack} 
            sx={{ color: 'text.secondary' }}
          >
            Volver
          </Button>
        )}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" fontWeight="bold" color="text.primary">
              {title}
            </Typography>
            {status}
          </Box>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Sección Derecha: Acciones */}
      <Stack direction="row" spacing={2}>
        {actions}
      </Stack>
    </Paper>
  );
};

export default PageHeader;