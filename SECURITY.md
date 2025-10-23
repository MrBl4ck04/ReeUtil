# Seguridad en ReeUtil (OWASP y Principios de Diseño Seguro)

Este documento resume las medidas de seguridad aplicadas en el backend (Express + MongoDB) y el porqué, alineadas con OWASP y principios de diseño seguro.

## Cambios aplicados

- **Endurecimiento HTTP (Helmet)**
  - Archivo: `backend/server.js`
  - Medida: `helmet()` y `helmet.crossOriginResourcePolicy('same-site')`.
  - Por qué: Reduce superficie de ataque ajustando cabeceras (X-Content-Type-Options, X-Frame-Options, etc.).

- **Límite de tasa (Rate Limiting)**
  - Archivo: `backend/server.js`
  - Medida: `express-rate-limit` para `/api` y más estricto para `/auth`.
  - Por qué: Mitiga fuerza bruta y abuso de endpoints sensibles (OWASP A5 SSR, DoS básico).

- **Validación de entrada y mediación completa**
  - Archivos: `backend/routes/auth.js`, `backend/routes/ventas.js`
  - Medida: `express-validator` valida body, params y query. Middleware `validate` devuelve errores.
  - Por qué: Previene entradas inválidas, asegura que cada solicitud es verificada (complete mediation).

- **Saneamiento de entrada**
  - Archivo: `backend/server.js`
  - Medidas: `express-mongo-sanitize` (NoSQL injection) y `xss-clean` (XSS en payloads JSON).
  - Por qué: Evita operadores maliciosos (`$gt`, `$ne`) y payloads XSS.

- **Prevención de HPP (HTTP Parameter Pollution)**
  - Archivo: `backend/server.js`
  - Medida: `hpp` con whitelist para parámetros esperados repetibles.
  - Por qué: Evita que parámetros duplicados alteren lógicas de filtros.

- **CORS restrictivo y seguridad por defecto**
  - Archivo: `backend/server.js`
  - Medida: CORS con lista permitida (`CORS_ORIGIN`) y error por defecto si el origen no está en la lista.
  - Por qué: Aplica seguridad por defecto (deny by default) y principio de menor asombro.

- **Compresión y cabeceras estándar**
  - Archivo: `backend/server.js`
  - Medida: `compression()`.
  - Por qué: No es de seguridad directa, pero mejora rendimiento sin exponer datos sensibles; combinado con headers seguros.

- **Conexión Mongo endurecida**
  - Archivo: `backend/server.js`
  - Medida: `strictQuery`, timeout, y permitir certificados inválidos sólo en `NODE_ENV=development`.
  - Por qué: Minimiza comportamientos ambiguos y evita aceptar TLS inválido en producción.

- **Variables de entorno de seguridad**
  - Archivo: `backend/.env.example`
  - Medida: Añadidos `CORS_ORIGIN` y `NODE_ENV` con guía.
  - Por qué: Configuración explícita y segura por entorno.

## Mapeo a Reglas/Principios de OWASP

- **Segregación de roles / Mínimo privilegio**
  - Código: `authController.restrictTo('admin')` aplicado en `routes/ventas.js` para rutas `/admin/*`.
  - Código: Modelo `Employee` con `roleId` y `customPermissions`.
  - Por qué: Limita operaciones administrativas a roles autorizados.

- **Seguridad por defecto (fail-safe defaults)**
  - Código: Ventas devuelven por defecto sólo habilitadas si no se especifica `estadoAdmin` (`ventaController.obtenerVentas`).
  - Código: CORS niega orígenes no listados.
  - Por qué: Acceso denegado por defecto y datos sólo visibles si están habilitados.

- **Menor asombro (least astonishment)**
  - Código: Respuestas JSON consistentes `{ status, message }` y validaciones explícitas en rutas.
  - Por qué: Interfaz predecible reduce errores de integración.

- **Mecanismo menos común (reduce attack surface)**
  - Código: `helmet`, `rate-limit`, `mongo-sanitize`, `hpp`, `xss-clean`.
  - Por qué: Minimiza vectores comunes simplificando y endureciendo defaults.

- **Mediación completa**
  - Código: `authController.protect` requerido antes de rutas protegidas.
  - Código: Verificación de propiedad en `ventaController.actualizarVenta/eliminarVenta`.
  - Por qué: Cada solicitud es autenticada/autorizada y verificada en el recurso.

- **Economía de mecanismos**
  - Código: Uso de middleware estándar ampliamente auditado; validadores declarativos.
  - Por qué: Simplicidad reduce errores de implementación.

## Código reutilizado en el backend

- **Tokenización y respuesta de login**
  - `authController.js`: `signToken` y `createSendToken` reutilizados para clientes y empleados (en verify flow).

- **Middlewares transversales**
  - `authController.protect`: reutilizado en `routes/ventas.js` y puede usarse en otras rutas (`employees`, `roles`, etc.).
  - `authController.restrictTo`: patrón de autorización por rol reutilizado.

- **Validación genérica**
  - Middleware `validate` (en `routes/auth.js` y `routes/ventas.js`) reutiliza `express-validator` con una misma estrategia.

- **Funciones de seguridad de contraseña**
  - `User` y `Employee`: método `correctPassword` reutilizado para autenticación.
  - `User`: `isPasswordExpired`, `passwordHistory` usados en cambio/reset de contraseña.

- **Servicios compartidos**
  - `services/emailService.js`: reutilizado para envío de códigos de verificación y notificaciones.

- **Filtros y criterios de ventas**
  - `ventaController.obtenerVentas` y `obtenerVentasAdmin`: patrones de filtros/reutilización de query building y ordenamiento.

## Requisitos de despliegue/entorno

- Instala dependencias del backend:
  - En `backend/` ejecutar: `npm install`
- Configura `.env` en `backend/` con:
  - `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `EMAIL_USER`, `EMAIL_PASSWORD`, `PORT`, `CORS_ORIGIN`, `NODE_ENV`.
- En producción:
  - Usa `NODE_ENV=production`.
  - Configura `CORS_ORIGIN` con los dominios reales.
  - No habilites `tlsAllowInvalidCertificates`.

## Checklist de verificación rápida

- Helmet activo y sin errores.
- Rate limit aplicado a `/auth` y `/api` (ver respuesta de headers `x-ratelimit-*`).
- Validaciones de `express-validator` rechazan inputs inválidos (prueba negativa).
- NoSQL/XSS sanitization activo (intenta enviar `$gt` en body y debe ser eliminado).
- Rutas admin exigen token válido y rol admin.
- CORS sólo permite orígenes listados.
