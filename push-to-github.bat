@echo off
set PATH=C:\Users\Admin\git\cmd;%PATH%
echo ====================================================
echo  Push CSP Project to GitHub (MadhuriMandali)
echo ====================================================
echo.
echo If you haven't created the repository yet, create it here:
echo https://github.com/new (Repository name: csp)
echo.
set /p REPO_URL="Enter repo URL [Press Enter for https://github.com/MadhuriMandali/csp.git]: "
if "%REPO_URL%"=="" set REPO_URL=https://github.com/MadhuriMandali/csp.git

echo.
echo Connecting to %REPO_URL%...
git remote remove origin 2>nul
git remote add origin %REPO_URL%
git branch -M main
git push -u origin main

echo.
echo ====================================================
echo Finished! Check your repository on GitHub:
echo %REPO_URL%
echo ====================================================
pause
