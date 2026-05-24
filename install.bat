@echo off
echo.
echo   Birthday Wisher Enterprise - Dependency Installer
echo   ==================================================
echo.

where java >nul 2>&1 || (echo [ERROR] Java 17+ required. Get it from https://adoptium.net & exit /b 1)
where mvn  >nul 2>&1 || (echo [ERROR] Maven 3.8+ required. Get it from https://maven.apache.org & exit /b 1)
where node >nul 2>&1 || (echo [ERROR] Node.js 18+ required. Get it from https://nodejs.org & exit /b 1)

echo [OK] Prerequisites found
echo.

echo [1/2] Downloading backend Maven dependencies...
cd backend
mvn dependency:resolve -q
if %ERRORLEVEL% NEQ 0 (echo [ERROR] Maven dependency download failed & exit /b 1)
echo [OK] Backend dependencies ready
cd ..
echo.

echo [2/2] Installing frontend npm packages...
cd frontend
npm install
if %ERRORLEVEL% NEQ 0 (echo [ERROR] npm install failed & exit /b 1)
echo [OK] Frontend packages ready
cd ..
echo.

echo   All dependencies installed!
echo.
echo   To start:
echo     Backend:   cd backend ^& mvn spring-boot:run
echo     Frontend:  cd frontend ^& npx ng serve
echo.
pause
