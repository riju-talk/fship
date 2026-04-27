from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    FSHIP_SIGNATURE: str
    FSHIP_BASE_URL: str = "https://capi-qc.fship.in"
    RAPIDSHYP_API_KEY: str
    RAPIDSHYP_BASE_URL: str = "https://api.rapidshyp.com/rapidshyp/apis/v1"
    RAPIDSHYP_NEW_API_KEY: str
    RAPIDSHYP_NEW_BASE_URL: str = "https://api.rapidshyp.com/rapidshyp/apis/v2"
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173"

    class Config:
        env_file = ".env"

settings = Settings()

engine = create_async_engine(settings.DATABASE_URL, echo=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

class Base(DeclarativeBase):
    pass

# FastAPI dependency — inject DB session into route handlers
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
