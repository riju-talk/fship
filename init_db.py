import asyncio
from database import engine, Base
from models import UserRateCard, Warehouse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker
import logging

logging.basicConfig(level=logging.INFO)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    async with async_session() as session:
        cards = [
            UserRateCard(user_id='demo_user', courier_name='Delhivery', aggregator='Fship', courier_code='DLH', service_type='surface', default_eta='3-5 days'),
            UserRateCard(user_id='demo_user', courier_name='BlueDart Express', aggregator='RapidShyp', courier_code='BDT', service_type='express', default_eta='1-2 days'),
            UserRateCard(user_id='demo_user', courier_name='Ecom Express', aggregator='RapidShyp', courier_code='ECM', service_type='surface', default_eta='4-6 days')
        ]
        session.add_all(cards)
        
        warehouses = [
            Warehouse(user_id='demo_user', warehouse_id='WH_001', name='Main Hub Delhi', pincode='110001', city='Delhi'),
            Warehouse(user_id='demo_user', warehouse_id='WH_002', name='Mumbai Hub', pincode='400001', city='Mumbai')
        ]
        session.add_all(warehouses)
        
        await session.commit()
    logging.info("Database initialized successfully!")

if __name__ == "__main__":
    asyncio.run(init_db())
