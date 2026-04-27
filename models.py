from sqlalchemy import Column, String, Integer, Boolean, ForeignKey
from database import Base

class UserRateCard(Base):
    __tablename__ = "user_rate_cards"
    id = Column(Integer, primary_key=True)
    user_id = Column(String, index=True, nullable=False)
    courier_name = Column(String, nullable=False)
    aggregator = Column(String, nullable=False)
    courier_code = Column(String, nullable=True)
    service_type = Column(String, default="surface")
    default_eta = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)

class Warehouse(Base):
    __tablename__ = "warehouses"
    id = Column(Integer, primary_key=True)
    user_id = Column(String, index=True, nullable=False)
    warehouse_id = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    pincode = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
