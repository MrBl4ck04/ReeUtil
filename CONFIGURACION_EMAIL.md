# Configuración de Verificación por Email

Este documento explica cómo configurar el sistema de verificación por código de email para la recuperación de contraseñas.

## 📦 Instalación de Dependencias

### Backend

Primero, instala **Nodemailer** en el directorio del backend:

```bash
cd backend
npm install nodemailer
```

## 🔧 Configuración de Variables de Entorno

### 1. Crear archivo .env

Copia el archivo `.env.example` y renómbralo a `.env`:

```bash
cp .env.example .env
```

### 2. Configurar Gmail

Para usar Gmail como servicio de email, necesitas crear una **Contraseña de Aplicación**:

#### Pasos para generar una Contraseña de Aplicación de Gmail:

1. Ve a tu **Cuenta de Google**: https://myaccount.google.com/
2. En el menú izquierdo, selecciona **Seguridad**
3. En "Acceso a Google", habilita la **Verificación en dos pasos** (si no la tienes activada)
4. Una vez activada la verificación en dos pasos, busca **Contraseñas de aplicaciones**
5. Selecciona "Aplicación": **Correo**
6. Selecciona "Dispositivo": **Otro (nombre personalizado)**
7. Ingresa un nombre como "ReeUtil Backend"
8. Haz clic en **Generar**
9. Google te mostrará una contraseña de 16 caracteres
10. **Copia esta contraseña** y úsala en tu archivo `.env`

### 3. Configurar el archivo .env

Edita tu archivo `.env` y agrega:

```env
# Configuración de Email
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # La contraseña de aplicación generada (sin espacios)
```

**Ejemplo:**

```env
EMAIL_USER=miempresa@gmail.com
EMAIL_PASSWORD=abcdwxyzefgh1234
```

## 🎯 Características del Sistema

### Flujo de Recuperación de Contraseña:

1. **Usuario hace clic en "¿Olvidaste tu contraseña?"**
   - Se abre un modal

2. **Paso 1: Solicitar código**
   - Usuario ingresa su email
   - Sistema envía código de 6 dígitos al email
   - Código válido por **10 minutos**

3. **Paso 2: Verificar código y cambiar contraseña**
   - Usuario ingresa el código recibido
   - Usuario ingresa nueva contraseña (con validación de fortaleza)
   - Sistema valida:
     - Código correcto y no expirado
     - Nueva contraseña cumple requisitos de seguridad
     - Nueva contraseña no está en el historial
   - Si todo es correcto:
     - Cambia la contraseña
     - **Desbloquea la cuenta automáticamente**
     - **Resetea intentos de login a 0**

### Email Enviado

El email que recibe el usuario contiene:

- Diseño profesional con el logo de ReeUtil
- Código de verificación de 6 dígitos en grande
- Mensaje indicando que el código expira en 10 minutos
- Nota de seguridad si no solicitó el cambio

## 📧 Usar Otro Servicio de Email

Si quieres usar **Outlook, Yahoo u otro servicio**, modifica `backend/services/emailService.js`:

### Outlook/Hotmail:

```javascript
const transporter = nodemailer.createTransport({
  service: 'hotmail',  // o 'outlook'
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

### Yahoo:

```javascript
const transporter = nodemailer.createTransport({
  service: 'yahoo',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD  // Usa una contraseña de aplicación
  }
});
```

### SMTP Personalizado:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.tudominio.com',
  port: 587,
  secure: false, // true para port 465, false para otros
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

## 🧪 Probar el Sistema

1. **Inicia el backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Inicia el frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Prueba el flujo:**
   - Ve a la página de login
   - Haz clic en "¿Olvidaste tu contraseña?"
   - Ingresa un email registrado
   - Revisa tu bandeja de entrada
   - Ingresa el código de 6 dígitos
   - Cambia tu contraseña
   - Inicia sesión con la nueva contraseña

## ⚠️ Troubleshooting

### Error: "No se pudo enviar el código"

**Causas comunes:**

1. **Contraseña incorrecta:**
   - Verifica que estás usando una **Contraseña de Aplicación**, NO tu contraseña normal de Gmail
   - Regenera la contraseña de aplicación si es necesario

2. **Verificación en dos pasos no activada:**
   - Gmail requiere que actives la verificación en dos pasos para generar contraseñas de aplicación

3. **Variables de entorno no cargadas:**
   - Verifica que el archivo `.env` existe en la carpeta `backend/`
   - Verifica que las variables están bien escritas (sin espacios extra)
   - Reinicia el servidor backend después de modificar el `.env`

4. **Firewall o antivirus:**
   - Algunos firewalls bloquean conexiones SMTP salientes
   - Temporalmente deshabilita el firewall para probar

### El código no llega

1. **Revisa la carpeta de spam** en tu email
2. **Espera 1-2 minutos** (a veces hay retraso)
3. **Verifica los logs del backend** para ver si hay errores

### Código expirado

- Los códigos son válidos por **10 minutos**
- Si expira, solicita un nuevo código

## 🔒 Seguridad

### Características de seguridad implementadas:

✅ Códigos de un solo uso (se eliminan después de usarse)  
✅ Expiración de 10 minutos  
✅ Validación de fortaleza de contraseña  
✅ Prevención de reutilización de contraseñas  
✅ Desbloqueo automático de cuenta al recuperar contraseña  
✅ Reseteo de intentos fallidos de login  

## 📝 Notas Adicionales

- Los códigos se almacenan en memoria (Map en Node.js)
- Si reinicias el servidor, los códigos pendientes se pierden
- Para producción, considera usar Redis para almacenar códigos
- El servicio de email debe estar correctamente configurado antes de iniciar el servidor

## 🆘 Soporte

Si tienes problemas con la configuración:

1. Verifica los logs del backend: `npm start` en la carpeta backend
2. Revisa la consola del navegador para errores del frontend
3. Verifica que todas las dependencias están instaladas: `npm install`
4. Asegúrate de que MongoDB está corriendo

---

**¡Configuración completa!** 🎉

Ahora tu sistema tiene verificación por email para recuperación de contraseñas.
