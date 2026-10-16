
import uuid

from django.conf import settings
from django.db import models
from apps.skills.models import Skill


class CandidateProfile(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="candidate_profile"
    )

    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=200, blank=True)
    headline = models.CharField(max_length=200, blank=True)
    bio = models.TextField(blank=True)

    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    resume = models.FileField(
        upload_to="candidate_resumes/",
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - Candidate Profile"


class CandidatePreference(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    candidate = models.OneToOneField(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name="preferences"
    )

    target_role = models.CharField(max_length=200, blank=True)
    preferred_location = models.CharField(max_length=200, blank=True)

    work_mode = models.CharField(
        max_length=20,
        choices=[
            ("remote", "Remote"),
            ("hybrid", "Hybrid"),
            ("onsite", "On-site"),
        ],
        blank=True
    )

    employment_type = models.CharField(
        max_length=20,
        choices=[
            ("full_time", "Full-time"),
            ("part_time", "Part-time"),
            ("contract", "Contract"),
            ("internship", "Internship"),
        ],
        blank=True
    )

    expected_salary = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.candidate.user.email} - Preferences"


class Education(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    candidate = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name="educations"
    )

    institution = models.CharField(max_length=255)
    degree = models.CharField(max_length=200)
    field_of_study = models.CharField(max_length=200, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.degree} - {self.institution}"


class Experience(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    candidate = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name="experiences"
    )

    job_title = models.CharField(max_length=200)
    company_name = models.CharField(max_length=255)
    employment_type = models.CharField(max_length=50, blank=True)
    location = models.CharField(max_length=200, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.job_title} - {self.company_name}"

# ----------


class CandidateSkill(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.ForeignKey(
        CandidateProfile, on_delete=models.CASCADE, related_name="skills"
    )
    skill = models.ForeignKey(Skill, on_delete=models.PROTECT)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["candidate", "skill"],
                name="unique_candidate_skill"
            )
        ]


class Project(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate = models.ForeignKey(
        CandidateProfile, on_delete=models.CASCADE, related_name="projects"
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    project_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class ProjectSkill(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="project_skills"
    )
    candidate_skill = models.ForeignKey(
        CandidateSkill, on_delete=models.CASCADE
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["project", "candidate_skill"],
                name="unique_project_candidate_skill"
            )
        ]


class SkillEvidence(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    candidate_skill = models.ForeignKey(
        CandidateSkill, on_delete=models.CASCADE, related_name="evidences"
    )
    project = models.ForeignKey(
        Project, on_delete=models.SET_NULL, null=True, blank=True
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    evidence_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)