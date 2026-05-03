"""
IoT Device Communication Service
Handles real-time communication with weight indicators and thermal printers
"""
import serial
import serial.tools.list_ports
import logging
import time
from datetime import datetime
from decimal import Decimal
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)


class WeightIndicatorService:
    """Service for communicating with weight scale indicators"""
    
    def __init__(self, device):
        self.device = device
        self.serial_conn = None
        self.is_connected = False
        
    def connect(self) -> bool:
        """Establish connection to weight indicator"""
        try:
            if self.device.connection_type == "Serial (COM Port)":
                return self._connect_serial()
            elif self.device.connection_type == "TCP/IP (Network)":
                return self._connect_tcp()
            else:
                logger.error(f"Unsupported connection type: {self.device.connection_type}")
                return False
        except Exception as e:
            logger.error(f"Failed to connect to device {self.device.code}: {str(e)}")
            self._handle_error(f"Connection failed: {str(e)}")
            return False
    
    def _connect_serial(self) -> bool:
        """Connect via serial port (COM port)"""
        try:
            self.serial_conn = serial.Serial(
                port=self.device.com_port,
                baudrate=self.device.baud_rate,
                bytesize=self.device.data_bits,
                stopbits=self.device.stop_bits,
                parity=serial.PARITY_NONE if self.device.parity == 'N' else 
                       serial.PARITY_EVEN if self.device.parity == 'E' else 
                       serial.PARITY_ODD,
                timeout=2
            )
            self.is_connected = True
            self.device.status = "Online"
            self.device.last_sync_at = datetime.now()
            self.device.save(update_fields=['status', 'last_sync_at'])
            logger.info(f"Connected to {self.device.name} on {self.device.com_port}")
            return True
        except Exception as e:
            logger.error(f"Serial connection failed: {str(e)}")
            self.is_connected = False
            return False
    
    def _connect_tcp(self) -> bool:
        """Connect via TCP/IP (Network)"""
        # TODO: Implement TCP connection using socket
        logger.warning("TCP connection not yet implemented")
        return False
    
    def read_weight(self) -> Optional[Decimal]:
        """Read current weight from indicator"""
        if not self.is_connected:
            if not self.connect():
                return None
        
        try:
            if self.device.protocol == "Continuous Stream":
                return self._read_continuous()
            elif self.device.protocol == "Modbus RTU":
                return self._read_modbus()
            else:
                logger.error(f"Unsupported protocol: {self.device.protocol}")
                return None
        except Exception as e:
            logger.error(f"Failed to read weight: {str(e)}")
            self._handle_error(f"Read failed: {str(e)}")
            return None
    
    def _read_continuous(self) -> Optional[Decimal]:
        """Read weight from continuous stream protocol"""
        try:
            # Read data from serial
            if self.serial_conn and self.serial_conn.in_waiting:
                data = self.serial_conn.readline().decode('ascii', errors='ignore').strip()
                
                # Parse weight data (format depends on indicator)
                weight = self._parse_weight_data(data)
                
                if weight is not None:
                    self.device.current_weight = weight
                    self.device.last_sync_at = datetime.now()
                    self.device.save(update_fields=['current_weight', 'last_sync_at'])
                    return weight
            
            return None
        except Exception as e:
            logger.error(f"Continuous read error: {str(e)}")
            return None
    
    def _read_modbus(self) -> Optional[Decimal]:
        """Read weight using Modbus RTU protocol"""
        try:
            # TODO: Implement Modbus RTU reading
            # Requires pymodbus library
            logger.warning("Modbus RTU not yet implemented")
            return None
        except Exception as e:
            logger.error(f"Modbus read error: {str(e)}")
            return None
    
    def _parse_weight_data(self, data: str) -> Optional[Decimal]:
        """Parse weight data from indicator"""
        try:
            # Remove non-numeric characters except decimal point and minus
            cleaned = ''.join(c for c in data if c.isdigit() or c in ['.', '-'])
            
            if cleaned:
                weight = Decimal(cleaned)
                # Validate weight is reasonable (0-100000 kg)
                if 0 <= weight <= 100000:
                    return weight
            
            return None
        except Exception as e:
            logger.error(f"Parse error: {str(e)}, Data: {data}")
            return None
    
    def disconnect(self):
        """Close connection to device"""
        try:
            if self.serial_conn and self.serial_conn.is_open:
                self.serial_conn.close()
            self.is_connected = False
            self.device.status = "Offline"
            self.device.save(update_fields=['status'])
            logger.info(f"Disconnected from {self.device.name}")
        except Exception as e:
            logger.error(f"Disconnect error: {str(e)}")
    
    def _handle_error(self, error_msg: str):
        """Handle device error"""
        self.device.status = "Error"
        self.device.error_count += 1
        self.device.last_error = error_msg
        self.device.save(update_fields=['status', 'error_count', 'last_error'])
        logger.error(f"Device {self.device.code} error: {error_msg}")
    
    @staticmethod
    def list_available_ports() -> list:
        """List all available serial ports"""
        ports = serial.tools.list_ports.comports()
        return [
            {
                'port': port.device,
                'description': port.description,
                'hwid': port.hwid
            }
            for port in ports
        ]


class ThermalPrinterService:
    """Service for thermal receipt printing"""
    
    def __init__(self, device):
        self.device = device
        self.printer = None
        
    def connect(self) -> bool:
        """Connect to thermal printer"""
        try:
            if self.device.connection_type == "Serial (COM Port)":
                return self._connect_serial()
            elif self.device.connection_type == "USB":
                return self._connect_usb()
            else:
                logger.error(f"Unsupported printer connection: {self.device.connection_type}")
                return False
        except Exception as e:
            logger.error(f"Printer connection failed: {str(e)}")
            return False
    
    def _connect_serial(self) -> bool:
        """Connect to printer via serial"""
        try:
            # TODO: Implement using python-escpos
            logger.warning("ESC/POS printer integration pending")
            return False
        except Exception as e:
            logger.error(f"Serial printer connection failed: {str(e)}")
            return False
    
    def _connect_usb(self) -> bool:
        """Connect to printer via USB"""
        try:
            # TODO: Implement USB printer connection
            logger.warning("USB printer integration pending")
            return False
        except Exception as e:
            logger.error(f"USB printer connection failed: {str(e)}")
            return False
    
    def print_weigh_slip(self, slip_data: Dict[str, Any]) -> bool:
        """Print weight slip receipt"""
        try:
            if not self.printer:
                if not self.connect():
                    return False
            
            # TODO: Implement receipt printing using ESC/POS
            logger.info(f"Printing slip: {slip_data.get('slip_id')}")
            logger.warning("Print implementation pending")
            return False
            
        except Exception as e:
            logger.error(f"Print failed: {str(e)}")
            return False
    
    def disconnect(self):
        """Disconnect from printer"""
        try:
            if self.printer:
                self.printer.close()
                self.printer = None
        except Exception as e:
            logger.error(f"Printer disconnect error: {str(e)}")


class DeviceManager:
    """Manager for handling multiple IoT devices"""
    
    def __init__(self):
        self.active_connections = {}
    
    def get_device_service(self, device) -> WeightIndicatorService:
        """Get or create device service instance"""
        device_code = device.code
        
        if device_code not in self.active_connections:
            self.active_connections[device_code] = WeightIndicatorService(device)
        
        return self.active_connections[device_code]
    
    def read_weight_from_device(self, device_code: str) -> Optional[Decimal]:
        """Read weight from specific device"""
        from devices.models import Device
        
        try:
            device = Device.objects.get(code=device_code, is_active=True)
            service = self.get_device_service(device)
            return service.read_weight()
        except Device.DoesNotExist:
            logger.error(f"Device {device_code} not found")
            return None
        except Exception as e:
            logger.error(f"Read weight error: {str(e)}")
            return None
    
    def disconnect_all(self):
        """Disconnect all active devices"""
        for code, service in self.active_connections.items():
            try:
                service.disconnect()
            except:
                pass
        self.active_connections.clear()


# Global device manager instance
device_manager = DeviceManager()
