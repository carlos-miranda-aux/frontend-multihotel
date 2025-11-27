// src/context/AlertContext.jsx
import React, { createContext, useState, useEffect, useCallback } from "react";
import api from "../api/axios";

export const AlertContext = createContext();

// Helper function to check if a day is a weekend
const isBusinessDay = (date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6; // 0 = Sunday, 6 = Saturday
}

// Helper function to calculate 5 business days from now
const getFiveBusinessDaysFromNow = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    let businessDaysCount = 0;
    let targetDate = new Date(today);
    
    while (businessDaysCount < 5) {
        targetDate.setDate(targetDate.getDate() + 1);
        if (isBusinessDay(targetDate)) {
            businessDaysCount++;
        }
    }
    // Retornamos la fecha límite (al final del 5to día hábil a partir de hoy)
    targetDate.setHours(23, 59, 59, 999); 
    return targetDate;
}

// Lógica base de fetching, ahora retorna el objeto de estado completo para un solo setter
const _fetchAlertLogic = async () => {
    const [devicesRes, maintenancesRes, pandaStatusRes] = await Promise.all([
        api.get("/devices/get?page=1&limit=1000"), 
        api.get("/maintenances/get?status=pendiente&limit=1000"), 
        api.get("/devices/get/panda-status") 
    ]);

    const devicesData = devicesRes.data.data || [];
    const allPendingMaintenances = maintenancesRes.data.data || []; 
    const totalPendingCount = maintenancesRes.data.totalCount || 0; 
    
    // 1. Lógica de Mantenimientos (FILTRADO POR 5 DÍAS HÁBILES)
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const fiveBusinessDaysFromNow = getFiveBusinessDaysFromNow();
    
    const criticalMaintenances = allPendingMaintenances.filter(m => {
        if (!m.fecha_programada) return false;
        
        const scheduledDate = new Date(m.fecha_programada);
        const isDue = scheduledDate.getTime() >= today.getTime() && scheduledDate.getTime() <= fiveBusinessDaysFromNow.getTime();
        
        return isDue && isBusinessDay(scheduledDate);
    });

    criticalMaintenances.sort((a, b) => new Date(a.fecha_programada) - new Date(b.fecha_programada));

    // 2. Lógica de Garantías (Por Vencer - 90 días)
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(today.getDate() + 90);
    ninetyDaysFromNow.setHours(0, 0, 0, 0);

    const expiringList = [];

    devicesData.forEach((d) => {
      if (d.garantia_fin) {
        const expirationDate = new Date(d.garantia_fin);
        if (expirationDate >= today && expirationDate <= ninetyDaysFromNow) {
          expiringList.push(d);
        }
      }
    });
    
    // 3. Crear y retornar el NUEVO objeto de estado combinado
    return {
        devices: devicesData,
        pandaStatus: pandaStatusRes.data,
        totalPendingMaintenancesCount: totalPendingCount,
        pendingMaintenancesList: criticalMaintenances, // Lista filtrada (5 días)
        warrantyAlertsList: expiringList,
        totalAlertCount: criticalMaintenances.length + expiringList.length, // Conteo de campana
    };
};


export const AlertProvider = ({ children }) => {
  const [loading, setLoading] = useState(true); 
  // ESTADO ÚNICO que contiene todos los datos derivados
  const [alertState, setAlertState] = useState({
      devices: [],
      warrantyAlertsList: [],
      pendingMaintenancesList: [],
      totalPendingMaintenancesCount: 0,
      totalAlertCount: 0,
      pandaStatus: {
          totalActiveDevices: 0,
          devicesWithPanda: 0,
          devicesWithoutPanda: 0,
          expiredWarrantiesCount: 0 
      }
  });

  // Función para la carga inicial (maneja el estado de 'loading' de la página)
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true); 
      const newState = await _fetchAlertLogic();
      setAlertState(newState); // <--- UN SOLO SETTER: SOLUCIÓN AL FLICKER
    } catch (error) {
      console.error("Error cargando datos de alertas:", error);
    } finally {
      setLoading(false); 
    }
  }, []);
  
  // Función para el refresco manual (NO toca el estado 'loading')
  const refreshAlerts = useCallback(async () => {
      try {
          const newState = await _fetchAlertLogic();
          setAlertState(newState); // <--- UN SOLO SETTER: SOLUCIÓN AL FLICKER
      } catch (error) {
          console.error("Error refrescando alertas:", error);
      }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return (
    <AlertContext.Provider
      value={{
        loading,
        // Exponiendo las propiedades del estado ÚNICO
        ...alertState,
        refreshAlerts, 
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};