@echo off
title Pole Watch CSP - Rural Electricity Pole Complaint System
echo ====================================================
echo Starting Pole Watch Project (Backend + Frontend)
echo ====================================================
set PATH=C:\Users\Admin\node;%PATH%

start "Pole Watch Backend (Port 4000)" cmd /k "cd /d %~dp0backend && npm start"
start "Pole Watch Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both servers have been launched in background windows:
echo - Backend:  http://localhost:4000
echo - Frontend: http://localhost:5173
echo.
echo Opening browser...
start http://localhost:5173
