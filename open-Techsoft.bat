@echo off
cd /d "%~dp0"

echo Starting TechSoft Group Chat...
start "TechSoft Server" cmd /k "npm start"

timeout /t 3 /nobreak >nul

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" http://localhost:3000
) else if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" http://localhost:3000
) else (
    start "" http://localhost:3000
)

exit