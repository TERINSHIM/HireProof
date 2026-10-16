
from rest_framework import generics
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError

from .models import CandidateSkill, Project, ProjectSkill, SkillEvidence

from apps.accounts.permissions import IsCandidate

from .models import (
    CandidateProfile,
    CandidatePreference,
    Education,
    Experience,
)
from .serializers import (
    CandidateProfileSerializer,
    CandidatePreferenceSerializer,
    EducationSerializer,
    ExperienceSerializer,
)
from .serializers import (
    CandidateSkillSerializer,
    ProjectSerializer,
    ProjectSkillSerializer,
    SkillEvidenceSerializer,
)


class CandidateMixin:
    permission_classes = [IsAuthenticated, IsCandidate]

    def get_profile(self):
        profile, _ = CandidateProfile.objects.get_or_create(
            user=self.request.user
        )
        return profile


class CandidateProfileView(CandidateMixin, generics.RetrieveUpdateAPIView):
    serializer_class = CandidateProfileSerializer
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_object(self):
        return self.get_profile()


class CandidatePreferenceView(CandidateMixin, generics.RetrieveUpdateAPIView):
    serializer_class = CandidatePreferenceSerializer

    def get_object(self):
        preference, _ = CandidatePreference.objects.get_or_create(
            candidate=self.get_profile()
        )
        return preference


class EducationListCreateView(CandidateMixin, generics.ListCreateAPIView):
    serializer_class = EducationSerializer

    def get_queryset(self):
        return Education.objects.filter(
            candidate__user=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(candidate=self.get_profile())


class EducationDetailView(CandidateMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EducationSerializer
    lookup_field = "id"

    def get_queryset(self):
        return Education.objects.filter(
            candidate__user=self.request.user
        )


class ExperienceListCreateView(CandidateMixin, generics.ListCreateAPIView):
    serializer_class = ExperienceSerializer

    def get_queryset(self):
        return Experience.objects.filter(
            candidate__user=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(candidate=self.get_profile())


class ExperienceDetailView(CandidateMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ExperienceSerializer
    lookup_field = "id"

    def get_queryset(self):
        return Experience.objects.filter(
            candidate__user=self.request.user
        )



class CandidateSkillListView(CandidateMixin, generics.ListCreateAPIView):
    serializer_class = CandidateSkillSerializer

    def get_queryset(self):
        return CandidateSkill.objects.filter(
            candidate__user=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(candidate=self.get_profile())


class CandidateSkillDetailView(
    CandidateMixin, generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = CandidateSkillSerializer
    lookup_field = "id"

    def get_queryset(self):
        return CandidateSkill.objects.filter(
            candidate__user=self.request.user
        )


class ProjectListView(CandidateMixin, generics.ListCreateAPIView):
    serializer_class = ProjectSerializer

    def get_queryset(self):
        return Project.objects.filter(candidate__user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(candidate=self.get_profile())


class ProjectDetailView(
    CandidateMixin, generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = ProjectSerializer
    lookup_field = "id"

    def get_queryset(self):
        return Project.objects.filter(candidate__user=self.request.user)


class ProjectSkillListView(CandidateMixin, generics.ListCreateAPIView):
    serializer_class = ProjectSkillSerializer

    def get_project(self):
        from django.shortcuts import get_object_or_404
        return get_object_or_404(
            Project,
            id=self.kwargs["project_id"],
            candidate__user=self.request.user
        )

    def get_queryset(self):
        return ProjectSkill.objects.filter(project=self.get_project())

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["project"] = self.get_project()
        return context

    def perform_create(self, serializer):
        serializer.save(project=self.get_project())


class ProjectSkillDetailView(
    CandidateMixin, generics.DestroyAPIView
):
    serializer_class = ProjectSkillSerializer
    lookup_field = "id"

    def get_queryset(self):
        return ProjectSkill.objects.filter(
            project__candidate__user=self.request.user
        )


class SkillEvidenceListView(CandidateMixin, generics.ListCreateAPIView):
    serializer_class = SkillEvidenceSerializer

    def get_skill(self):
        from django.shortcuts import get_object_or_404
        return get_object_or_404(
            CandidateSkill,
            id=self.kwargs["skill_id"],
            candidate__user=self.request.user
        )

    def get_queryset(self):
        return SkillEvidence.objects.filter(candidate_skill=self.get_skill())

    def perform_create(self, serializer):
        serializer.save(candidate_skill=self.get_skill())


class SkillEvidenceDetailView(
    CandidateMixin, generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = SkillEvidenceSerializer
    lookup_field = "id"

    def get_queryset(self):
        return SkillEvidence.objects.filter(
            candidate_skill__candidate__user=self.request.user
        )