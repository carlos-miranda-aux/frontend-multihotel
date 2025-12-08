import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ManageSearchIcon from '@mui/icons-material/ManageSearch'; // O cualquier icono de búsqueda/mapa

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ textAlign: 'center', mt: 10 }}>
      <Box sx={{ mb: 4, color: 'text.secondary' }}>
        <ManageSearchIcon sx={{ fontSize: 100, opacity: 0.2 }} />
      </Box>
      
      <Typography variant="h2" fontWeight="bold" color="primary" gutterBottom>
        404
      </Typography>
      
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Página no encontrada
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 500, mx: 'auto', mb: 4 }}>
        Parece que te has perdido. La página que buscas no existe, fue movida o no tienes permisos para verla.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Regresar
        </Button>
        <Button variant="contained" onClick={() => navigate('/')}>
          Ir al Inicio
        </Button>
      </Box>
    </Container>
  );
};

export default NotFound;