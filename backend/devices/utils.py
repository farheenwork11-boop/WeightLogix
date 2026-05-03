# devices/utils.py
import uuid
from api.utils import current_branch_id


def generate_device_code():
    # simple unique code
    return "DEV-" + uuid.uuid4().hex[:8].upper()


__all__ = ["current_branch_id", "generate_device_code"]
