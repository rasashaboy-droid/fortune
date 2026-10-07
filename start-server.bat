@echo off
cd /d "%~dp0"
set PORT=8080
echo.
echo  Fortune House - local server
echo  http://localhost:%PORT%
echo.
where py >nul 2>nul && (start "Fortune House server" py -m http.server %PORT% & goto open)
where python >nul 2>nul && (start "Fortune House server" python -m http.server %PORT% & goto open)
where npx >nul 2>nul && (start "Fortune House server" npx --yes serve -l %PORT% . & goto open)
echo  Python or Node.js was not found.
echo  You can still open index.html directly in your browser.
pause
goto :eof
:open
timeout /t 2 /nobreak >nul
start "" http://localhost:%PORT%/index.html
