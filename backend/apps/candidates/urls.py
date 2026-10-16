
from django.urls import path

from .views import (
    CandidateProfileView,
    CandidatePreferenceView,
    EducationListCreateView,
    EducationDetailView,
    ExperienceListCreateView,
    ExperienceDetailView,
    CandidateSkillListView,
    CandidateSkillDetailView,
    ProjectListView, 
    ProjectDetailView,
    ProjectSkillListView, 
    ProjectSkillDetailView,
    SkillEvidenceListView, 
    SkillEvidenceDetailView,
)

urlpatterns = [
    path("profile/", CandidateProfileView.as_view(), name="candidate-profile"),
    path("preferences/", CandidatePreferenceView.as_view(), name="candidate-preferences"),
    path("educations/", EducationListCreateView.as_view(), name="education-list"),
    path("educations/<uuid:id>/", EducationDetailView.as_view(), name="education-detail"),
    path("experiences/", ExperienceListCreateView.as_view(), name="experience-list"),
    path("experiences/<uuid:id>/", ExperienceDetailView.as_view(), name="experience-detail"),
    path("skills/", CandidateSkillListView.as_view()),
    path("skills/<uuid:id>/", CandidateSkillDetailView.as_view()),

    path("projects/", ProjectListView.as_view()),
    path("projects/<uuid:id>/", ProjectDetailView.as_view()),

    path("projects/<uuid:project_id>/skills/", ProjectSkillListView.as_view()),
    path("project-skills/<uuid:id>/", ProjectSkillDetailView.as_view()),

    path("skills/<uuid:skill_id>/evidence/", SkillEvidenceListView.as_view()),
    path("skill-evidence/<uuid:id>/", SkillEvidenceDetailView.as_view()),
]
