# Migración a Vite

## ✅ Cambios Realizados

Esta migración reemplaza Create React App con Vite para mejorar el rendimiento de desarrollo y construcción.

### Instalaciones
- ✅ **Vite** y **@vitejs/plugin-react** instalados como dependencias de desarrollo
- ✅ Dependencias instaladas con `--legacy-peer-deps` para resolver conflictos

### Configuración
- ✅ **vite.config.ts** creado con:
  - Plugin de React
  - Configuración de proxy para API (`/api` → `http://localhost:5500`)
  - Configuración optimizada para desarrollo

### Scripts Actualizados
- ✅ `npm run dev` → `vite` (servidor de desarrollo)
- ✅ `npm run build` → `vite build` (construcción de producción)
- ✅ `npm run preview` → `vite preview` (vista previa de producción)
- ✅ Proxy movido de `package.json` a `vite.config.ts`

### Estructura de Archivos
- ✅ **index.html** movido de `public/` a la raíz del frontend
- ✅ Referencias `%PUBLIC_URL%` cambiadas a rutas absolutas (`/`)
- ✅ Script de entrada agregado: `<script type="module" src="/src/index.tsx"></script>`
- ✅ Archivo duplicado en `public/` eliminado

### Beneficios de Vite
- 🚀 **Inicio más rápido**: ~10-100x más rápido que Create React App
- ⚡ **Hot Module Replacement (HMR)** mejorado
- 📦 **Build más eficiente**: ES modules nativos, tree-shaking optimizado
- 🔧 **Configuración flexible**: Fácil personalización
- 🛠️ **Mejor DX**: Mensajes de error más claros, debugging mejorado

## 🚀 Uso

### Desarrollo
```bash
cd frontend
npm run dev  # Inicia en http://localhost:5173 (por defecto)
```

### Producción
```bash
cd frontend
npm run build   # Construye para producción
npm run preview # Vista previa del build
```

## ⚠️ Notas Importantes

1. **Puerto**: Vite usa el puerto 5173 por defecto (configurable en `vite.config.ts`)
2. **Proxy**: Las llamadas a `/api` se redirigen automáticamente al backend en puerto 5500
3. **Assets**: Los archivos estáticos siguen en `public/` pero se referencian con `/`
4. **Environment Variables**: Usar `VITE_` prefix para variables accesibles en el cliente

## 🔧 Configuración Adicional (Opcional)

### Alias de Paths
Si deseas usar alias como `@/` para imports, agrega a `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // ... resto de configuración
})
```

### Variables de Entorno
Crear `.env.local`:
```
VITE_API_URL=http://localhost:5500
```

Acceder en código:
```typescript
const apiUrl = import.meta.env.VITE_API_URL
```

## 🔄 Reversión (si es necesario)

Para volver a Create React App:
```bash
cd frontend
npm uninstall vite @vitejs/plugin-react
npm install react-scripts
# Restaurar package.json scripts originales
# Mover index.html de vuelta a public/
# Remover vite.config.ts
```
