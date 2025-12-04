// src/pages/AdminSettings.jsx
import React, { useContext } from 'react';
import { Box, Typography, Grid, Card, CardContent, CardActionArea, Avatar, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ROLES } from '../config/constants';

// Iconos
import BusinessIcon from '@mui/icons-material/Business';
import GroupIcon from '@mui/icons-material/Group';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const AdminSettings = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const isRoot = user?.rol === ROLES.ROOT;

  const menuItems = [
    {
      title: "Usuarios del Sistema",
      description: "Gestiona administradores, técnicos y permisos de acceso al sistema.",
      icon: <GroupIcon fontSize="large" />,
      path: "/user-manager",
      color: theme.palette.primary.main,
      show: true
    },
    {
      title: "Estructura Organizacional",
      description: "Administra los departamentos y áreas operativas del hotel.",
      icon: <BusinessIcon fontSize="large" />,
      path: "/areas",
      color: theme.palette.success.main,
      show: true
    },
    {
      title: "Bitácora de Auditoría",
      description: "Revisa el historial detallado de movimientos y seguridad.",
      icon: <HistoryEduIcon fontSize="large" />,
      path: "/audit",
      color: theme.palette.warning.main,
      show: isRoot // Solo Root ve la auditoría global desde aquí
    }
  ];

  return (
    <Box sx={{ p: 4, minHeight: '100vh', bgcolor: 'background.default' }}>
      
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <CardActionArea 
            onClick={() => navigate('/home')} 
            sx={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
            <ArrowBackIcon color="action" />
        </CardActionArea>
        <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
            Panel de Administración
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
            Configuración avanzada del sistema {isRoot && "(Modo Global)"}
            </Typography>
        </Box>
      </Box>

      {/* Grid de Opciones */}
      <Grid container spacing={3}>
        {menuItems.map((item, index) => (
          item.show && (
            <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                    elevation={0}
                    sx={{ 
                        height: '100%', 
                        border: '1px solid', 
                        borderColor: 'divider',
                        borderRadius: 3,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': { 
                            transform: 'translateY(-4px)', 
                            boxShadow: theme.shadows[4],
                            borderColor: item.color
                        }
                    }}
                >
                <CardActionArea onClick={() => navigate(item.path)} sx={{ height: '100%', p: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 64, height: 64, bgcolor: `${item.color}22`, color: item.color }}>
                            {item.icon}
                        </Avatar>
                        <Typography variant="h6" fontWeight="bold">
                            {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {item.description}
                        </Typography>
                    </Box>
                </CardActionArea>
                </Card>
            </Grid>
          )
        ))}
      </Grid>
    </Box>
  );
};

export default AdminSettings;