import uuid
from django.db import models


class SkillCategory(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Skill(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(
        SkillCategory, on_delete=models.PROTECT, related_name="skills"
    )
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name