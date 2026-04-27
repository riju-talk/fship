$ErrorActionPreference = "Stop"

Write-Host "Checking python dependencies..."
pip install -r requirements.txt

Write-Host "Checking node dependencies..."
npm install

Write-Host "Starting backend and frontend..."
Start-Process -NoNewWindow -Wait -FilePath "uvicorn" -ArgumentList "main:app --host 0.0.0.0 --port 8000 --reload"
Start-Process -NoNewWindow -Wait -FilePath "npm" -ArgumentList "run dev"
