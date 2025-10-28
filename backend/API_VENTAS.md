# API de Ventas - ReeUtil

## Descripción
La API de ventas permite a los usuarios autenticados publicar, gestionar y buscar dispositivos en venta.

## Endpoints Disponibles

### Rutas Públicas (No requieren autenticación)

#### 1. Obtener todas las ventas
```
GET /api/ventas
```
**Parámetros de consulta opcionales:**
- `categoria`: smartphone, tablet, laptop, desktop, accesorio, otro
- `estado`: disponible, vendido, pausado
- `condicion`: nuevo, usado-excelente, usado-bueno, usado-regular
- `precioMin`: precio mínimo
- `precioMax`: precio máximo

**Ejemplo:**
```
GET /api/ventas?categoria=smartphone&precioMin=100&precioMax=500
```

#### 2. Buscar ventas por texto
```
GET /api/ventas/buscar?q=iPhone
```

#### 3. Obtener una venta específica
```
GET /api/ventas/:id
```

### Rutas Protegidas (Requieren autenticación)

#### 4. Crear una nueva venta
```
POST /api/ventas
```
**Headers requeridos:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Cuerpo de la petición:**
```json
{
  "nombre": "iPhone 12 Pro",
  "descripcion": "iPhone 12 Pro en excelente estado, incluye cargador y caja original",
  "precio": 800,
  "categoria": "smartphone",
  "condicion": "usado-excelente"
}
```

#### 5. Obtener mis ventas
```
GET /api/ventas/usuario/mis-ventas
```

#### 6. Actualizar una venta
```
PATCH /api/ventas/:id
```
**Cuerpo de la petición (campos opcionales):**
```json
{
  "nombre": "iPhone 12 Pro - Actualizado",
  "precio": 750,
  "estado": "pausado"
}
```

#### 7. Eliminar una venta
```
DELETE /api/ventas/:id
```

## Estructura del Modelo de Venta

```json
{
  "ventaId": "VTA-1234567890-abc123def",
  "nombre": "iPhone 12 Pro",
  "descripcion": "iPhone 12 Pro en excelente estado",
  "precio": 800,
  "usuario": {
    "_id": "user_id",
    "name": "Juan Pérez",
    "email": "juan@email.com"
  },
  "fechaCreacion": "2024-01-15T10:30:00.000Z",
  "estado": "disponible",
  "categoria": "smartphone",
  "condicion": "usado-excelente"
}
```

## Campos del Modelo

- **ventaId**: ID único generado automáticamente
- **nombre**: Nombre del dispositivo (requerido, máx. 100 caracteres)
- **descripcion**: Descripción detallada (requerido, máx. 500 caracteres)
- **precio**: Precio en números (requerido, no puede ser negativo)
- **usuario**: Referencia al usuario que creó la venta
- **fechaCreacion**: Fecha de creación automática
- **estado**: disponible, vendido, pausado (por defecto: disponible)
- **categoria**: smartphone, tablet, laptop, desktop, accesorio, otro
- **condicion**: nuevo, usado-excelente, usado-bueno, usado-regular

## Códigos de Respuesta

- **200**: Operación exitosa
- **201**: Recurso creado exitosamente
- **204**: Recurso eliminado exitosamente
- **400**: Error en la petición
- **401**: No autorizado
- **403**: Prohibido (no tienes permisos)
- **404**: Recurso no encontrado

## Ejemplos de Uso

### Crear una venta
```bash
curl -X POST http://localhost:5500/api/ventas \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "MacBook Air M1",
    "descripcion": "MacBook Air con chip M1, 8GB RAM, 256GB SSD",
    "precio": 1200,
    "categoria": "laptop",
    "condicion": "usado-excelente"
  }'
```

### Buscar ventas
```bash
curl "http://localhost:5500/api/ventas?categoria=laptop&precioMax=1500"
```

### Obtener mis ventas
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5500/api/ventas/usuario/mis-ventas
```