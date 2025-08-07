@echo off
echo ========================================
echo    LineMart Services Status Check
echo ========================================
echo.

echo Checking Backend API (Port 8000)...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:8000' -UseBasicParsing -TimeoutSec 5; Write-Host '✅ Backend API: RUNNING' -ForegroundColor Green } catch { Write-Host '❌ Backend API: NOT RUNNING' -ForegroundColor Red }"

echo.
echo Checking Customer Portal (Port 3001)...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3001' -UseBasicParsing -TimeoutSec 5; Write-Host '✅ Customer Portal: RUNNING' -ForegroundColor Green } catch { Write-Host '❌ Customer Portal: NOT RUNNING' -ForegroundColor Red }"

echo.
echo Checking Cashier Portal (Port 3002)...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3002' -UseBasicParsing -TimeoutSec 5; Write-Host '✅ Cashier Portal: RUNNING' -ForegroundColor Green } catch { Write-Host '❌ Cashier Portal: NOT RUNNING' -ForegroundColor Red }"

echo.
echo Checking Manager Portal (Port 3003)...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3003' -UseBasicParsing -TimeoutSec 5; Write-Host '✅ Manager Portal: RUNNING' -ForegroundColor Green } catch { Write-Host '❌ Manager Portal: NOT RUNNING' -ForegroundColor Red }"

echo.
echo ========================================
echo    Quick Access Links
echo ========================================
echo.
echo Backend API:      http://localhost:8000
echo Customer Portal:  http://localhost:3001
echo Cashier Portal:   http://localhost:3002
echo Manager Portal:   http://localhost:3003
echo.
pause