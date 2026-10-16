from rest_framework import serializers

from .models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken



class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    class Meta:
        model = User

        fields = [
            'id',
            'name',
            'email',
            'password',
            'role',
        ]

        read_only_fields = ['id']

    def validate_role(self, value):
        if value not in [
            User.Role.CANDIDATE,
            User.Role.EMPLOYER
        ]:
            raise serializers.ValidationError(
                "You can only register as candidate or employer."
            )

        return value

    def create(self, validated_data):
        return User.objects.create_user(
            name=validated_data['name'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data['role']
        )

class LoginSerializer(serializers.Serializer):

    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True
    )

    def validate(self, data):

        email = data.get('email')
        password = data.get('password')

        user = authenticate(
            email=email,
            password=password
        )

        if not user:
            raise serializers.ValidationError(
                "Invalid email or password."
            )
        
        if not user.is_active:
            raise serializers.ValidationError(
                "This account is inactive."
            )
        if not user.is_email_verified:
            raise serializers.ValidationError(
                "Please verify your email before logging in."
            )
        

        refresh = RefreshToken.for_user(user)

        return {
            "user": {
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "role": user.role,
            },
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }