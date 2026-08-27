from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from reviews.models import Drawing, ReviewComment


DRAWINGS = [
    {
        "title": "Ground Floor Plan",
        "image": "/demo-drawings/ground-floor-plan.svg",
        "status": Drawing.Status.IN_REVIEW,
        "comments": [
            {
                "marker_number": 1,
                "title": "Confirm door clearance",
                "description": "Verify that the service-room door has the required clear opening.",
                "x_position": Decimal("71.50"),
                "y_position": Decimal("38.00"),
                "status": ReviewComment.Status.OPEN,
            },
            {
                "marker_number": 2,
                "title": "Dimension added",
                "description": "The missing corridor width has been added to the drawing.",
                "x_position": Decimal("43.25"),
                "y_position": Decimal("62.40"),
                "status": ReviewComment.Status.RESOLVED,
            },
        ],
    },
    {
        "title": "Support Bracket Assembly",
        "image": "/demo-drawings/support-bracket.svg",
        "status": Drawing.Status.IN_REVIEW,
        "comments": [
            {
                "marker_number": 1,
                "title": "Check hole diameter",
                "description": "Confirm whether the upper mounting hole should be 12 or 14 mm.",
                "x_position": Decimal("62.00"),
                "y_position": Decimal("28.50"),
                "status": ReviewComment.Status.OPEN,
            },
        ],
    },
    {
        "title": "Drive Shaft Detail",
        "image": "/demo-drawings/drive-shaft.svg",
        "status": Drawing.Status.COMPLETED,
        "comments": [
            {
                "marker_number": 1,
                "title": "Surface finish confirmed",
                "description": "Manufacturing confirmed the specified bearing-seat finish.",
                "x_position": Decimal("34.00"),
                "y_position": Decimal("47.00"),
                "status": ReviewComment.Status.RESOLVED,
            },
        ],
    },
]


class Command(BaseCommand):
    help = "Create or refresh the ReviewBoard demo drawings and comments."

    @transaction.atomic
    def handle(self, *args, **options):
        drawing_count = 0
        comment_count = 0

        for drawing_data in DRAWINGS:
            comments = drawing_data["comments"]
            drawing, _ = Drawing.objects.update_or_create(
                title=drawing_data["title"],
                defaults={
                    "image": drawing_data["image"],
                    "status": drawing_data["status"],
                },
            )
            drawing_count += 1

            for comment_data in comments:
                ReviewComment.objects.update_or_create(
                    drawing=drawing,
                    marker_number=comment_data["marker_number"],
                    defaults={
                        "title": comment_data["title"],
                        "description": comment_data["description"],
                        "x_position": comment_data["x_position"],
                        "y_position": comment_data["y_position"],
                        "status": comment_data["status"],
                    },
                )
                comment_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Demo data ready: {drawing_count} drawings and "
                f"{comment_count} comments."
            )
        )
