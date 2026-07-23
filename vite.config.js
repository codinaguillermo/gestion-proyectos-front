import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'

/**
 * Propósito: Configurar el entorno de desarrollo del Frontend (Vite) para levantar en HTTPS 
 * y exponer el servicio hacia la red de área local (LAN).
 * A quién alimenta (quién la llama): Es llamado automáticamente por el motor de Vite al ejecutar 'npm run dev' en la consola.
 * Qué datos retorna: Retorna un objeto de configuración que define los plugins de Vue, la apertura de red (host: true), los certificados de seguridad locales y las reglas de proxy inverso hacia el backend cifrado.
 */
export default defineConfig({
  plugins: [vue()],
  base: '/',
  server: {
    host: true, // Esto expone el servidor a la IP de la red local (192.168.1.100)
    // Configuración para levantar Vite en HTTPS con los nuevos nombres
    https: {
      key: fs.readFileSync('./cert/key.pem'),
      cert: fs.readFileSync('./cert/cert.pem')
    },
    proxy: {
      // Todo lo que empiece con /api en el frontend...
      '/api': {
        target: 'https://127.0.0.1:3000', // ...se redirige al Backend localmente en la VM
        changeOrigin: true,
        secure: false, // Mantenemos false para que el proxy confíe en los certificados locales
      }
    }
  }
})