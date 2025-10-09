# ReeUtil - Sistema de Reciclaje de Dispositivos Electrónicos

## 🚀 Refactorización Completa

Este proyecto ha sido completamente refactorizado con una arquitectura moderna y escalable, migrando de un sistema monolítico a una aplicación full-stack con separación clara de responsabilidades.

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
- 🔐 **Sistema de Autenticación**: Login/Registro con JWT y roles (Admin/Cliente)
- 📱 **Gestión de Catálogo**: CRUD completo de dispositivos electrónicos
- 📋 **Sistema de Cotizaciones**: Evaluación y cotización de dispositivos
- 📊 **Inventario**: Gestión de dispositivos listos para reciclar/vender
- 📜 **Reglas de Evaluación**: Configuración de criterios por tipo de dispositivo
- 👥 **Gestión de Usuarios**: Administración de usuarios y permisos

### Mejoras Implementadas
- 🏗️ **Arquitectura Modular**: Separación clara entre frontend y backend
- 🔒 **Seguridad**: Autenticación JWT, validación de datos, CORS configurado
- 📱 **UI/UX Moderna**: Interfaz responsive con Tailwind CSS
- 🚀 **Performance**: React Query para cache y optimización
- 📚 **Documentación**: API documentada con Swagger
- 🧪 **Testing**: Estructura preparada para testing
- 🔧 **DevOps**: Scripts automatizados para desarrollo y producción

## 🏗️ Arquitectura

### Backend (NestJS)
```
backend/
├── src/
│   ├── auth/           # Módulo de autenticación
│   ├── users/          # Gestión de usuarios
│   ├── catalog/        # Catálogo de dispositivos
│   ├── devices/        # Gestión de dispositivos
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
│   ├── pages/          # Páginas de la aplicación
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

### Frontend
- **React 18**: Biblioteca de UI
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Framework de CSS
- **React Query**: Gestión de estado del servidor
- **React Hook Form**: Manejo de formularios
- **React Router**: Navegación
- **Axios**: Cliente HTTP
- **Lucide React**: Iconos

### Herramientas de Desarrollo
- **ESLint**: Linting de código
- **Prettier**: Formateo de código
- **Concurrently**: Ejecución paralela de scripts
- **Jest**: Framework de testing

## 📦 Instalación

### Prerrequisitos
- Node.js >= 18.0.0
- npm >= 8.0.0
- MongoDB (local o Atlas)

### Instalación Rápida
```bash
# Clonar el repositorio
git clone <repository-url>
cd reeutil-refactored

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
cp frontend/env.example frontend/.env

# Editar con tus configuraciones
# REACT_APP_API_URL=http://localhost:5500
```

## 🚀 Uso

### Desarrollo
```bash
# Ejecutar backend y frontend en paralelo
npm run dev

# O ejecutar por separado:
npm run dev:backend  # Backend en puerto 5500
npm run dev:frontend # Frontend en puerto 3000
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
```

## 📚 API Documentation

Una vez que el backend esté ejecutándose, la documentación de la API estará disponible en:
- **Swagger UI**: http://localhost:5500/api
- **JSON Schema**: http://localhost:5500/api-json

### Endpoints Principales

#### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registro de usuario

#### Catálogo
- `GET /catalog` - Obtener todos los dispositivos
- `POST /catalog` - Crear nuevo dispositivo
- `PUT /catalog/:id` - Actualizar dispositivo
- `DELETE /catalog/:id` - Eliminar dispositivo

#### Dispositivos
- `GET /devices` - Obtener todas las solicitudes
- `POST /devices` - Crear nueva solicitud
- `POST /devices/update-quotation` - Actualizar cotización

#### Inventario
- `GET /inventory` - Obtener inventario completo
- `GET /inventory?tipo=smartphone` - Filtrar por tipo
- `GET /inventory?estado=Para reciclar` - Filtrar por estado

## 📁 Estructura del Proyecto

```
reeutil-refactored/
├── backend/                 # Backend NestJS
│   ├── src/
│   │   ├── auth/           # Autenticación
│   │   ├── users/          # Usuarios
│   │   ├── catalog/        # Catálogo
│   │   ├── devices/        # Dispositivos
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
│   │   ├── contexts/       # Contextos
│   │   ├── services/       # Servicios API
│   │   └── types/          # Tipos TypeScript
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js
├── package.json            # Configuración principal
└── README.md
```

## 🔄 Migración desde la Versión Anterior

### Cambios Principales
1. **Separación Frontend/Backend**: El código monolítico se dividió en dos aplicaciones independientes
2. **Nuevas Tecnologías**: Migración de Express a NestJS y HTML vanilla a React
3. **Mejor Arquitectura**: Implementación de patrones de diseño y separación de responsabilidades
4. **Seguridad Mejorada**: JWT, validación de datos y CORS configurado
5. **UI/UX Moderna**: Interfaz completamente rediseñada con Tailwind CSS

### Datos Compatibles
- ✅ Base de datos MongoDB compatible
- ✅ Esquemas de datos mantenidos
- ✅ Funcionalidades existentes preservadas
- ✅ Usuarios y datos existentes funcionan sin cambios

## 🧪 Testing

```bash
# Testing del backend
cd backend && npm run test

# Testing del frontend
cd frontend && npm run test

# Testing completo
npm run test
```

## 📈 Performance

### Optimizaciones Implementadas
- **React Query**: Cache inteligente de datos
- **Lazy Loading**: Carga diferida de componentes
- **Code Splitting**: División de código para mejor performance
- **MongoDB Indexing**: Índices optimizados para consultas frecuentes
- **Compression**: Compresión gzip en el backend

## 🔒 Seguridad

### Medidas Implementadas
- **JWT Authentication**: Tokens seguros con expiración
- **Input Validation**: Validación estricta de datos de entrada
- **CORS Configuration**: Configuración segura de CORS
- **Password Hashing**: Contraseñas hasheadas con bcrypt
- **Role-based Access**: Control de acceso basado en roles

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

### Docker (Opcional)
```dockerfile
# Dockerfile para backend
FROM node:18-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --only=production
COPY backend/dist ./dist
EXPOSE 5500
CMD ["node", "dist/main"]
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
- **Arquitectura**: Refactorización completa con NestJS + React
- **Diseño**: UI/UX moderna con Tailwind CSS

## 📞 Soporte

Para soporte técnico o preguntas sobre la refactorización:
- Crear un issue en el repositorio
- Contactar al equipo de desarrollo
- Revisar la documentación de la API en `/api`

---

**ReeUtil v2.0** - Sistema de reciclaje moderno y escalable 🚀