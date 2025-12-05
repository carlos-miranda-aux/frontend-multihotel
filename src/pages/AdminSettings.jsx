import React, { useContext, useState } from 'react';
import { Box, Typography, Grid, Card, CardActionArea, Avatar, useTheme, Dialog, DialogContent, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ROLES } from '../config/constants';

// Iconos
import DomainAddIcon from '@mui/icons-material/DomainAdd';     // Hotel
import AccountTreeIcon from '@mui/icons-material/AccountTree'; // Areas
import CorporateFareIcon from '@mui/icons-material/CorporateFare'; // Departamentos
import DevicesOtherIcon from '@mui/icons-material/DevicesOther'; // Tipos Equipo
import SettingsSystemDaydreamIcon from '@mui/icons-material/SettingsSystemDaydream'; // SO
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts'; // Usuarios Sistema
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Componentes (Tablas / Modales)
import HotelsTable from '../components/admin/HotelsTable';
import CrudTable from '../components/CrudTable'; 
// Nota: Usamos CrudTable para catálogos simples, las rutas deben coincidir con backend
// Nota 2: Para Area, Depto y Usuarios, redirigiremos a sus paginas dedicadas para tener más espacio visual.

const AdminSettings = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const isRoot = user?.rol === ROLES.ROOT;

  // Estado para modales rápidos
  const [modalOpen, setModalOpen] = useState(false);
  const [activeCatalog, setActiveCatalog] = useState(null);

  const openModal = (type) => {
      setActiveCatalog(type);
      setModalOpen(true);
  };

  // Definición de las tarjetas
  const settingsOptions = [
    {
      title: "Hoteles",
      desc: "Administrar propiedades.",
      icon: <DomainAddIcon fontSize="large" />,
      action: () => openModal('HOTELS'),
      color: theme.palette.primary.main, 
      show: isRoot
    },
    {
      title: "Usuarios del Sistema",
      desc: "Accesos y roles.",
      icon: <ManageAccountsIcon fontSize="large" />,
      action: () => navigate("/user-manager"),
      color: theme.palette.primary.main,
      show: true
    },
    {
      title: "Departamentos",
      desc: "Estructura organizacional base.",
      icon: <CorporateFareIcon fontSize="large" />,
      action: () => navigate("/departments"), // Nueva ruta
      color: theme.palette.primary.main,
      show: true
    },
    {
      title: "Áreas",
      desc: "Subdivisión de departamentos.",
      icon: <AccountTreeIcon fontSize="large" />,
      action: () => navigate("/areas"),
      color: theme.palette.primary.main,
      show: true
    },
    {
      title: "Tipos de Equipo",
      desc: "Catálogo (Laptop, PC, etc).",
      icon: <DevicesOtherIcon fontSize="large" />,
      action: () => openModal('DEVICE_TYPES'),
      color: theme.palette.primary.main,
      show: isRoot
    },
    {
      title: "Sistemas Operativos",
      desc: "Catálogo de SO",
      icon: <SettingsSystemDaydreamIcon fontSize="large" />,
      action: () => openModal('OS'),
      color: theme.palette.primary.main,
      show: isRoot
    }
  ];

  const renderModalContent = () => {
      switch(activeCatalog) {
          case 'HOTELS': return <HotelsTable />;
          case 'DEVICE_TYPES': return <CrudTable title="Catálogo de Tipos" apiUrl="/device-types" />;
          case 'OS': return <CrudTable title="Catálogo de S.O." apiUrl="/operating-systems" />;
          default: return null;
      }
  };

  return (
    <Box sx={{ p: 4, minHeight: '100vh', bgcolor: 'background.default' }}>
      
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <CardActionArea 
            onClick={() => navigate('/home')} 
            sx={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
            <ArrowBackIcon color="action" />
        </CardActionArea>
        <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary">Configuraciones Maestras</Typography>
            <Typography variant="subtitle1" color="text.secondary">Administración centralizada del sistema.</Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {settingsOptions.map((item, index) => (
          item.show && (
            <Grid item xs={12} sm={6} md={4} key={index}>
                <Card elevation={0} sx={{ height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 3, transition: '0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[4], borderColor: item.color } }}>
                <CardActionArea onClick={item.action} sx={{ height: '100%', p: 3 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 64, height: 64, bgcolor: `${item.color}22`, color: item.color }}>{item.icon}</Avatar>
                        <Box>
                            <Typography variant="h6" fontWeight="bold">{item.title}</Typography>
                            <Typography variant="body2" color="text.secondary">{item.desc}</Typography>
                        </Box>
                    </Box>
                </CardActionArea>
                </Card>
            </Grid>
          )
        ))}
      </Grid>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}><IconButton onClick={() => setModalOpen(false)}><CloseIcon /></IconButton></Box>
          <DialogContent>{renderModalContent()}</DialogContent>
      </Dialog>
    </Box>
  );
};

export default AdminSettings;