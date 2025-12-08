
export const ROLES = {
  ROOT: "ROOT",             
  CORP_VIEWER: "CORP_VIEWER", 
  HOTEL_ADMIN: "HOTEL_ADMIN", 
  HOTEL_AUX: "HOTEL_AUX",     
  HOTEL_GUEST: "HOTEL_GUEST", 
};

// Mapa para mostrar nombres amigables en la UI
export const ROLE_LABELS = {
    [ROLES.ROOT]: "Admin Global",
    [ROLES.CORP_VIEWER]: "Auditor",
    [ROLES.HOTEL_ADMIN]: "Admin Local",
    [ROLES.HOTEL_AUX]: "Auxiliar",
    [ROLES.HOTEL_GUEST]: "Invitado"
};

export const DEVICE_STATUS = {
  ACTIVE: "Activo",
  DISPOSED: "Inactivo", 
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