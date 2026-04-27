@echo off
echo Starting Project Verification...

echo 1. Installing Backend Dependencies...
pip install -r requirements.txt

echo 2. Initializing Database (SQLite Dry Run)...
python init_db.py

echo 3. Running Backend Tests...
python -m pytest tests/test_serviceability.py -v

echo 4. Installing Frontend Dependencies...
call npm install

echo 5. Building Frontend...
call npm run build

echo Project Verification Complete!
echo Run backend: uvicorn main:app --reload
echo Run frontend: npm run dev
