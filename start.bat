@echo off
echo ========================================
echo    ReeUtil v2.0 - Frontend Only
echo ========================================
echo.

echo [1/2] Verificando dependencias...
if not exist "frontend\node_modules" (
    echo Instalando dependencias del frontend...
    cd frontend
    npm install
    cd ..
)

echo.
echo [2/2] Iniciando servidor de desarrollo...
echo Frontend: http://localhost:3000
echo.

cd frontend
npm start
