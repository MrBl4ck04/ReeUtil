@echo off
echo ========================================
echo    ReeUtil v2.0 - Sistema de Reciclaje
echo ========================================
echo.

echo [1/4] Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias principales...
    npm install
)

if not exist "backend\node_modules" (
    echo Instalando dependencias del backend...
    cd backend
    npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo Instalando dependencias del frontend...
    cd frontend
    npm install
    cd ..
)

echo.
echo [2/4] Verificando archivos de configuración...
if not exist "backend\.env" (
    echo Creando archivo de configuración del backend...
    copy "backend\env.example" "backend\.env"
    echo ¡IMPORTANTE! Edita backend\.env con tu configuración de MongoDB
)

if not exist "frontend\.env" (
    echo Creando archivo de configuración del frontend...
    copy "frontend\env.example" "frontend\.env"
)

echo.
echo [3/4] Iniciando servidores...
echo Backend: http://localhost:5500
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:5500/api
echo.

echo [4/4] Ejecutando en modo desarrollo...
npm run dev
