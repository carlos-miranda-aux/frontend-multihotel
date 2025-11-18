// src/hooks/useSortableData.js
import { useState, useMemo } from 'react';

/**
 * Hook personalizado para ordenar un array de datos.
 * @param {Array} items - El array de datos a ordenar (ej. devices, users).
 * @param {Object} [config] - La configuración de orden inicial (opcional).
 * @param {string} config.key - La 'key' por la cual ordenar.
 * @param {string} config.direction - 'ascending' o 'descending'.
 * @returns {{sortedItems: Array, requestSort: Function, sortConfig: Object}}
 */
export const useSortableData = (items, config = null) => {
  const [sortConfig, setSortConfig] = useState(config);

  // Helper para obtener valores anidados (ej. 'usuario.nombre' o 'tipo.nombre')
  const getNestedValue = (obj, path) => {
    if (!path) return null;
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined) ? acc[part] : null, obj);
  };

  const sortedItems = useMemo(() => {
    let sortableItems = [...items]; // Copia del array para no mutar el original
    
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        // Usa el helper para obtener los valores, incluso si están anidados
        const aValue = getNestedValue(a, sortConfig.key);
        const bValue = getNestedValue(b, sortConfig.key);

        // --- Lógica de comparación ---
        // Pone nulos/vacíos al final
        if (aValue === null || aValue === undefined || aValue === 'N/A') return 1;
        if (bValue === null || bValue === undefined || bValue === 'N/A') return -1;
        
        let comparison = 0;
        
        // Compara como string (ignorando mayúsculas/minúsculas)
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
        } 
        // Compara como número (si es posible)
        else {
          if (aValue > bValue) comparison = 1;
          if (aValue < bValue) comparison = -1;
        }

        // Invierte el resultado si es descendente
        return sortConfig.direction === 'ascending' ? comparison : -comparison;
      });
    }
    return sortableItems;
  }, [items, sortConfig]); // Se re-calcula solo si los items o el config cambian

  // Función que se llamará al hacer clic en un encabezado
  const requestSort = (key) => {
    let direction = 'ascending';
    // Si ya está ordenado por esta 'key', invierte la dirección
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return { sortedItems, requestSort, sortConfig };
};