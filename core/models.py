from django.db import models


class Warehouse(models.Model):
    user_id = models.CharField(max_length=64, db_index=True, default="demo_user")
    warehouse_id = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=255)
    pincode = models.CharField(max_length=6)
    city = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class Courier(models.Model):
    user_id = models.CharField(max_length=64, db_index=True, default="demo_user")
    name = models.CharField(max_length=255)
    aggregator = models.CharField(max_length=255)
    eta = models.CharField(max_length=50)
    type = models.CharField(max_length=50)
    courier_code = models.CharField(max_length=50, unique=True)
    cutoff_time = models.TimeField()
    total_freight = models.DecimalField(max_digits=10, decimal_places=2)
    pickup_available = models.BooleanField(default=True)
    reverse_available = models.BooleanField(default=False)
    prepaid_available = models.BooleanField(default=True)
    cod_available = models.BooleanField(default=True)
    ndd_available = models.BooleanField(default=False)
    zone = models.CharField(max_length=2, blank=True, default="")

    def __str__(self):
        return self.name