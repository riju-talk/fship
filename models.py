# models.py
# IMPORTANT: Adapt column names to match YOUR existing DB schema.
# These are reference models — rename fields as needed.

from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey
from database import Base

class UserRateCard(Base):
    """Maps which couriers a user has activated and through which aggregator."""
    __tablename__ = "user_rate_cards"  # ← change to your actual table name

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)
    courier_name = Column(String, nullable=False)   # e.g. "Delhivery"
    aggregator = Column(String, nullable=False)     # e.g. "Fship" | "RapidShyp" | "RapidShyp New"
    courier_code = Column(String, nullable=True)    # e.g. "6001"
    service_type = Column(String, default="surface") # "air" | "surface"
    default_eta = Column(String, nullable=True)     # fallback ETA string
    is_active = Column(Boolean, default=True)

class Warehouse(Base):
    """User-specific warehouses/hubs."""
    __tablename__ = "warehouses"  # ← change to your actual table name

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)
    warehouse_id = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    pincode = Column(String, nullable=False)  # 6-digit
    city = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
