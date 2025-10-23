# ReeUtil - Frontend Only

## ⚠️ Nota Importante

Este proyecto contiene **SOLO EL FRONTEND**. El backend ha sido eliminado para que puedas implementar tu propia solución de backend.

El frontend está completamente funcional y listo para conectarse a cualquier API REST que implementes.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [API Documentation](#api-documentation)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Contribución](#contribución)

## ✨ Características

### Funcionalidades Principales
- 🔐 **Sistema de Autenticación**: Login/Registro con JWT, roles múltiples y permisos granulares
- 🛒 **Marketplace**: Compra y venta de dispositivos electrónicos entre usuarios
- 🔧 **Reparaciones**: Solicitud y gestión de reparaciones de dispositivos
- ♻️ **Reciclaje**: Sistema de reciclaje con compensación económica
- ⭐ **Reseñas**: Sistema de reseñas y calificaciones para vendedores y servicios
- 📱 **Gestión de Catálogo**: CRUD completo de dispositivos electrónicos
- 📋 **Sistema de Cotizaciones**: Evaluación y cotización de dispositivos
- 📊 **Inventario**: Gestión de dispositivos listos para reciclar/vender
- 📜 **Reglas de Evaluación**: Configuración de criterios por tipo de dispositivo
- 👥 **Gestión de Usuarios**: Administración de usuarios, empleados y permisos
- 🔔 **Notificaciones**: Sistema de notificaciones en tiempo real
- 💰 **Simulación de Pagos**: Simulación de transacciones económicas

### Mejoras Implementadas
- 🏗️ **Arquitectura Modular**: Separación clara entre frontend y backend
- 🔒 **Seguridad**: Autenticación JWT, validación de datos, CORS configurado
- 📱 **UI/UX Moderna**: Interfaz responsive con Tailwind CSS
- 🚀 **Performance**: React Query para cache y optimización
- 📚 **Documentación**: API documentada con Swagger
- 🧪 **Testing**: Estructura preparada para testing
- 🔧 **DevOps**: Scripts automatizados para desarrollo y producción
- 🔐 **OSI**: Gestión de permisos por módulos para administradores
- 🔒 **Bloqueo de Cuentas**: Sistema de bloqueo automático por intentos fallidos

## 🏗️ Arquitectura

### Backend (NestJS)
```
backend/
├── src/
│   ├── auth/           # Módulo de autenticación
│   ├── users/          # Gestión de usuarios
│   ├── catalog/        # Catálogo de dispositivos
│   ├── devices/        # Gestión de dispositivos
│   ├── marketplace/    # Sistema de marketplace
│   ├── repairs/        # Sistema de reparaciones
│   ├── recycle/        # Sistema de reciclaje
│   ├── reviews/        # Sistema de reseñas
│   ├── notifications/  # Sistema de notificaciones
│   ├── quotations/     # Sistema de cotizaciones
│   ├── rules/          # Reglas de evaluación
│   ├── inventory/      # Gestión de inventario
│   ├── schemas/        # Modelos de MongoDB
│   ├── plugins/        # Plugins personalizados
│   └── main.ts         # Punto de entrada
```

### Frontend (React + TypeScript)
```
frontend/
├── src/
│   ├── components/     # Componentes reutilizables
│   │   ├── Layout.tsx  # Layout general
│   │   ├── ClientLayout.tsx  # Layout para clientes
│   │   ├── AdminLayout.tsx   # Layout para administradores
│   │   └── ProtectedRoute.tsx # Rutas protegidas
│   ├── pages/          # Páginas de la aplicación
│   │   ├── client/     # Páginas de cliente
│   │   └── admin/      # Páginas de administrador
│   ├── contexts/       # Contextos de React
│   ├── services/       # Servicios de API
│   ├── hooks/          # Custom hooks
│   └── types/          # Definiciones de tipos
```

## 🛠️ Tecnologías

### Backend
- **NestJS**: Framework de Node.js para aplicaciones escalables
- **MongoDB**: Base de datos NoSQL
- **Mongoose**: ODM para MongoDB
- **JWT**: Autenticación basada en tokens
- **Swagger**: Documentación de API
- **Class Validator**: Validación de datos
- **Passport**: Estrategias de autenticación
- **Bcrypt**: Encriptación de contraseñas

### Frontend
- **React 18**: Biblioteca de UI
- **TypeScript**: Tipado estático
- **Vite**: Build tool y dev server ultrarrápido
- **Tailwind CSS**: Framework de CSS
- **React Query**: Gestión de estado del servidor
- **React Hook Form**: Manejo de formularios
- **React Router**: Navegación
- **Axios**: Cliente HTTP
- **Lucide React**: Iconos
- **React Hot Toast**: Notificaciones

### Herramientas de Desarrollo
- **ESLint**: Linting de código
- **Prettier**: Formateo de código
- **Concurrently**: Ejecución paralela de scripts
- **Jest**: Framework de testing
- **Vite**: Servidor de desarrollo y bundler

## 📦 Instalación

### Prerrequisitos
- Node.js >= 18.0.0
- npm >= 8.0.0
- MongoDB (local o Atlas)

### Instalación Rápida
```bash
# Clonar el repositorio
git clone <repository-url>
cd reeutil

# Instalar todas las dependencias
npm run install:all

# Configurar variables de entorno
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env
# Editar backend/.env con tus configuraciones
```

### Instalación Manual
```bash
# Instalar dependencias del proyecto principal
npm install

# Instalar dependencias del backend
cd backend
npm install

# Instalar dependencias del frontend
cd ../frontend
npm install
```

## ⚙️ Configuración

### Variables de Entorno (Backend)
```bash
# Copiar archivo de ejemplo
cp backend/env.example backend/.env

# Editar con tus configuraciones
# MONGODB_URI=mongodb+srv://mati:clapper123@reeutil.f0n5a.mongodb.net/reeutil
# JWT_SECRET=your-super-secret-jwt-key-here
# JWT_EXPIRES_IN=24h
# PORT=5500
# NODE_ENV=development
# CORS_ORIGIN=http://localhost:3000
```

### Variables de Entorno (Frontend)
```bash
# Copiar archivo de ejemplo
cp frontend/env.example frontend/.env.local

# Editar con tus configuraciones
# VITE_API_URL=http://localhost:5500
```

## 🚀 Uso

### Desarrollo
```bash
# Ejecutar backend y frontend en paralelo
npm run dev

# O ejecutar por separado:
npm run dev:backend    # Backend en puerto 5500
cd frontend && npm run dev  # Frontend con Vite (puerto automático)
```

### Producción
```bash
# Construir ambos proyectos
npm run build

# Ejecutar en producción
npm start
```

### Scripts Disponibles
```bash
npm run dev              # Desarrollo completo
npm run build            # Construcción completa
npm run test             # Testing completo
npm run lint             # Linting completo
npm run install:all      # Instalar todas las dependencias

# Scripts específicos del frontend (desde frontend/)
npm run dev              # Servidor de desarrollo Vite
npm run build            # Build de producción con Vite
npm run preview          # Vista previa del build de producción
```

## 📚 API Documentation

Una vez que el backend esté ejecutándose, la documentación de la API estará disponible en:
- **Swagger UI**: http://localhost:5500/api
- **JSON Schema**: http://localhost:5500/api-json

### Endpoints Principales

#### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registro de usuario
- `POST /auth/login-attempts/increment` - Incrementar intentos fallidos
- `POST /auth/login-attempts/reset` - Resetear intentos fallidos
- `GET /auth/check-blocked/:email` - Verificar si un usuario está bloqueado

#### Marketplace
- `GET /marketplace/products` - Obtener productos disponibles
- `POST /marketplace/products` - Crear nuevo producto
- `PATCH /marketplace/products/:id` - Actualizar producto
- `DELETE /marketplace/products/:id` - Eliminar producto
- `POST /marketplace/purchase` - Comprar un producto
- `POST /marketplace/simulate-payment` - Simular un pago
- `GET /marketplace/my-purchases` - Obtener mis compras
- `GET /marketplace/my-sales` - Obtener mis ventas

#### Reparaciones
- `POST /repairs/request` - Solicitar reparación
- `GET /repairs/my-requests` - Obtener mis solicitudes
- `GET /repairs/all` - Obtener todas las solicitudes (admin)
- `PATCH /repairs/:id/quote` - Actualizar cotización
- `PATCH /repairs/:id/status` - Actualizar estado
- `POST /repairs/:id/accept` - Aceptar cotización
- `POST /repairs/:id/reject` - Rechazar cotización

#### Reciclaje
- `POST /recycle/request` - Solicitar reciclaje
- `GET /recycle/my-requests` - Obtener mis solicitudes
- `GET /recycle/all` - Obtener todas las solicitudes (admin)
- `PATCH /recycle/:id/quote` - Actualizar cotización
- `PATCH /recycle/:id/status` - Actualizar estado
- `POST /recycle/:id/accept` - Aceptar oferta
- `POST /recycle/:id/reject` - Rechazar oferta

#### Reseñas
- `POST /reviews` - Crear reseña
- `GET /reviews/my-reviews` - Obtener mis reseñas
- `GET /reviews/seller/:sellerId` - Obtener reseñas de un vendedor
- `GET /reviews/all` - Obtener todas las reseñas (admin)
- `GET /reviews/stats` - Obtener estadísticas (admin)
- `PATCH /reviews/:id` - Actualizar reseña
- `DELETE /reviews/:id` - Eliminar reseña
- `POST /reviews/:id/flag` - Reportar reseña (admin)

#### Notificaciones
- `GET /notifications` - Obtener notificaciones
- `PATCH /notifications/:id/read` - Marcar como leída
- `PATCH /notifications/read-all` - Marcar todas como leídas
- `DELETE /notifications/:id` - Eliminar notificación

## 📁 Estructura del Proyecto Actualizada

```
reeutil/
├── backend/                 # Backend NestJS
│   ├── src/
│   │   ├── auth/           # Autenticación
│   │   ├── users/          # Usuarios
│   │   ├── catalog/        # Catálogo
│   │   ├── devices/        # Dispositivos
│   │   ├── marketplace/    # Marketplace
│   │   ├── repairs/        # Reparaciones
│   │   ├── recycle/        # Reciclaje
│   │   ├── reviews/        # Reseñas
│   │   ├── notifications/  # Notificaciones
│   │   ├── quotations/     # Cotizaciones
│   │   ├── rules/          # Reglas
│   │   ├── inventory/      # Inventario
│   │   ├── schemas/        # Modelos MongoDB
│   │   └── plugins/        # Plugins
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes
│   │   ├── pages/          # Páginas
│   │   │   ├── client/     # Páginas de cliente
│   │   │   └── admin/      # Páginas de administrador
│   │   ├── contexts/       # Contextos
│   │   ├── services/       # Servicios API
│   │   └── types/          # Tipos TypeScript
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js
├── package.json            # Configuración principal
└── README.md
```

## 🔄 Nuevas Funcionalidades

### 1. Marketplace
- Compra y venta de dispositivos entre usuarios
- Sistema de comisiones por ventas
- Simulación de pagos
- Gestión de transacciones

### 2. Reparaciones
- Solicitud de reparación de dispositivos
- Cotización por técnicos
- Seguimiento de estado
- Notificaciones de actualización

### 3. Reciclaje
- Solicitud de reciclaje con compensación económica
- Evaluación de dispositivos
- Gestión de ofertas
- Proceso de pago al usuario

### 4. Reseñas y Calificaciones
- Sistema de reseñas para vendedores
- Calificaciones de 1 a 5 estrellas
- Moderación de reseñas por administradores
- Estadísticas de satisfacción

### 5. Notificaciones
- Notificaciones en tiempo real
- Alertas de actualizaciones
- Gestión de lectura/no leída
- Acciones rápidas desde notificaciones

### 6. Gestión de Permisos (OSI)
- Control granular de permisos por módulo
- Asignación de permisos por empleado
- Roles personalizables
- Seguridad por niveles

## 🔒 Seguridad Mejorada

### Medidas Implementadas
- **JWT Authentication**: Tokens seguros con expiración
- **Input Validation**: Validación estricta de datos de entrada
- **CORS Configuration**: Configuración segura de CORS
- **Password Hashing**: Contraseñas hasheadas con bcrypt
- **Role-based Access**: Control de acceso basado en roles
- **Permission-based Access**: Control de acceso basado en permisos
- **Account Locking**: Bloqueo de cuentas tras intentos fallidos
- **Admin Approval**: Desbloqueo de cuentas por administradores

## 🚀 Deployment

### Backend (NestJS)
```bash
cd backend
npm run build
npm run start:prod
```

### Frontend (React)
```bash
cd frontend
npm run build
# Servir archivos estáticos con nginx, apache, etc.
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Equipo

- **Desarrollo**: Equipo ReeUtil
- **Arquitectura**: Sistema completo con NestJS + React
- **Diseño**: UI/UX moderna con Tailwind CSS

## 📞 Soporte

Para soporte técnico o preguntas sobre el proyecto:
- Crear un issue en el repositorio
- Contactar al equipo de desarrollo
- Revisar la documentación de la API en `/api`

---

**ReeUtil v3.0** - Sistema de reciclaje, reparación y marketplace moderno y escalable 🚀