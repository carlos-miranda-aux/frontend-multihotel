// src/components/common/HotelSelect.jsx
import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';

// NOTA: Idealmente, esto vendría de una API /api/hotels/get
// Por ahora, usamos la misma lista que en tu seed del backend.
const HOTELS_LIST = [
    { id: 1, nombre: "Crown Paradise Cancún" },
    { id: 2, nombre: "Sensira" },
];

const HotelSelect = ({ value, onChange, error, helperText, required = true }) => {
  return (
    <FormControl fullWidth error={!!error} required={required}>
      <InputLabel id="hotel-select-label">Asignar a Hotel</InputLabel>
      <Select
        labelId="hotel-select-label"
        value={value || ""}
        label="Asignar a Hotel"
        onChange={onChange}
      >
        <MenuItem value="">
          <em>Seleccione un hotel</em>
        </MenuItem>
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