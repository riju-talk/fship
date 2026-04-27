import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Pincode Serviceability API")

# CORS for React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers.serviceability import router as serviceability_router
app.include_router(serviceability_router)

@app.get("/health")
async def health():
    return {"status": "ok"}

# Run: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
