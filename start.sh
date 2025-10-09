#!/bin/bash

echo "========================================"
echo "   ReeUtil v2.0 - Sistema de Reciclaje"
echo "========================================"
echo

echo "[1/4] Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias principales..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "Instalando dependencias del backend..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "Instalando dependencias del frontend..."
    cd frontend && npm install && cd ..
fi

echo
echo "[2/4] Verificando archivos de configuración..."
if [ ! -f "backend/.env" ]; then
    echo "Creando archivo de configuración del backend..."
    cp "backend/env.example" "backend/.env"
    echo "¡IMPORTANTE! Edita backend/.env con tu configuración de MongoDB"
fi

if [ ! -f "frontend/.env" ]; then
    echo "Creando archivo de configuración del frontend..."
    cp "frontend/env.example" "frontend/.env"
fi

echo
echo "[3/4] Iniciando servidores..."
echo "Backend: http://localhost:5500"
echo "Frontend: http://localhost:3000"
echo "API Docs: http://localhost:5500/api"
echo

echo "[4/4] Ejecutando en modo desarrollo..."
npm run dev
