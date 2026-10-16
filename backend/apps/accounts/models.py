import uuid
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)

        user = self.model(
            email=email,
            **extra_fields
        )

        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("role", User.Role.ADMIN)

        return self.create_user(
            email=email,
            password=password,
            **extra_fields
        )


class User(AbstractUser):

    class Role(models.TextChoices):
        CANDIDATE = "candidate", "Candidate"
        EMPLOYER = "employer", "Employer"
        ADMIN = "admin", "Admin"

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    username = None

    name = models.CharField(
        max_length=150
    )

    email = models.EmailField(
        unique=True
    )

    role = models.CharField(
        max_length=20,
        choices=Role.choices
    )

    is_email_verified = models.BooleanField(
        default=False
    )

    USERNAME_FIELD = "email"

    REQUIRED_FIELDS = ["name"]

    objects = UserManager()

    def __str__(self):
        return self.email

class EmailOTP(models.Model):

    user = models.ForeignKey(
    User,
    on_delete=models.CASCADE,
    related_name="email_otps",
    )

    otp_hash = models.CharField(
        max_length=128
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    expires_at = models.DateTimeField()
    purpose = models.CharField(
    max_length=20,
    choices=[
        ("email_verification", "Email Verification"),
        ("password_reset", "Password Reset"),
    ],
    default="email_verification",
    )

    def __str__(self):
        return f"OTP for {self.user.email}"
