from django.urls import path
from .views import SkillListView, SkillCategoryListView

urlpatterns = [
    path("skills/", SkillListView.as_view(), name="skills"),
    path("skill-categories/", SkillCategoryListView.as_view(), name="skill-categories"),
]