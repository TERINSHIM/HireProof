
import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.hashers import make_password, check_password
from django.core.mail import send_mail
from django.utils import timezone

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User, EmailOTP
from .serializers import RegisterSerializer, LoginSerializer
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError



def send_otp(user, purpose="email_verification"):
    otp = str(secrets.randbelow(900000) + 100000)

    EmailOTP.objects.filter(
        user=user,
        purpose=purpose
    ).delete()

    EmailOTP.objects.create(
        user=user,
        purpose=purpose,
        otp_hash=make_password(otp),
        expires_at=timezone.now() + timedelta(minutes=10),
    )

    subject = (
        "Reset your HireProof password"
        if purpose == "password_reset"
        else "Verify your HireProof account"
    )

    send_mail(
        subject=subject,
        message=f"Your OTP is {otp}. It expires in 10 minutes.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            send_otp(user)

            return Response(
                {
                    "message": "Registration successful. Check your email for the verification code.",
                    "user": RegisterSerializer(user).data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        otp = str(request.data.get("otp", "")).strip()

        if not email or not otp:
            return Response(
                {"error": "Email and OTP are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(email__iexact=email).first()

        if not user:
            return Response(
                {"error": "Invalid email or OTP."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.is_email_verified:
            return Response(
                {"message": "Email is already verified."},
                status=status.HTTP_200_OK,
            )

        otp_record = EmailOTP.objects.filter(
            user=user,
            purpose="email_verification"
        ).first()

        if not otp_record:
            return Response(
                {"error": "No verification code found. Request a new one."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if timezone.now() > otp_record.expires_at:
            return Response(
                {"error": "OTP expired. Request a new one."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not check_password(otp, otp_record.otp_hash):
            return Response(
                {"error": "Invalid OTP."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_email_verified = True
        user.save(update_fields=["is_email_verified"])
        otp_record.delete()

        return Response(
            {"message": "Email verified successfully."},
            status=status.HTTP_200_OK,
        )


class ResendVerificationOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")

        if not email:
            return Response(
                {"error": "Email is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.filter(email__iexact=email).first()

        if not user or user.is_email_verified:
            return Response(
                {"error": "No unverified account found for this email."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        send_otp(user)

        return Response(
            {"message": "A new verification code has been sent."},
            status=status.HTTP_200_OK,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        return Response(
            serializer.validated_data,
            status=status.HTTP_200_OK,
        )

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response({
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "is_email_verified": user.is_email_verified,
        })

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")

        if not email:
            return Response(
                {"error": "Email is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.filter(email__iexact=email).first()

        if user and user.is_active:
            send_otp(user, "password_reset")

        return Response({
            "message": "If an account exists, a reset code has been sent."
        })


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        otp = str(request.data.get("otp", "")).strip()
        new_password = request.data.get("new_password")

        if not email or not otp or not new_password:
            return Response(
                {"error": "Email, OTP and new password are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User.objects.filter(email__iexact=email).first()

        if not user:
            return Response(
                {"error": "Invalid or expired reset code."},
                status=status.HTTP_400_BAD_REQUEST
            )

        otp_record = EmailOTP.objects.filter(
            user=user,
            purpose="password_reset"
        ).first()

        if (
            not otp_record
            or timezone.now() > otp_record.expires_at
            or not check_password(otp, otp_record.otp_hash)
        ):
            return Response(
                {"error": "Invalid or expired reset code."},
                status=status.HTTP_400_BAD_REQUEST
            )

     
        try:
            validate_password(new_password, user)
        except ValidationError as error:
            return Response(
                {"new_password": error.messages},
                status=status.HTTP_400_BAD_REQUEST
            )


        user.set_password(new_password)
        user.save(update_fields=["password"])
        otp_record.delete()

        return Response({
            "message": "Password reset successfully."
        })