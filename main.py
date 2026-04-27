from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from serviceability_router import router as serviceability_router

app = FastAPI(title="Serviceability API", version="1.0.1")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(serviceability_router)


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "service": "serviceability-api"}
