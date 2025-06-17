
@echo off
echo Showing application logs...
echo Press Ctrl+C to exit log view
echo.

docker-compose logs -f app
