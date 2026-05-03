"""
Django management command to test IoT device connections
Usage: python manage.py test_device_connection <device_code>
"""
from django.core.management.base import BaseCommand
from devices.models import Device
from devices.iot_service import WeightIndicatorService


class Command(BaseCommand):
    help = 'Test connection to IoT device'

    def add_arguments(self, parser):
        parser.add_argument('device_code', type=str, help='Device code to test')

    def handle(self, *args, **kwargs):
        device_code = kwargs['device_code']
        
        try:
            device = Device.objects.get(code=device_code)
            self.stdout.write(self.style.SUCCESS(f'Found device: {device.name}'))
            self.stdout.write(f'Type: {device.device_type}')
            self.stdout.write(f'Connection: {device.connection_type}')
            self.stdout.write(f'Protocol: {device.protocol}')
            
            if device.com_port:
                self.stdout.write(f'COM Port: {device.com_port}')
                self.stdout.write(f'Baud Rate: {device.baud_rate}')
            
            if device.ip:
                self.stdout.write(f'IP: {device.ip}:{device.port}')
            
            self.stdout.write('\nTesting connection...')
            
            service = WeightIndicatorService(device)
            connected = service.connect()
            
            if connected:
                self.stdout.write(self.style.SUCCESS('✓ Connection successful!'))
                
                # Try to read weight
                self.stdout.write('\nReading weight...')
                weight = service.read_weight()
                
                if weight is not None:
                    self.stdout.write(self.style.SUCCESS(f'✓ Current Weight: {weight} {device.weight_unit}'))
                else:
                    self.stdout.write(self.style.WARNING('⚠ Could not read weight (device may not be sending data)'))
                
                service.disconnect()
            else:
                self.stdout.write(self.style.ERROR('✗ Connection failed'))
                self.stdout.write(f'Error: {device.last_error}')
                
        except Device.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Device {device_code} not found'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))
