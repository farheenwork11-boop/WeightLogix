from rest_framework import serializers


# -------------------------
# Dashboard
# -------------------------
class WeightTrendPointSerializer(serializers.Serializer):
    date = serializers.DateField()
    total_weight = serializers.FloatField()


class TopCustomerSerializer(serializers.Serializer):
    customer_id = serializers.IntegerField(allow_null=True, required=False)
    name = serializers.CharField()
    slips = serializers.IntegerField()
    total_weight = serializers.FloatField()


class DashboardSerializer(serializers.Serializer):
    total_weight = serializers.FloatField()
    total_slips = serializers.IntegerField()
    revenue_est = serializers.FloatField()
    weight_trend_last_7_days = WeightTrendPointSerializer(many=True)
    top_customers = TopCustomerSerializer(many=True)


# -------------------------
# Daily Summary
# -------------------------
class DailyTransactionSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    serial_no = serializers.IntegerField()
    time = serializers.CharField()
    customer = serializers.CharField()
    vehicle = serializers.CharField(allow_blank=True)
    material = serializers.CharField(allow_blank=True)
    net_weight = serializers.FloatField()
    status = serializers.CharField()


class DailySummarySerializer(serializers.Serializer):
    date = serializers.DateField()
    total_slips = serializers.IntegerField()
    total_weight = serializers.FloatField()
    avg_weight_per_slip = serializers.FloatField()
    active_hours = serializers.FloatField()
    transactions = DailyTransactionSerializer(many=True)


# -------------------------
# Customer Report
# -------------------------
class CustomerReportRowSerializer(serializers.Serializer):
    customer_id = serializers.IntegerField(allow_null=True, required=False)
    customer_name = serializers.CharField()
    total_slips = serializers.IntegerField()
    total_weight = serializers.FloatField()
    last_active = serializers.DateTimeField(allow_null=True)


# -------------------------
# Vehicle Report
# -------------------------
class VehicleReportRowSerializer(serializers.Serializer):
    vehicle_id = serializers.IntegerField(allow_null=True, required=False)
    reg = serializers.CharField(allow_blank=True)
    vehicle_type = serializers.CharField(allow_blank=True, required=False)
    trips = serializers.IntegerField()
    avg_weight = serializers.FloatField()
    total_weight = serializers.FloatField()
    last_visit = serializers.DateTimeField(allow_null=True)


# -------------------------
# Product Summary
# -------------------------
class ProductSummaryRowSerializer(serializers.Serializer):
    material_id = serializers.IntegerField(allow_null=True, required=False)
    material_name = serializers.CharField(allow_blank=True)
    slips = serializers.IntegerField()
    total_weight = serializers.FloatField()
    percentage = serializers.FloatField()


# -------------------------
# Financial Report
# -------------------------
class FinancialTransactionSerializer(serializers.Serializer):
    date = serializers.DateTimeField()
    description = serializers.CharField()
    customer = serializers.CharField()
    method = serializers.CharField()   # Cash/Credit
    amount = serializers.FloatField()
    paid = serializers.CharField()     # Yes/No


class FinancialSummarySerializer(serializers.Serializer):
    total_revenue = serializers.FloatField()
    avg_ticket = serializers.FloatField()
    outstanding = serializers.FloatField()
    recent_transactions = FinancialTransactionSerializer(many=True)
