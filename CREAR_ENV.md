# 🚨 SOLUCIÓN RÁPIDA: Error "Missing credentials for PLAIN"

## ❌ Problema
El error aparece porque **NO EXISTE** el archivo `.env` en la carpeta `backend/`

## ✅ Solución (3 pasos)

### Paso 1: Crear archivo .env

**En Windows (CMD o PowerShell):**
```bash
cd backend
copy .env.example .env
```

**En Windows (Git Bash) o Mac/Linux:**
```bash
cd backend
cp .env.example .env
```

**O manualmente:**
- Abre la carpeta `backend/`
- Crea un archivo nuevo llamado `.env` (SIN extensión .txt)

---

### Paso 2: Editar el archivo .env

Abre `backend/.env` con un editor de texto y configura:

```env
# Base de datos
MONGODB_URI=mongodb://localhost:27017/reeutil

# JWT
JWT_SECRET=mi_clave_secreta_super_segura_12345
JWT_EXPIRES_IN=90d

# EMAIL - IMPORTANTE: Usar contraseña de aplicación de Gmail
EMAIL_USER=talitosalv2004@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx

# CORS
CORS_ORIGIN=http://localhost:3000

# Puerto
PORT=5500
```

---

### Paso 3: Generar Contraseña de Aplicación de Gmail

**⚠️ NO uses tu contraseña normal de Gmail**

1. Ve a: https://myaccount.google.com/security
2. **Activa "Verificación en dos pasos"** (si no la tienes)
3. Busca **"Contraseñas de aplicaciones"**
4. Selecciona:
   - Aplicación: **Correo**
   - Dispositivo: **Otro** → escribe "ReeUtil Backend"
5. Haz clic en **Generar**
6. Google mostrará una contraseña de 16 caracteres: `abcd efgh ijkl mnop`
7. **Cópiala SIN ESPACIOS** y pégala en `EMAIL_PASSWORD`

**Ejemplo final:**
```env
EMAIL_USER=talitosalv2004@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop
```

---

### Paso 4: Reiniciar el servidor

```bash
# Detén el servidor (Ctrl+C)
# Inicia de nuevo:
npm start
```

---

## 🔍 Verificar que funcionó

Cuando inicies el servidor, deberías ver:

```
✓ Variables de email configuradas correctamente
✓ EMAIL_USER: talitosalv2004@gmail.com
```

Si ves:
```
⚠️  ERROR: Variables de entorno EMAIL_USER y/o EMAIL_PASSWORD no configuradas.
```

Significa que:
1. El archivo `.env` no existe
2. El archivo se llama `.env.txt` (mal - debe ser solo `.env`)
3. Las variables están mal escritas

---

## 📝 Notas Importantes

- El archivo `.env` debe estar en: `backend/.env` (NO en la raíz del proyecto)
- El archivo `.env` NO debe tener extensión (.txt, .env.txt, etc.)
- La contraseña debe ser de **Contraseña de Aplicación de Gmail**, NO tu contraseña normal
- Después de crear/editar `.env`, DEBES reiniciar el servidor

---

## 🆘 Si sigue sin funcionar

1. Verifica que nodemailer está instalado:
   ```bash
   cd backend
   npm list nodemailer
   ```

2. Si no está instalado:
   ```bash
   npm install nodemailer
   ```

3. Verifica que el archivo .env existe:
   ```bash
   dir .env   # Windows CMD
   ls -la .env   # Git Bash / Mac / Linux
   ```

4. Verifica el contenido del .env (sin mostrar la contraseña):
   ```bash
   type .env   # Windows
   cat .env    # Mac / Linux
   ```
