// src/components/common/SectionCard.jsx
import React from 'react';
import { Paper, Typography, Box, Divider } from '@mui/material';

const SectionCard = ({ title, icon, children, action, color = "primary.main" }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        transition: 'box-shadow 0.3s',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }
      }}
    >
      {(title || icon) && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: color }}>
              {icon && React.cloneElement(icon, { fontSize: "medium" })}
              <Typography variant="h6" fontWeight="600" color="text.primary">
                {title}
              </Typography>
            </Box>
            {action}
          </Box>
          <Divider sx={{ mb: 3 }} />
        </>
      )}
      {children}
    </Paper>
  );
};

export default SectionCard;