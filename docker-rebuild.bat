
@echo off
echo Rebuilding Company Flow Control Application...
echo.

echo Stopping current containers...
docker-compose down

echo.
echo Rebuilding and starting...
docker-compose up --build -d

if errorlevel 1 (
    echo ERROR: Failed to rebuild the application.
    pause
    exit /b 1
)

echo.
echo ✅ Application rebuilt and started successfully!
echo.
echo 🌐 Access the application at: http://localhost:3000
echo.
pause
