# ReeUtil Backend — Seguridad (OWASP)

Este documento describe las medidas de seguridad implementadas en el backend (Express + MongoDB) alineadas con las prácticas recomendadas por OWASP, los encabezados HTTP, la seguridad en Login/Registro, el uso de JWT y la asignación de roles y permisos.

## Tabla de contenidos
- [Resumen de medidas OWASP](#resumen-de-medidas-owasp)
- [Encabezados de seguridad (HTTP Headers)](#encabezados-de-seguridad-http-headers)
- [Seguridad en autenticación](#seguridad-en-autenticación)
- [Seguridad en registro](#seguridad-en-registro)
- [JWT: emisión, verificación y ciclo de vida](#jwt-emisión-verificación-y-ciclo-de-vida)
- [Control de acceso: roles y permisos](#control-de-acceso-roles-y-permisos)
- [Validación, saneamiento y hardening](#validación-saneamiento-y-hardening)
- [Configuración segura y variables de entorno](#configuración-segura-y-variables-de-entorno)

---

## Resumen de medidas OWASP

- A01: Broken Access Control
  - Protección de rutas con `protect` (JWT) y control de paneles en frontend con `ProtectedRoute`.
  - Backoffice solo para empleados (administradores) y control granular de módulos (permisos) para UI.

- A02: Cryptographic Failures
  - Contraseñas con hash usando `bcryptjs`.
  - Tokens JWT firmados con `JWT_SECRET` y expiración configurable (`JWT_EXPIRES_IN`).

- A03: Injection
  - Saneamiento NoSQL con `express-mongo-sanitize`.
  - Validación de inputs con `express-validator`.

- A05: Security Misconfiguration
  - Endurecimiento de cabeceras con `helmet()`.
  - CORS restrictivo por orígenes definidos en entorno (`CORS_ORIGIN`).
  - Rate limiting global y específico para `/auth`.
  - `trust proxy` ajustado apropiadamente.

- A07: Identification and Authentication Failures
  - Captcha en login para mitigar automatización.
  - Bloqueo de cuenta tras múltiples intentos fallidos (usuarios cliente).
  - Verificación adicional por código (paso 2) para usuarios cliente antes de emitir token.
  - Políticas de contraseña fuertes en registro y cambio/recuperación.

- A09: Security Logging and Monitoring Failures
  - Auditoría de eventos de login/logout vía `auditService.logEvent`.
  - Endpoint de logs protegido con autenticación.

> Nota: La numeración corresponde a OWASP Top 10; la cobertura se enfoca en mitigaciones prácticas utilizadas en este proyecto.

---

## Encabezados de seguridad (HTTP Headers)

En `backend/server.js` se configura:

- `helmet()` para habilitar un conjunto de cabeceras de seguridad por defecto.
- `helmet.crossOriginResourcePolicy({ policy: 'same-site' })` para restringir el uso de recursos entre orígenes.

Estas cabeceras ayudan a mitigar ataques como clickjacking, MIME sniffing y exposición de recursos entre orígenes.

---

## Seguridad en autenticación

### Flujo de Login (resumen)
- Ruta: `POST /auth/login`
- Validación de entrada con `express-validator` (email, contraseña y captcha).
- Captcha de imagen obligatorio (mitiga abuso/automatización).
- El backend intenta autenticar primero como Empleado (admin) y, si no coincide la contraseña, continúa a Usuario (cliente).
- Para Usuarios (cliente) con credenciales correctas, NO se emite token inmediatamente: se envía un código de verificación por email y se requiere `POST /auth/verify-login-code` para completar el login.
- Para Empleados (admin), al validar credenciales se emite el token inmediatamente.

### Verificación por código (usuarios)
- Ruta: `POST /auth/verify-login-code`
- Requiere email + código de 6 dígitos enviado por email.
- Al validar, se emite `access_token` (JWT) y se devuelve el objeto `user`.

### Protección de rutas
- Middleware `protect` verifica el JWT (Authorization: Bearer) y adjunta el usuario a `req.user`.
- En frontend, `ProtectedRoute` impide acceso a rutas protegidas si no hay token o si el rol no corresponde.

### Anti-abuso y bloqueo de cuentas
- Para usuarios cliente:
  - Contador de intentos fallidos (`loginAttempts`), bloqueo tras múltiples intentos, y ruta para desbloqueo administrativo.
  - Comprobación de bloqueo: `GET /auth/check-blocked/:email`.

---

## Seguridad en registro

- Ruta: `POST /auth/signup` (y alias `/auth/register`).
- Validación obligatoria de campos: nombre, apellidos, género (M/F/N/O), email y contraseñas.
- Políticas de contraseña: longitud mínima y verificación de mayúsculas y símbolo.
- Hash de contraseñas con bcrypt.
- Normalización de email conservando puntos y subdirecciones para evitar falsos positivos en equivalencia.

---

## JWT: emisión, verificación y ciclo de vida

- Emisión con `signToken(userId)` usando `JWT_SECRET` y `JWT_EXPIRES_IN`.
- En respuesta, el token se devuelve como `access_token`.
- Frontend adjunta el token automáticamente en `Authorization: Bearer <token>` gracias al interceptor Axios.
- Verificación en middleware `protect`:
  - Decodifica el token.
  - Busca el sujeto tanto en Empleados como en Usuarios.
  - Adjunta `req.user` y determina tipo de usuario.
- Logout es stateless (se elimina token del storage en el cliente).

Buenas prácticas aplicadas:
- Clave secreta fuera del código (variables de entorno).
- Expiración configurada (rotación manual al cambiar la clave, si aplica).

---

## Control de acceso: roles y permisos

### Modelado
- Empleados (admin):
  - `Employee.roleId` referencia a `Role`.
  - `Employee.customPermissions` referencia a `PermissionModule` (permisos por módulo mediante `moduleId`).
- Usuarios (cliente):
  - Rol fijo de cliente (sin permisos de administración).

### En login
- Para empleados, el backend incluye `user.permissions` como `string[]` con los `moduleId` de sus permisos personalizados.

### En frontend
- `AuthContext.hasPermission(moduleId)` usa `user.permissions` para filtrar módulos del panel admin.
- `AdminLayout` solo muestra navegación para módulos permitidos.
- `ProtectedRoute` exige `requiredRole` (admin/cliente) y puede validar permisos específicos.

> Mejora futura: combinar permisos de `roleId.permissions` con `customPermissions` para heredar automáticamente permisos del Rol y permitir overrides finos.

---

## Validación, saneamiento y hardening

- Validación con `express-validator` en rutas de autenticación.
- Saneamiento:
  - `express-mongo-sanitize()` contra inyección NoSQL.
  - `xss-clean()` para limpiar entradas de potencial XSS.
  - `hpp()` con whitelist para evitar polución de parámetros HTTP.
- CORS restrictivo con lista de orígenes permitidos desde `CORS_ORIGIN`.
- Rate limiting:
  - Global para `/api`.
  - Más estricto para `/auth` (mitiga fuerza bruta).
- Compresión de respuestas con `compression()`.
- `trust proxy` ajustado para compatibilidad con rate limiters y despliegues tras un proxy.

---

## Configuración segura y variables de entorno

Variables clave (archivo `.env` en backend):
- `MONGODB_URI`: cadena de conexión a MongoDB.
- `JWT_SECRET`: clave secreta fuerte y privada.
- `JWT_EXPIRES_IN`: duración del token (ej. `24h`).
- `PORT`: puerto del servidor (evitar conflictos con otros servicios).
- `NODE_ENV`: `production` en despliegue para activar cabeceras y opciones más estrictas.
- `CORS_ORIGIN`: lista separada por comas de orígenes permitidos para CORS.

Recomendaciones:
- Usar HTTPS en producción para habilitar HSTS y proteger tokens en tránsito.
- Rotar `JWT_SECRET` si hay sospecha de exposición.
- Revisar periódicamente los logs de auditoría y endpoints protegidos.
