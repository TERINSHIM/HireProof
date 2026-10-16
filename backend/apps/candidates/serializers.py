
from rest_framework import serializers
from .models import CandidateSkill, Project, ProjectSkill, SkillEvidence
from apps.skills.models import Skill

from .models import (
    CandidateProfile,
    CandidatePreference,
    Education,
    Experience,
)


class CandidateProfileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="user.name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = CandidateProfile
        fields = [
            "id", "name", "email", "phone", "location",
            "headline", "bio", "github_url", "linkedin_url",
            "portfolio_url", "resume", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_resume(self, file):
        if file is None:
            return file

        if not file.name.lower().endswith(".pdf"):
            raise serializers.ValidationError("Resume must be a PDF file.")

        if file.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Maximum resume size is 5 MB.")

        # For production, also validate file content and scan uploads.
        return file


class CandidatePreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = CandidatePreference
        fields = [
            "id", "target_role", "preferred_location",
            "work_mode", "employment_type", "expected_salary"
        ]
        read_only_fields = ["id"]


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = [
            "id", "institution", "degree", "field_of_study",
            "start_date", "end_date", "description"
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        start = attrs.get(
            "start_date",
            getattr(self.instance, "start_date", None)
        )
        end = attrs.get(
            "end_date",
            getattr(self.instance, "end_date", None)
        )

        if end and start and end < start:
            raise serializers.ValidationError(
                {"end_date": "End date cannot be before start date."}
            )
        return attrs


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = [
            "id", "job_title", "company_name", "employment_type",
            "location", "start_date", "end_date", "description"
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        start = attrs.get(
            "start_date",
            getattr(self.instance, "start_date", None)
        )
        end = attrs.get(
            "end_date",
            getattr(self.instance, "end_date", None)
        )

        if end and start and end < start:
            raise serializers.ValidationError(
                {"end_date": "End date cannot be before start date."}
            )
        return attrs


# -------------------


class CandidateSkillSerializer(serializers.ModelSerializer):
    skill = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all()
    )
    skill_name = serializers.CharField(source="skill.name", read_only=True)

    class Meta:
        model = CandidateSkill
        fields = ["id", "skill", "skill_name"]
        read_only_fields = ["id"]

    def validate_skill(self, value):
        candidate = CandidateProfile.objects.filter(
            user=self.context["request"].user
        ).first()

        if candidate and CandidateSkill.objects.filter(
            candidate=candidate, skill=value
        ).exclude(pk=getattr(self.instance, "pk", None)).exists():
            raise serializers.ValidationError("Skill already added.")
        return value


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            "id", "title", "description",
            "project_url", "github_url", "created_at"
        ]
        read_only_fields = ["id", "created_at"]


class ProjectSkillSerializer(serializers.ModelSerializer):
    candidate_skill = serializers.PrimaryKeyRelatedField(
        queryset=CandidateSkill.objects.none()
    )

    class Meta:
        model = ProjectSkill
        fields = ["id", "candidate_skill"]
        read_only_fields = ["id"]

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            fields["candidate_skill"].queryset = CandidateSkill.objects.filter(
                candidate__user=request.user
            )
        return fields

    def validate(self, attrs):
        project = self.context["project"]
        candidate_skill = attrs.get(
            "candidate_skill",
            getattr(self.instance, "candidate_skill", None)
        )

        if candidate_skill and ProjectSkill.objects.filter(
            project=project, candidate_skill=candidate_skill
        ).exclude(pk=getattr(self.instance, "pk", None)).exists():
            raise serializers.ValidationError("Skill already tagged.")

        return attrs


class SkillEvidenceSerializer(serializers.ModelSerializer):
    project = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.none(),
        required=False,
        allow_null=True
    )

    class Meta:
        model = SkillEvidence
        fields = [
            "id", "project", "title",
            "description", "evidence_url", "created_at"
        ]
        read_only_fields = ["id", "created_at"]

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            fields["project"].queryset = Project.objects.filter(
                candidate__user=request.user
            )
        return fields