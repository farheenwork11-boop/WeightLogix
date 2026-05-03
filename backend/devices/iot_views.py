"""
IoT Device API Endpoints
Provides REST API for device management and real-time weight reading
"""
import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from .models import Device
from .serializers import DeviceSerializer
from .permissions import DeviceRolePermission
from .iot_service import WeightIndicatorService, ThermalPrinterService, device_manager
from api.utils import current_branch_id

logger = logging.getLogger(__name__)


class DeviceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing IoT devices (weight indicators & printers)
    """
    queryset = Device.objects.select_related("branch").filter(is_active=True)
    serializer_class = DeviceSerializer
    permission_classes = [IsAuthenticated, DeviceRolePermission]
    lookup_field = "code"
    lookup_url_kwarg = "code"

    def get_queryset(self):
        qs = super().get_queryset()
        user = self.request.user
        role = (getattr(user, "role", "") or "").strip()
        bid = current_branch_id(self.request, user=user)

        if role == "Admin":
            return qs.filter(branch_id=bid) if bid else qs

        ub = getattr(user, "branch_id", None)
        if not ub:
            return qs.none()
        return qs.filter(branch_id=ub)

    @action(detail=True, methods=['get'])
    def read_weight(self, request, code=None):
        """
        Read current weight from device
        GET /api/devices/{code}/read_weight/
        """
        try:
            device = self.get_object()
            
            if device.device_type not in ['Weight Indicator', 'Indicator + Printer']:
                return Response(
                    {'error': 'Device is not a weight indicator'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            service = device_manager.get_device_service(device)
            weight = service.read_weight()
            
            if weight is not None:
                return Response({
                    'device_code': code,
                    'weight': weight,
                    'unit': device.weight_unit,
                    'status': 'success'
                })
            else:
                return Response({
                    'device_code': code,
                    'weight': None,
                    'error': 'Failed to read weight',
                    'status': 'error'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            logger.error(f"Read weight error: {str(e)}")
            return Response({
                'error': str(e),
                'status': 'error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def connect(self, request, code=None):
        """
        Connect to device
        POST /api/devices/{code}/connect/
        """
        try:
            device = self.get_object()
            service = device_manager.get_device_service(device)
            
            if service.connect():
                return Response({
                    'status': 'connected',
                    'device': code,
                    'message': 'Successfully connected to device'
                })
            else:
                return Response({
                    'status': 'failed',
                    'device': code,
                    'error': 'Connection failed'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            return Response({
                'error': str(e),
                'status': 'error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def disconnect(self, request, code=None):
        """
        Disconnect from device
        POST /api/devices/{code}/disconnect/
        """
        try:
            device = self.get_object()
            service = device_manager.get_device_service(device)
            service.disconnect()
            
            return Response({
                'status': 'disconnected',
                'device': code,
                'message': 'Successfully disconnected'
            })
            
        except Exception as e:
            return Response({
                'error': str(e),
                'status': 'error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def print_slip(self, request, code=None):
        """
        Print weight slip on thermal printer
        POST /api/devices/{code}/print_slip/
        Body: { "slip_id": 123, "slip_data": {...} }
        """
        try:
            device = self.get_object()
            
            if device.device_type not in ['Thermal Printer', 'Indicator + Printer']:
                return Response(
                    {'error': 'Device is not a printer'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            slip_data = request.data.get('slip_data', {})
            
            printer_service = ThermalPrinterService(device)
            success = printer_service.print_weigh_slip(slip_data)
            
            if success:
                return Response({
                    'status': 'printed',
                    'message': 'Slip printed successfully'
                })
            else:
                return Response({
                    'status': 'failed',
                    'error': 'Printing failed'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            return Response({
                'error': str(e),
                'status': 'error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def available_ports(self, request):
        """
        List available serial ports
        GET /api/devices/available_ports/
        """
        try:
            ports = WeightIndicatorService.list_available_ports()
            return Response({
                'ports': ports,
                'count': len(ports)
            })
        except Exception as e:
            return Response({
                'error': str(e),
                'status': 'error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def health_check(self, request, code=None):
        """
        Check device health status
        GET /api/devices/{code}/health_check/
        """
        try:
            device = self.get_object()
            
            return Response({
                'device_code': code,
                'status': device.status,
                'current_weight': device.current_weight,
                'last_sync': device.last_sync_at,
                'uptime_hours': device.uptime_hours,
                'error_count': device.error_count,
                'last_error': device.last_error,
                'calibration_due': device.calibration_due,
            })
            
        except Exception as e:
            return Response({
                'error': str(e),
                'status': 'error'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def perform_create(self, serializer):
        user = self.request.user
        role = (getattr(user, "role", "") or "").strip()
        bid = current_branch_id(self.request, user=user)

        if role == "Admin":
            if not bid:
                raise PermissionDenied("Branch not selected. Send X-Branch-Id.")
        else:
            if not bid:
                raise PermissionDenied("User branch is not set.")

        from django.utils import timezone
        serializer.save(
            branch_id=bid,
            last_sync_at=timezone.now(),
        )
