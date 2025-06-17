
@echo off
echo Stopping Company Flow Control Application...
echo.

docker-compose down

if errorlevel 1 (
    echo ERROR: Failed to stop the application.
    pause
    exit /b 1
)

echo.
echo ✅ Application stopped successfully!
echo.
pause
