import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText, Box, Chip } from '@mui/material';

// Lista de hoteles (Hardcoded por ahora para asegurar funcionalidad)
const HOTELS_LIST = [
    { id: 1, nombre: "Crown Paradise Cancún" },
    { id: 2, nombre: "Sensira" },
    { id: 3, nombre: "Corporativo" }
];

const HotelSelect = ({ value, onChange, error, helperText, name, required = true, multiple = false, disabled = false }) => {
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
                        const hotel = HOTELS_LIST.find(h => h.id === val);
                        return <Chip key={val} label={hotel?.nombre || val} size="small" />;
                    })}
                  </Box>
                );
            }
            const hotel = HOTELS_LIST.find(h => h.id === selected);
            return hotel ? hotel.nombre : <em>Seleccione un hotel</em>;
        }}
      >
        {!multiple && (
            <MenuItem value="">
            <em>Ninguno</em>
            </MenuItem>
        )}
        {HOTELS_LIST.map((hotel) => (
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