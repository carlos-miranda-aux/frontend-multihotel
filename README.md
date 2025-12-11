# Simet - Frontend

Interfaz de usuario para el sistema Simet (v2.0), desarrollada con **React**, **Vite** y **Material UI**. Esta aplicación permite la gestión centralizada de inventarios, mantenimientos, usuarios y reportes para múltiples hoteles.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

* **Node.js**: v18 o superior.
* Tener el **Backend** del sistema corriendo (generalmente en el puerto 3000).

## Instalación y Configuración

Sigue estos pasos para desplegar la aplicación en tu entorno local:

### 1. Instalar dependencias

Abre una terminal en la carpeta del proyecto frontend e instala las librerías necesarias:

bash
cd frontend-multihotel
npm install
bash

2. Configurar Variables de Entorno
Crea un archivo .env en la raíz del proyecto (frontend-multihotel/.env) para conectar con tu API.

Contenido del archivo .env:

Fragmento de código

# URL de la API del Backend
# Si estás en desarrollo local, suele ser http://localhost:3000/api
VITE_API_URL="http://localhost:3000/api"

3. Ejecutar en Modo Desarrollo
Para iniciar la aplicación localmente con recarga en caliente (hot-reload):

Bash

npm run dev
//La terminal te mostrará la URL de acceso, generalmente: http://localhost:5173

## Construcción para Producción
Si deseas generar los archivos estáticos optimizados para subir a un servidor web (como Nginx, Apache o Vercel):

Bash

npm run build
//Esto creará una carpeta dist/ con el código compilado (HTML, CSS, JS) listo para producción.
//Para previsualizar la versión de producción localmente:

Bash

npm run preview

##Tecnologías Utilizadas

- Vite: Entorno de desarrollo y empaquetador rápido.

- React: Librería principal para la interfaz.

- Material UI (@mui/material): Sistema de diseño y componentes visuales.

- Axios: Cliente HTTP para las peticiones al backend.

- React Router Dom: Manejo de navegación y rutas protegidas.

- React Hook Form: Gestión y validación de formularios.

- Recharts: Gráficos para el panel de control (Dashboard).

- TanStack Query: Manejo eficiente del estado del servidor y caché.

## Estructura del Proyecto

src/api: Configuración del cliente Axios.

src/assets: Recursos estáticos (imágenes, logos).

src/components: Componentes reutilizables (Tablas, Formularios, Diálogos).

src/context: Estado global de la aplicación (Autenticación, Alertas).

src/hooks: Hooks personalizados (ej. ordenamiento de tablas).

src/pages: Vistas principales (Login, Inventario, Mantenimientos, Usuarios).

src/routes: Configuración de rutas y protección de acceso.

src/theme: Configuración del tema visual (colores, tipografía).
