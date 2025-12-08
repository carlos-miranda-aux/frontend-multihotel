// src/components/common/HotelSwitcher.jsx
import React, { useContext } from 'react';
import { Select, MenuItem, FormControl, Box, Typography, ListItemIcon } from '@mui/material';
import DomainIcon from '@mui/icons-material/Domain';
import LanguageIcon from '@mui/icons-material/Language';
import { AuthContext } from '../../context/AuthContext';
import { ROLES } from '../../config/constants';

const HotelSwitcher = () => {
  // 👇 Ahora consumimos availableHotels del contexto
  const { user, selectedHotelId, changeHotelContext, availableHotels } = useContext(AuthContext);

  // Determinar si debemos mostrar el selector
  // Se muestra si es ROOT, CORP_VIEWER, o si tiene asignado más de 1 hotel.
  const shouldShow = user && (
      user.rol === ROLES.ROOT || 
      user.rol === ROLES.CORP_VIEWER || 
      (user.hotels && user.hotels.length > 1)
  );

  if (!shouldShow) return null;

  const handleChange = (event) => {
      changeHotelContext(event.target.value);
  };

  return (
    <FormControl size="small" sx={{ minWidth: 200, maxWidth: 300, mr: 2 }}>
      <Select
        value={selectedHotelId || ""}
        onChange={handleChange}
        displayEmpty
        variant="outlined"
        sx={{
            borderRadius: 2,
            bgcolor: 'background.paper',
            '& .MuiSelect-select': {
                display: 'flex',
                alignItems: 'center',
                py: 1,
                fontSize: '0.875rem',
                fontWeight: 600
            },
            boxShadow: 1
        }}
        renderValue={(selected) => {
            if (!selected) {
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                        <LanguageIcon fontSize="small" sx={{ mr: 1 }} />
                        Arriva
                    </Box>
                );
            }
            // Buscamos en la lista global del contexto
            const hotel = availableHotels.find(h => String(h.id) === String(selected));
            return (
                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.primary' }}>
                    <DomainIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                    <Typography noWrap variant="body2" sx={{ maxWidth: 150 }}>
                        {hotel ? hotel.nombre : "Cargando..."}
                    </Typography>
                </Box>
            );
        }}
      >
        <MenuItem value="">
            <ListItemIcon><LanguageIcon fontSize="small" color="primary" /></ListItemIcon>
            <Typography variant="body2" fontWeight="bold" color="primary">Arriva</Typography>
        </MenuItem>
        
        {availableHotels.map((hotel) => (
            <MenuItem key={hotel.id} value={String(hotel.id)}>
                <ListItemIcon><DomainIcon fontSize="small" /></ListItemIcon>
                <Typography variant="body2">{hotel.nombre}</Typography>
            </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default HotelSwitcher;