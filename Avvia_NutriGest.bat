@echo off
title NutriGest - Gestionale Nutrizionista
echo =======================================================
echo          NutriGest - Studio Nutrizionale
echo  Cartelle Cliniche, Peso, Bioimpedenziometria & Diete
echo =======================================================
echo.
echo Avvio del server locale in corso...
cd /d "%~dp0"
start "" http://localhost:3001
node server/server.js
pause
