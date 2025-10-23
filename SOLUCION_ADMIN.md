# Solución para el Error de Permisos de Administrador

## Problema Identificado
El error "No tienes permisos para realizar esta acción" ocurre porque el usuario no tiene el rol de administrador en la base de datos.

## Solución Paso a Paso

### 1. Verificar Usuarios Actuales
Primero, ejecuta este comando para ver todos los usuarios y sus roles:

```bash
node checkUsers.js
```

Esto te mostrará:
- Todos los usuarios registrados
- Sus roles actuales
- Cuántos administradores hay

### 2. Asignar Rol de Administrador
Para convertir un usuario en administrador, ejecuta:

```bash
node makeAdmin.js <email_del_usuario>
```

**Ejemplo:**
```bash
node makeAdmin.js luciana@example.com
```

### 3. Verificar el Cambio
Ejecuta nuevamente el comando de verificación:

```bash
node checkUsers.js
```

Deberías ver que el usuario ahora tiene el rol "admin".

### 4. Reiniciar el Servidor Backend
Después de hacer los cambios en la base de datos, reinicia el servidor backend:

```bash
cd backend
npm run dev
```

### 5. Cerrar Sesión y Volver a Iniciar
En el frontend:
1. Cierra sesión
2. Vuelve a iniciar sesión con el usuario que ahora es administrador
3. Ve a la página de "Administrar Ventas"

## Cambios Realizados en el Código

### Backend - Controlador de Autenticación
Se corrigió el envío del rol en la respuesta de login:

**Antes:**
```javascript
rol: user.role === 'admin'  // Enviaba un booleano
```

**Después:**
```javascript
rol: user.role  // Envía el string del rol ('admin' o 'user')
```

### Scripts Creados
1. **`checkUsers.js`** - Para verificar usuarios y roles
2. **`makeAdmin.js`** - Para asignar rol de administrador
3. **`backend/scripts/makeAdmin.js`** - Versión alternativa del script

## Verificación Final

Después de seguir estos pasos, deberías poder:
- ✅ Ver todas las ventas en la página de administración
- ✅ Ver las estadísticas correctas (no todos en 0)
- ✅ Usar los filtros de búsqueda
- ✅ Habilitar/deshabilitar ventas

## Si el Problema Persiste

1. **Verifica la conexión a la base de datos** - Asegúrate de que el backend esté conectado a MongoDB
2. **Revisa las variables de entorno** - Verifica que `MONGODB_URI` esté configurada correctamente
3. **Verifica el token** - Abre las DevTools y revisa que el token incluya el rol correcto
4. **Revisa la consola del backend** - Busca errores en los logs del servidor

## Comandos de Emergencia

Si necesitas crear un usuario administrador desde cero:

```bash
# 1. Verificar usuarios
node checkUsers.js

# 2. Si no hay usuarios, registra uno desde el frontend
# 3. Luego asigna el rol de admin
node makeAdmin.js <email_del_usuario_registrado>
```
