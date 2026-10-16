from rest_framework import serializers
from .models import Skill, SkillCategory


class SkillCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = SkillCategory
        fields = ["id", "name"]


class SkillSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source="category.name", read_only=True
    )

    class Meta:
        model = Skill
        fields = ["id", "name", "category", "category_name"]