# slips/utils.py
def current_branch_id(request, user=None):
    """
    Resolve branch id from:
    1) Header: X-Branch-Id
    2) Query:  branch_id
    3) user.branch_id fallback
    """
    # header
    h = request.headers.get("X-Branch-Id") or request.META.get("HTTP_X_BRANCH_ID")
    if h:
        try:
            v = int(h)
            if v > 0:
                return v
        except Exception:
            pass

    # query
    q = request.query_params.get("branch_id") if hasattr(request, "query_params") else request.GET.get("branch_id")
    if q:
        try:
            v = int(q)
            if v > 0:
                return v
        except Exception:
            pass

    # fallback to user
    if user is not None:
        ub = getattr(user, "branch_id", None)
        if ub:
            return int(ub)

    return None
