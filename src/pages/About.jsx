import React from 'react';
import { Box, Typography, Paper, Container, Avatar, Divider, Stack, IconButton, Tooltip } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import CodeIcon from '@mui/icons-material/Code';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

import logo from "../assets/s.png"

const About = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Container maxWidth="xs">
        <Paper 
            elevation={4} 
            sx={{ 
                p: 3, 
                borderRadius: 4, 
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Botón de regreso discreto en la esquina */}
            <IconButton 
                onClick={() => navigate(-1)} 
                sx={{ position: 'absolute', top: 10, left: 10, color: 'text.disabled' }}
                size="small"
            >
                <ArrowBackIcon fontSize="small" />
            </IconButton>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 1 }}>
                <Avatar 
                    sx={{ 
                        width: 80, 
                        height: 80, 
                        bgcolor: 'transparent', // Fondo transparente para que se vea bien el PNG
                        mb: 2 
                        // Quitamos el boxShadow para un look más limpio con el logo
                    }}
                >
                    <img src={logo} alt="SIMET Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </Avatar>
                
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                    SIMET
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, fontWeight: 500 }}>
                    VERSIÓN 2.0
                </Typography>
            </Box>

            <Divider sx={{ my: 3, width: '60%', mx: 'auto', opacity: 0.6 }} />

            <Typography variant="body2" color="text.primary" fontWeight="500" paragraph>
                Desarrollado por Carlos Miranda
            </Typography>
            
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 3, lineHeight: 1.6 }}>
                Si necesitas soporte técnico, reportar un fallo o solicitar mejoras, contáctame:
            </Typography>

            {/* Botones de contacto compactos */}
            <Stack direction="row" spacing={3} justifyContent="center" sx={{ mb: 2 }}>
                <Tooltip title="Enviar Correo" arrow>
                    <IconButton 
                        href="mailto:miranda.c4rlos@outlook.com" // ✉️ PON TU CORREO AQUÍ
                        sx={{ 
                            bgcolor: 'primary.50', 
                            color: 'primary.main',
                            width: 45, height: 45,
                            '&:hover': { bgcolor: 'primary.100', transform: 'scale(1.1)' },
                            transition: '0.2s'
                        }}
                    >
                        <EmailIcon />
                    </IconButton>
                </Tooltip>

                <Tooltip title="WhatsApp" arrow>
                    <IconButton 
                        href="https://wa.me/529341101635" // 📱 PON TU NÚMERO AQUÍ
                        target="_blank"
                        sx={{ 
                            bgcolor: 'success.50', 
                            color: 'success.main',
                            width: 45, height: 45,
                            '&:hover': { bgcolor: 'success.100', transform: 'scale(1.1)' },
                            transition: '0.2s'
                        }}
                    >
                        <WhatsAppIcon />
                    </IconButton>
                </Tooltip>
            </Stack>

            <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                © {new Date().getFullYear()} - Derechos Reservados
            </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default About;