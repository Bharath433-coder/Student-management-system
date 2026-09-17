@echo off
REM Script to initialize git repo and push to GitHub (Windows)
SET REPO_URL=https://github.com/Bharath433-coder/Student-management-system.git

REM Change to script directory (should be project root if run from there)
cd /d "%~dp0"

REM Initialize repo if needed
git rev-parse --is-inside-work-tree >nul 2>&1
IF ERRORLEVEL 1 (
  echo Initializing new git repository...
  git init
  git checkout -b main
) ELSE (
  echo Repository already initialized.
)

REM Ensure .gitignore is added
git add .gitignore

REM Add all files
git add -A

REM Commit (if there is anything to commit)
git diff --cached --quiet || (
  git commit -m "Initial commit"
)

REM Add remote if not present
git remote get-url origin >nul 2>&1
IF ERRORLEVEL 1 (
  git remote add origin %REPO_URL%
) ELSE (
  echo Remote 'origin' exists. Setting to provided URL.
  git remote set-url origin %REPO_URL%
)

REM Fetch and rebase if remote has commits
git fetch origin main 2>nul
IF NOT ERRORLEVEL 1 (
  git pull --rebase origin main
)

REM Push to GitHub
git push -u origin main

echo Done. If the push failed, run the commands manually to resolve conflicts.
pause
