# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import settings
from routers.serviceability import router as serviceability_router

app = FastAPI(
    title="Pincode Serviceability API",
    version="1.0.0"
)

# ⚠️ CORS is CRITICAL — without this, React (port 3000) can't call FastAPI (port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),  # from .env
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(serviceability_router)

@app.get("/health")
async def health():
    return {"status": "ok"}

# Run: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
