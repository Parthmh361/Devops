@echo off
REM ════════════════════════════════════════════════════════════════════════════════
REM AUTHENTICATION TESTING - START SERVER AND RUN TESTS
REM ════════════════════════════════════════════════════════════════════════════════

echo.
echo ════════════════════════════════════════════════════════════════
echo Starting Authentication Testing
echo ════════════════════════════════════════════════════════════════
echo.

REM Check if npm is installed
where npm >nul 2>nul
if errorlevel 1 (
    echo ERROR: npm is not installed or not in PATH
    pause
    exit /b 1
)

REM Start the server in background
echo [1/2] Starting backend server...
start "Backend Server" cmd /k "cd backend && npm run dev"

REM Wait for server to start
echo [2/2] Waiting for server to start (5 seconds)...
timeout /t 5 /nobreak

REM Run the test script
echo.
echo Running comprehensive authentication tests...
echo.

powershell -ExecutionPolicy Bypass -File "backend\test-auth.ps1"

pause
