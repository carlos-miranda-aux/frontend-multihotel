// src/config/constants.js

export const ROLES = {
  ROOT: "ROOT",             // Super Admin Global
  CORP_VIEWER: "CORP_VIEWER", // Auditor Global
  HOTEL_ADMIN: "HOTEL_ADMIN", // Jefe de Sistemas (Local)
  HOTEL_AUX: "HOTEL_AUX",     // Auxiliar (Local)
  HOTEL_GUEST: "HOTEL_GUEST", // Invitado
};

export const DEVICE_STATUS = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo", 
};

export const MAINTENANCE_STATUS = {
  PENDING: "pendiente",
  COMPLETED: "realizado",
  CANCELLED: "cancelado",
};

export const MAINTENANCE_TYPE = {
  PREVENTIVE: "Preventivo",
  CORRECTIVE: "Correctivo",
};