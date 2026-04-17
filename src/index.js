/**
 * PUNTO DE ENTRADA DE LA APLICACIÓN
 * Este es el primer archivo que ejecuta el navegador al cargar la web.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Proveedor de rutas para la navegación
import './App.css'; // Estilos globales
import App from './App'; // El componente principal que contiene toda nuestra lógica

// 1. Localizamos el contenedor 'root' en el HTML (index.html)
const root = ReactDOM.createRoot(document.getElementById('root'));

// 2. Renderizamos la aplicación dentro del contenedor
root.render(
  <React.StrictMode>
    {/* BrowserRouter envuelve la app para permitir el uso de enlaces y redirecciones */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
