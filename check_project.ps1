$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Project Verification..." -ForegroundColor Cyan

Write-Host "📦 1. Installing Backend Dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt

Write-Host "🗄️ 2. Initializing Database (SQLite Dry Run)..." -ForegroundColor Yellow
python init_db.py

Write-Host "🧪 3. Running Backend Tests..." -ForegroundColor Yellow
python -m pytest tests/test_serviceability.py -v

Write-Host "📦 4. Installing Frontend Dependencies..." -ForegroundColor Yellow
npm install

Write-Host "🏗️ 5. Building Frontend..." -ForegroundColor Yellow
npm run build

Write-Host "✅ Project Verification Complete!" -ForegroundColor Green
Write-Host "Run backend: uvicorn main:app --reload"
Write-Host "Run frontend: npm run dev"
