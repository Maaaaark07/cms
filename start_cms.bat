@echo off
set currentDir=%cd%
echo Starting server.....
cd %currentDir%/server/
start start_server.bat
timeout /t 2 /nobreak
echo Done
echo Starting frontend.....
cd %currentDir%/frontend/
start start_frontend.bat
timeout /t 2 /nobreak
echo Done