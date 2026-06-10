@echo off
echo === C. Carvalho - Setup Automatico ===
echo.

echo [1/4] Instalando dependencias do backend...
cd backend
npm install
cd ..

echo [2/4] Instalando dependencias do frontend...
cd frontend
npm install
cd ..

echo [3/4] Configurando banco de dados...
echo Copie o arquivo backend\.env.example para backend\.env
echo e configure a DATABASE_URL antes de continuar.
echo.
pause

echo [4/4] Inicializando banco...
cd backend
npx prisma migrate dev --name init
node src/config/seed.js
cd ..

echo.
echo === Setup concluido! ===
echo Backend:  cd ccarvalho\backend  ^&^& node server.js
echo Frontend: cd ccarvalho\frontend ^&^& npm run dev
echo.
pause
