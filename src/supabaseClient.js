/**
 * CONFIGURACIÓN DE SUPABASE
 * Este archivo actúa como el punto de conexión único entre la aplicación React
 * y la base de datos de Supabase.
 */

import { createClient } from "@supabase/supabase-js";

// 1. Definición de credenciales de acceso al backend
// La URL identifica el proyecto y la Key autoriza las peticiones desde el frontend
const supabaseUrl = "https://eozxmjjsogdjzpzjirez.supabase.co";
const supabaseKey = "sb_publishable_N_pnKui7GD0NWwpaiXJl4Q_8UcGWTXW";

// 2. Creación e inicialización del cliente
// Exportamos esta instancia para que pueda ser usada en cualquier componente de la app
export const supabase = createClient(supabaseUrl, supabaseKey);
