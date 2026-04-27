from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from serviceability_router import router as serviceability_router

app = FastAPI(title="Serviceability API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(serviceability_router, prefix="", tags=["Serviceability"])
app.mount("/", StaticFiles(directory=".", html=True), name="static")
