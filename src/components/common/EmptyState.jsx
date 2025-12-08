import React from 'react';
import { Box, Typography } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff'; // O InboxIcon

const EmptyState = ({ title = "No se encontraron datos", description = "Intenta ajustar tus filtros o agrega un nuevo registro." }) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        py: 8,
        color: 'text.secondary',
        width: '100%'
      }}
    >
      <Box sx={{ bgcolor: 'action.hover', p: 3, borderRadius: '50%', mb: 2 }}>
        <SearchOffIcon sx={{ fontSize: 48, opacity: 0.5 }} />
      </Box>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ maxWidth: 300, textAlign: 'center' }}>
        {description}
      </Typography>
    </Box>
  );
};

export default EmptyState;