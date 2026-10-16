from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Skill, SkillCategory
from .serializers import SkillSerializer, SkillCategorySerializer


class SkillListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SkillSerializer
    queryset = Skill.objects.select_related("category").order_by("name")


class SkillCategoryListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SkillCategorySerializer
    queryset = SkillCategory.objects.order_by("name")
