from .constants import ROLE_MANAGER, ROLE_OPERATOR


def get_role(user) -> str:
    return getattr(user, "role", None) or ROLE_OPERATOR





def is_manager(user) -> bool:
    return get_role(user) == ROLE_MANAGER


def is_operator(user) -> bool:
    return get_role(user) == ROLE_OPERATOR


def user_branch_id(user):
    return getattr(user, "branch_id", None)


def _read_branch_from_request(request):
    """
    Read branch selection from:
      - header: X-Branch-Id / x-branch-id
      - meta: HTTP_X_BRANCH_ID (django internal)
      - query:  ?branch_id=
    Returns int|None
    """
    hb = (
        request.headers.get("X-Branch-Id")
        or request.headers.get("x-branch-id")
        or request.META.get("HTTP_X_BRANCH_ID")
    )

    if hasattr(request, "query_params"):
        qb = request.query_params.get("branch_id")
    else:
        qb = request.GET.get("branch_id")

    raw = hb or qb
    if not raw:
        return None

    try:
        bid = int(raw)
        return bid if bid > 0 else None
    except Exception:
        return None


def current_branch_id(request, user=None):
    """
    Rules:
      ✅ Manager: can choose any branch using header/query.
         - if not provided => None (means "all")
      ✅ Operator: ALWAYS forced to their own branch_id (ignore header/query)
      ✅ Unauthenticated: returns whatever is provided in header/query (or None)
    """
    selected = _read_branch_from_request(request)

    if user is None:
        user = getattr(request, "user", None)

    if not user or not getattr(user, "is_authenticated", False):
        return selected

    if not is_manager(user):
        ub = user_branch_id(user)
        return int(ub) if ub else None

    return selected


def assert_branch_allowed(user, branch_id: int | None):
    """
    Manager => always ok
    Operator =>
      - must have a branch
      - selected branch must match own branch (if provided)
      - if branch_id is None => treated as own branch scope
    """
    if is_manager(user):
        return

    ub = user_branch_id(user)
    if not ub:
        raise PermissionError("User has no branch assigned.")

    if branch_id is None:
        return

    if int(branch_id) != int(ub):
        raise PermissionError("Branch access denied.")
