from django.db import models

class Company(models.Model):
    name = models.CharField(max_length=150, unique=True)
    address = models.CharField(max_length=255, blank=True, default="")
    contact_number = models.CharField(max_length=50, blank=True, default="")

    def __str__(self):
        return self.name
