# Implementación de Administración de Ventas

## Resumen de Cambios

Se ha implementado un sistema completo de administración de ventas que permite a los administradores gestionar las ventas del marketplace, incluyendo la funcionalidad de habilitar/deshabilitar ventas.

## Cambios en el Backend

### 1. Modelo de Venta (`backend/models/Venta.js`)
- **Agregado campo `estadoAdmin`**: Campo que controla si una venta está habilitada o deshabilitada por el administrador
  - Valores: `'habilitado'` | `'deshabilitado'`
  - Valor por defecto: `'habilitado'`
- **Agregado índice**: Para mejorar el rendimiento de consultas por estado de administración

### 2. Modelo de Usuario (`backend/models/User.js`)
- **Agregado campo `role`**: Para distinguir entre usuarios normales y administradores
  - Valores: `'user'` | `'admin'`
  - Valor por defecto: `'user'`

### 3. Controlador de Autenticación (`backend/controllers/authController.js`)
- **Agregado middleware `restrictTo`**: Para restringir acceso solo a usuarios con roles específicos
- **Actualizado `createSendToken`**: Para incluir información del rol en la respuesta

### 4. Controlador de Ventas (`backend/controllers/ventaController.js`)
- **Agregadas funciones específicas del admin**:
  - `obtenerVentasAdmin`: Obtiene todas las ventas con estadísticas para administración
  - `deshabilitarVenta`: Cambia el estado de una venta a "deshabilitado"
  - `habilitarVenta`: Cambia el estado de una venta a "habilitado"
- **Estadísticas calculadas**:
  - Total de ventas habilitadas
  - Ventas deshabilitadas
  - Ventas completadas
  - Ingresos por comisiones (5% del precio)

### 5. Rutas de Ventas (`backend/routes/ventas.js`)
- **Agregadas rutas de administración**:
  - `GET /api/ventas/admin/todas`: Obtener todas las ventas para admin
  - `PATCH /api/ventas/admin/:id/deshabilitar`: Deshabilitar una venta
  - `PATCH /api/ventas/admin/:id/habilitar`: Habilitar una venta
- **Protección**: Todas las rutas de admin requieren autenticación y rol de administrador

## Cambios en el Frontend

### 1. Servicio de API (`frontend/src/services/api.ts`)
- **Agregado `salesApi`**: Servicio completo para manejar operaciones de ventas
  - Rutas públicas: obtener ventas, buscar, obtener por ID
  - Rutas protegidas: crear, actualizar, comprar, eliminar
  - Rutas de admin: obtener todas para admin, habilitar/deshabilitar

### 2. Componente SalesManagement (`frontend/src/pages/admin/SalesManagement.tsx`)
- **Interfaces TypeScript**: Definidas para `Sale`, `User`, `SalesStats`, `SalesResponse`
- **Estado dinámico**: Reemplazados datos estáticos con datos de la API
- **Funcionalidades implementadas**:
  - Carga automática de ventas al montar el componente
  - Búsqueda en tiempo real
  - Filtrado por estado de administración
  - Estadísticas dinámicas en las tarjetas de resumen
  - Botones para habilitar/deshabilitar ventas
  - Estados de carga y manejo de errores
- **UI mejorada**:
  - Indicador de carga
  - Mensajes de error
  - Tabla con columnas para estado y estado de administración
  - Botones de acción contextuales

## Funcionalidades Implementadas

### Para Administradores:
1. **Ver todas las ventas**: Incluye ventas habilitadas y deshabilitadas
2. **Filtrar ventas**: Por estado de administración (habilitado/deshabilitado)
3. **Buscar ventas**: Por nombre del producto o descripción
4. **Ver estadísticas**: Total de ventas, ingresos por comisiones, ventas deshabilitadas
5. **Deshabilitar ventas**: Cambiar estado a "deshabilitado" (botón de eliminar)
6. **Habilitar ventas**: Cambiar estado a "habilitado" (botón de restaurar)

### Estados de Venta:
- **Estado normal**: `venta`, `comprado`, `disponible`, `vendido`, `pausado`
- **Estado de administración**: `habilitado`, `deshabilitado`

## Uso del Sistema

### Para crear un usuario administrador:
1. Crear un usuario normal a través del registro
2. En la base de datos, cambiar el campo `role` de `'user'` a `'admin'`

### Para usar la administración de ventas:
1. Iniciar sesión como administrador
2. Navegar a la página de "Administrar Ventas"
3. Ver todas las ventas del sistema
4. Usar los filtros para encontrar ventas específicas
5. Hacer clic en el botón de eliminar (🗑️) para deshabilitar una venta
6. Hacer clic en el botón de check (✅) para habilitar una venta deshabilitada

## Consideraciones Técnicas

- **Seguridad**: Todas las rutas de administración requieren autenticación y rol de admin
- **Rendimiento**: Índices agregados para consultas eficientes
- **UX**: Estados de carga, manejo de errores, y feedback visual
- **Escalabilidad**: Estructura preparada para futuras funcionalidades de administración

## Próximos Pasos Sugeridos

1. Implementar confirmación antes de deshabilitar ventas
2. Agregar logs de auditoría para cambios de estado
3. Implementar notificaciones a vendedores cuando se deshabilita su venta
4. Agregar filtros adicionales (por fecha, categoría, etc.)
5. Implementar paginación para grandes volúmenes de ventas
