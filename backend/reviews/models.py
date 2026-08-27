from decimal import Decimal
from typing import ClassVar

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class Drawing(models.Model):
    class Status(models.TextChoices):
        NOT_STARTED = "NOT_STARTED", "Not started"
        IN_REVIEW = "IN_REVIEW", "In review"
        COMPLETED = "COMPLETED", "Completed"

    title = models.CharField(max_length=200)
    image = models.CharField(max_length=500)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.NOT_STARTED,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering: ClassVar[list[str]] = ["-created_at"]

    def __str__(self):
        return self.title


class ReviewComment(models.Model):
    class Status(models.TextChoices):
        OPEN = "OPEN", "Open"
        RESOLVED = "RESOLVED", "Resolved"

    drawing = models.ForeignKey(
        Drawing,
        on_delete=models.CASCADE,
        related_name="comments",
    )
    marker_number = models.PositiveIntegerField()
    title = models.CharField(max_length=200)
    description = models.TextField()
    x_position = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal("0.00")),
            MaxValueValidator(Decimal("100.00")),
        ],
    )
    y_position = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[
            MinValueValidator(Decimal("0.00")),
            MaxValueValidator(Decimal("100.00")),
        ],
    )
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.OPEN,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering: ClassVar[list[str]] = ["marker_number"]
        constraints: ClassVar[list[models.BaseConstraint]] = [
            models.UniqueConstraint(
                fields=["drawing", "marker_number"],
                name="unique_marker_number_per_drawing",
            ),
            models.CheckConstraint(
                condition=models.Q(x_position__gte=0, x_position__lte=100),
                name="x_position_between_0_and_100",
            ),
            models.CheckConstraint(
                condition=models.Q(y_position__gte=0, y_position__lte=100),
                name="y_position_between_0_and_100",
            ),
        ]

    def __str__(self):
        return f"Marker {self.marker_number}: {self.title}"
