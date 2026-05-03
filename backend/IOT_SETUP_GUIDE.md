# IoT Device Integration Guide

## Overview
This project now supports full IoT device integration including:
- Weight Scale Indicators (Serial/Network)
- Thermal Printers (Serial/USB)
- Real-time weight reading
- Automatic slip printing

## Installation

### 1. Install Required Packages
```bash
cd backend
pip install -r requirements_iot.txt
```

### 2. Database Migration
```bash
python manage.py makemigrations devices
python manage.py migrate
```

## Supported Devices

### Weight Indicators
- **Connection Types:**
  - Serial (COM Port) - Most common
  - TCP/IP (Network)
  - USB
  - Bluetooth

- **Protocols:**
  - Continuous Stream (default)
  - Modbus RTU (coming soon)
  - Custom protocols

### Thermal Printers
- **Connection Types:**
  - Serial (COM Port)
  - USB
  
- **Print Standards:**
  - ESC/POS (Epson standard)
  - 80mm and 58mm paper sizes

## Configuration

### 1. Add Device in Dashboard
Go to: **Devices** page in admin dashboard

**For Weight Indicator:**
- Device Type: Weight Indicator
- Connection Type: Serial (COM Port)
- Protocol: Continuous Stream
- COM Port: COM3 (Windows) or /dev/ttyUSB0 (Linux)
- Baud Rate: 9600 (check your device manual)
- Data Bits: 8
- Stop Bits: 1
- Parity: N (None)

**For Thermal Printer:**
- Device Type: Thermal Printer
- Connection Type: Serial or USB
- Paper Size: 80mm or 58mm

### 2. Test Device Connection
```bash
python manage.py test_device_connection DEV-1234567890
```

## API Endpoints

### Read Weight
```http
GET /api/devices/{device_code}/read_weight/
Authorization: Bearer <token>
X-Branch-Id: <branch_id>

Response:
{
  "device_code": "DEV-123",
  "weight": 1250.50,
  "unit": "kg",
  "status": "success"
}
```

### Connect to Device
```http
POST /api/devices/{device_code}/connect/
Authorization: Bearer <token>
```

### Print Slip
```http
POST /api/devices/{device_code}/print_slip/
Authorization: Bearer <token>
Content-Type: application/json

{
  "slip_data": {
    "slip_id": "SL-1001",
    "vehicle": "ABC-1234",
    "customer": "John Doe",
    "material": "Wheat",
    "gross_weight": 5000,
    "tare_weight": 2000,
    "net_weight": 3000,
    "date": "2026-04-28 10:30:00"
  }
}
```

### List Available COM Ports
```http
GET /api/devices/available_ports/
Authorization: Bearer <token>

Response:
{
  "ports": [
    {
      "port": "COM3",
      "description": "USB Serial Port",
      "hwid": "USB VID:PID=..."
    }
  ]
}
```

## Hardware Setup

### Connecting Weight Indicator (Serial)

1. **Connect Hardware:**
   - Connect indicator to PC using RS232-USB cable
   - Note the COM port number (Device Manager in Windows)

2. **Configure Indicator:**
   - Set baud rate (common: 9600, 19200, 38400)
   - Set data bits: 8
   - Set stop bits: 1
   - Set parity: None
   - Enable continuous transmission mode

3. **Common Indicator Brands:**
   - Mettler Toledo
   - Rice Lake
   - Cardinal
   - Flintec
   - A&D

### Connecting Thermal Printer

1. **Connect Hardware:**
   - USB or Serial connection
   - Install printer drivers if needed

2. **Supported Printers:**
   - Epson TM series
   - BIXOLON
   - STAR
   - Any ESC/POS compatible printer

## Troubleshooting

### Device Not Connecting
1. Check COM port number is correct
2. Verify baud rate matches device settings
3. Ensure no other program is using the port
4. Check cable connections
5. Try different USB port

### Weight Not Reading
1. Ensure indicator is in continuous mode
2. Check data format from indicator
3. Verify parity settings
4. Use terminal software to test raw data

### Common Issues
- **Port Access Denied:** Close other programs using the port
- **Wrong Weight:** Check decimal point position in indicator
- **Connection Timeout:** Increase timeout in settings

## Testing

### Manual Testing
```bash
# Test device connection
python manage.py test_device_connection DEV-123

# Check Django server logs for detailed output
python manage.py runserver
```

### API Testing with Postman/cURL
```bash
# Read weight
curl -X GET http://localhost:8000/api/devices/DEV-123/read_weight/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "X-Branch-Id: 1"
```

## Production Deployment

### Windows
- Use actual COM ports (COM1, COM2, etc.)
- Run as Administrator for port access
- Consider using Windows Task Scheduler for auto-start

### Linux
- Use /dev/ttyUSB0 or /dev/ttyS0
- Add user to dialout group: `sudo usermod -a -G dialout username`
- Use systemd service for auto-start

### Docker
- Map serial ports: `--device /dev/ttyUSB0`
- Requires privileged mode or specific device mapping

## Next Steps

1. Install required packages
2. Connect your hardware
3. Add devices in dashboard
4. Test connections
5. Integrate with slip creation workflow

## Support

For custom protocol implementation or specific device support, contact development team.
