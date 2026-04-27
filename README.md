# 🚀 Pincode Serviceability Engine

**Production-ready courier serviceability checker**

## 🎯 Mission
Build a **Pincode Serviceability Engine** that:
- Checks route serviceability across multiple courier aggregators (Fship, RapidShyp)
- Matches results against user's configured rate cards
- Returns unified list of serviceable couriers with ETA, freight mode, and pricing
- Runs async parallel calls

**Stack**: FastAPI (async) + React.js + PostgreSQL  

## 🚀 Quick Start
### 1️⃣ Setup Backend
```bash
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2️⃣ Setup Frontend
```bash
npm install
npm run dev
```

### 3️⃣ Test API
```bash
curl "http://localhost:8000/api/check-serviceability?pickup_pincode=110001&destination_pincode=400001&user_id=demo_user"
```

## 🧠 Architecture
1. **React UI**: Collects pincodes, calls FastAPI.
2. **FastAPI**: Validates input, resolves warehouse.
3. **Orchestrator**: Fetches user rate cards, runs parallel aggregator checks.
4. **Aggregators**: Fship (Route-level), RapidShyp (Courier-level).
5. **Database**: PostgreSQL (asyncpg).
