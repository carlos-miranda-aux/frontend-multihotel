// src/components/common/HotelSelect.jsx
import React, { useContext } from 'react';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText, Box, Chip } from '@mui/material';
import { AuthContext } from '../../context/AuthContext'; // 👈 Importar Contexto

const HotelSelect = ({ value, onChange, error, helperText, name, required = true, multiple = false, disabled = false }) => {
  // 👇 Usamos la lista real de la base de datos
  const { availableHotels } = useContext(AuthContext);

  return (
    <FormControl fullWidth error={!!error} required={required} disabled={disabled}>
      <InputLabel id="hotel-select-label">Asignar a Hotel(es)</InputLabel>
      <Select
        labelId="hotel-select-label"
        id="hotel-select"
        multiple={multiple}
        value={value || (multiple ? [] : "")}
        label="Asignar a Hotel(es)"
        onChange={onChange}
        name={name}
        renderValue={(selected) => {
            if (multiple) {
                if (!selected || selected.length === 0) return <em>Seleccione hoteles</em>;
                return (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((val) => {
                        // Buscar nombre en la lista dinámica
                        const hotel = availableHotels.find(h => h.id === val);
                        return <Chip key={val} label={hotel?.nombre || val} size="small" />;
                    })}
                  </Box>
                );
            }
            const hotel = availableHotels.find(h => h.id === selected);
            return hotel ? hotel.nombre : <em>Seleccione un hotel</em>;
        }}
      >
        {!multiple && (
            <MenuItem value="">
            <em>Ninguno</em>
            </MenuItem>
        )}
        {/* Renderizado dinámico desde BD */}
        {availableHotels.map((hotel) => (
          <MenuItem key={hotel.id} value={hotel.id}>
            {hotel.nombre}
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default HotelSelect;