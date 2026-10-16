from rest_framework.permissions import BasePermission


class IsCandidate(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.is_active
            and request.user.is_email_verified
            and request.user.role == "candidate"
        )


class IsEmployer(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.is_active
            and request.user.is_email_verified
            and request.user.role == "employer"
        )


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.is_active
            and request.user.is_staff
            and request.user.role == "admin"
        )