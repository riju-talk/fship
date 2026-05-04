from django.core.management.base import BaseCommand

from core.models import Courier, Warehouse


class Command(BaseCommand):
    help = "Initialize the database with sample data."

    def handle(self, *args, **kwargs):
        user_id = "demo_user"

        warehouses = [
            {
                "warehouse_id": "wh-01",
                "name": "Delhi Hub",
                "pincode": "110001",
                "city": "Delhi",
            },
            {
                "warehouse_id": "wh-02",
                "name": "Mumbai Dock",
                "pincode": "400001",
                "city": "Mumbai",
            },
            {
                "warehouse_id": "wh-03",
                "name": "Bengaluru Node",
                "pincode": "560001",
                "city": "Bengaluru",
            },
        ]

        couriers = [
            {
                "name": "Delhivery",
                "aggregator": "Fship",
                "eta": "2-3 days",
                "type": "surface",
                "courier_code": "DLV01",
                "cutoff_time": "16:00",
                "total_freight": 92.5,
                "pickup_available": True,
                "reverse_available": True,
                "prepaid_available": True,
                "cod_available": True,
                "ndd_available": False,
                "zone": "B",
            },
            {
                "name": "Blue Dart",
                "aggregator": "RapidShyp",
                "eta": "1-2 days",
                "type": "air",
                "courier_code": "BD01",
                "cutoff_time": "14:00",
                "total_freight": 125.0,
                "pickup_available": True,
                "reverse_available": False,
                "prepaid_available": True,
                "cod_available": False,
                "ndd_available": True,
                "zone": "A",
            },
            {
                "name": "DTDC",
                "aggregator": "RapidShyp",
                "eta": "3-4 days",
                "type": "surface",
                "courier_code": "DTDC01",
                "cutoff_time": "15:30",
                "total_freight": 85.0,
                "pickup_available": True,
                "reverse_available": False,
                "prepaid_available": True,
                "cod_available": True,
                "ndd_available": False,
                "zone": "C",
            },
            {
                "name": "Xpressbees",
                "aggregator": "RapidShyp New",
                "eta": "4-5 days",
                "type": "surface",
                "courier_code": "XPB01",
                "cutoff_time": "13:45",
                "total_freight": 78.0,
                "pickup_available": True,
                "reverse_available": True,
                "prepaid_available": True,
                "cod_available": True,
                "ndd_available": False,
                "zone": "D",
            },
            {
                "name": "Ecom Express",
                "aggregator": "Fship",
                "eta": "2-3 days",
                "type": "surface",
                "courier_code": "ECM01",
                "cutoff_time": "17:00",
                "total_freight": 88.0,
                "pickup_available": True,
                "reverse_available": True,
                "prepaid_available": True,
                "cod_available": True,
                "ndd_available": False,
                "zone": "B",
            },
        ]

        for warehouse in warehouses:
            Warehouse.objects.update_or_create(
                warehouse_id=warehouse["warehouse_id"],
                defaults={
                    "user_id": user_id,
                    "name": warehouse["name"],
                    "pincode": warehouse["pincode"],
                    "city": warehouse["city"],
                },
            )

        for courier in couriers:
            Courier.objects.update_or_create(
                courier_code=courier["courier_code"],
                defaults={
                    "user_id": user_id,
                    "name": courier["name"],
                    "aggregator": courier["aggregator"],
                    "eta": courier["eta"],
                    "type": courier["type"],
                    "cutoff_time": courier["cutoff_time"],
                    "total_freight": courier["total_freight"],
                    "pickup_available": courier["pickup_available"],
                    "reverse_available": courier["reverse_available"],
                    "prepaid_available": courier["prepaid_available"],
                    "cod_available": courier["cod_available"],
                    "ndd_available": courier["ndd_available"],
                    "zone": courier["zone"],
                },
            )

        self.stdout.write(self.style.SUCCESS("Database initialized with sample data."))