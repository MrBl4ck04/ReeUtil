# Arquitectura de ReeUtil v2.0

## 📋 Resumen Ejecutivo

ReeUtil ha sido completamente refactorizado de un sistema monolítico a una arquitectura moderna de microservicios con separación clara entre frontend y backend. Esta refactorización mejora significativamente la mantenibilidad, escalabilidad y experiencia de desarrollo.

## 🏗️ Arquitectura General

### Antes (v1.0)
```
┌─────────────────────────────────────┐
│           Monolito                  │
│  ┌─────────────────────────────────┐│
│  │        Express Server           ││
│  │  ┌─────────────────────────────┐││
│  │  │     Lógica de Negocio       │││
│  │  │  + Rutas + Modelos +        │││
│  │  │  + HTML + CSS + JS          │││
│  │  └─────────────────────────────┘││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

### Después (v2.0)
```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │
│   (React)       │◄──►│   (NestJS)      │
│                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Components  │ │    │ │ Controllers │ │
│ │ Pages       │ │    │ │ Services    │ │
│ │ Contexts    │ │    │ │ Modules     │ │
│ │ Services    │ │    │ │ Schemas     │ │
│ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │    MongoDB      │
                    │   (Database)    │
                    └─────────────────┘
```

## 🎯 Principios de Diseño

### 1. Separación de Responsabilidades
- **Frontend**: Interfaz de usuario, validación de formularios, navegación
- **Backend**: Lógica de negocio, validación de datos, persistencia
- **Base de Datos**: Almacenamiento y consultas optimizadas

### 2. Modularidad
- Cada funcionalidad está encapsulada en módulos independientes
- Fácil mantenimiento y testing individual
- Reutilización de código entre módulos

### 3. Escalabilidad
- Arquitectura preparada para microservicios
- Separación permite escalado independiente
- Cache y optimizaciones implementadas

## 🔧 Backend Architecture (NestJS)

### Estructura Modular
```
src/
├── main.ts                 # Punto de entrada
├── app.module.ts          # Módulo principal
├── auth/                  # Autenticación
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── jwt.strategy.ts
│   └── dto/
├── users/                 # Gestión de usuarios
├── catalog/               # Catálogo de dispositivos
├── devices/               # Gestión de dispositivos
├── quotations/            # Sistema de cotizaciones
├── rules/                 # Reglas de evaluación
├── inventory/             # Gestión de inventario
├── schemas/               # Modelos de MongoDB
└── plugins/               # Plugins personalizados
```

### Patrones Implementados

#### 1. Module Pattern
```typescript
@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

#### 2. Service Pattern
```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findAll() {
    return this.userModel.find().select('-contraseA').exec();
  }
}
```

#### 3. Controller Pattern
```typescript
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }
}
```

### Middleware y Guards
- **JWT Guard**: Protección de rutas autenticadas
- **Validation Pipe**: Validación automática de DTOs
- **CORS**: Configuración de acceso cross-origin
- **Error Handling**: Manejo centralizado de errores

## 🎨 Frontend Architecture (React)

### Estructura de Componentes
```
src/
├── App.tsx                # Componente principal
├── index.tsx             # Punto de entrada
├── components/           # Componentes reutilizables
│   ├── Layout.tsx
│   ├── ProtectedRoute.tsx
│   └── common/
├── pages/                # Páginas de la aplicación
│   ├── Login.tsx
│   ├── AdminDashboard.tsx
│   ├── ClientDashboard.tsx
│   ├── Catalog.tsx
│   ├── Devices.tsx
│   ├── Inventory.tsx
│   └── Rules.tsx
├── contexts/             # Contextos de React
│   └── AuthContext.tsx
├── services/             # Servicios de API
│   └── api.ts
└── types/                # Definiciones de tipos
```

### Patrones Implementados

#### 1. Context Pattern
```typescript
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // ... lógica de autenticación
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### 2. Custom Hooks Pattern
```typescript
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

#### 3. Service Layer Pattern
```typescript
export const catalogApi = {
  getAll: () => api.get('/catalog'),
  create: (data: any) => api.post('/catalog', data),
  update: (id: string, data: any) => api.patch(`/catalog/${id}`, data),
  delete: (id: string) => api.delete(`/catalog/${id}`),
};
```

## 🗄️ Database Architecture

### Esquemas MongoDB
```typescript
// User Schema
@Schema({ versionKey: false })
export class User {
  @Prop({ required: true })
  idUsuario: number;

  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  contraseA: string;

  @Prop({ default: false })
  rol: boolean; // true = admin, false = cliente
}
```

### Relaciones
- **User** → **Device**: Un usuario puede tener múltiples dispositivos
- **Catalog** → **Device**: Un catálogo puede tener múltiples dispositivos
- **Catalog** → **Rule**: Un catálogo puede tener múltiples reglas

### Optimizaciones
- **Índices**: En campos de búsqueda frecuente
- **Auto-increment**: IDs numéricos para mejor performance
- **Lean Queries**: Consultas optimizadas sin metadatos

## 🔄 Data Flow

### 1. Autenticación
```
User Login → Frontend → API Call → Backend → JWT Validation → Response
```

### 2. CRUD Operations
```
User Action → React Component → API Service → Backend Controller → Service → Database
```

### 3. State Management
```
API Response → React Query Cache → Component State → UI Update
```

## 🚀 Performance Optimizations

### Backend
- **Connection Pooling**: Pool de conexiones MongoDB
- **Query Optimization**: Consultas optimizadas con lean()
- **Caching**: Cache de consultas frecuentes
- **Compression**: Compresión gzip de respuestas

### Frontend
- **React Query**: Cache inteligente de datos del servidor
- **Lazy Loading**: Carga diferida de componentes
- **Code Splitting**: División de código por rutas
- **Memoization**: Optimización de re-renders

## 🔒 Security Architecture

### Autenticación
```typescript
// JWT Strategy
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }
}
```

### Autorización
- **Role-based Access**: Control de acceso basado en roles
- **Route Guards**: Protección de rutas sensibles
- **Input Validation**: Validación estricta de datos

### Seguridad de Datos
- **Password Hashing**: bcrypt para contraseñas
- **CORS Configuration**: Configuración segura de CORS
- **Environment Variables**: Variables sensibles en .env

## 📊 Monitoring & Logging

### Backend Logging
```typescript
// Logging automático de requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});
```

### Error Handling
```typescript
// Manejo centralizado de errores
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Log error and return appropriate response
  }
}
```

## 🧪 Testing Strategy

### Backend Testing
- **Unit Tests**: Servicios y controladores
- **Integration Tests**: Módulos completos
- **E2E Tests**: Flujos completos de usuario

### Frontend Testing
- **Component Tests**: Componentes individuales
- **Integration Tests**: Páginas completas
- **E2E Tests**: Flujos de usuario completos

## 🚀 Deployment Architecture

### Development
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   React     │    │   NestJS    │    │   MongoDB   │
│  (Port 3000)│◄──►│ (Port 5500) │◄──►│ (Port 27017)│
└─────────────┘    └─────────────┘    └─────────────┘
```

### Production
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Nginx     │    │   NestJS    │    │   MongoDB   │
│ (Static +   │◄──►│ (API Server)│◄──►│   Atlas     │
│  Proxy)     │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 📈 Scalability Considerations

### Horizontal Scaling
- **Load Balancer**: Distribución de carga
- **Microservices**: Separación en servicios independientes
- **Database Sharding**: Particionado de base de datos

### Vertical Scaling
- **Resource Optimization**: Optimización de recursos
- **Caching Layers**: Múltiples capas de cache
- **Connection Pooling**: Pool de conexiones optimizado

## 🔮 Future Enhancements

### Short Term
- [ ] Implementar testing completo
- [ ] Agregar logging estructurado
- [ ] Optimizar queries de base de datos
- [ ] Implementar rate limiting

### Long Term
- [ ] Migración a microservicios
- [ ] Implementar GraphQL
- [ ] Agregar WebSocket para notificaciones en tiempo real
- [ ] Implementar CI/CD pipeline

## 📚 Best Practices Implementadas

### Code Organization
- **Feature-based Structure**: Organización por funcionalidad
- **Consistent Naming**: Convenciones de nombres consistentes
- **Type Safety**: TypeScript en todo el stack
- **Error Boundaries**: Manejo de errores en React

### Development Workflow
- **Hot Reload**: Recarga automática en desarrollo
- **Linting**: ESLint y Prettier configurados
- **Git Hooks**: Pre-commit hooks para calidad de código
- **Documentation**: Documentación automática con Swagger

---

Esta arquitectura proporciona una base sólida para el crecimiento futuro de ReeUtil, manteniendo la flexibilidad y escalabilidad necesarias para un sistema de reciclaje moderno.
