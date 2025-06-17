
@echo off
echo Starting Company Flow Control Application...
echo.

REM Check if Docker is running
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not installed or not running.
    echo Please install Docker Desktop for Windows and make sure it's running.
    pause
    exit /b 1
)

echo Docker is available. Building and starting the application...
echo.

REM Build and start the application
docker-compose up --build -d

if errorlevel 1 (
    echo ERROR: Failed to start the application.
    pause
    exit /b 1
)

echo.
echo ✅ Application started successfully!
echo.
echo 🌐 Access the application at: http://localhost:3000
echo 📊 To view logs: docker-compose logs -f
echo 🛑 To stop: docker-compose down
echo.

pause
