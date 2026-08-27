import json
from io import StringIO

from django.core.management import call_command
from django.test import SimpleTestCase, TestCase
from django.urls import reverse

from .models import Drawing, ReviewComment


class HealthCheckTests(SimpleTestCase):
    def test_health_check_returns_ok(self):
        response = self.client.get(reverse("health-check"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"status": "ok"})


class DrawingApiTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.drawing = Drawing.objects.create(
            title="Assembly Drawing",
            image="/demo-drawings/assembly.svg",
            status=Drawing.Status.IN_REVIEW,
        )
        ReviewComment.objects.create(
            drawing=cls.drawing,
            marker_number=1,
            title="Open issue",
            description="This still needs review.",
            x_position="25.00",
            y_position="40.00",
        )
        ReviewComment.objects.create(
            drawing=cls.drawing,
            marker_number=2,
            title="Resolved issue",
            description="This was checked.",
            x_position="50.00",
            y_position="60.00",
            status=ReviewComment.Status.RESOLVED,
        )

    def test_list_drawings_includes_open_comment_count(self):
        response = self.client.get(reverse("drawing-list"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
        self.assertEqual(response.json()[0]["open_comment_count"], 1)

    def test_retrieve_drawing(self):
        response = self.client.get(
            reverse("drawing-detail", kwargs={"pk": self.drawing.pk})
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["title"], "Assembly Drawing")
        self.assertEqual(response.json()["open_comment_count"], 1)


class ReviewCommentApiTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.drawing = Drawing.objects.create(
            title="Assembly Drawing",
            image="/demo-drawings/assembly.svg",
        )
        cls.other_drawing = Drawing.objects.create(
            title="Other Drawing",
            image="/demo-drawings/other.svg",
        )
        cls.comment = ReviewComment.objects.create(
            drawing=cls.drawing,
            marker_number=1,
            title="Existing comment",
            description="Existing description.",
            x_position="20.00",
            y_position="30.00",
        )
        ReviewComment.objects.create(
            drawing=cls.other_drawing,
            marker_number=1,
            title="Other drawing comment",
            description="Should not appear in the first drawing's list.",
            x_position="40.00",
            y_position="50.00",
        )

    def comment_list_url(self):
        return reverse(
            "drawing-comment-list",
            kwargs={"drawing_pk": self.drawing.pk},
        )

    def test_list_comments_only_returns_comments_for_requested_drawing(self):
        response = self.client.get(self.comment_list_url())

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
        self.assertEqual(response.json()[0]["id"], self.comment.pk)

    def test_create_comment_assigns_next_marker_number_and_open_status(self):
        response = self.client.post(
            self.comment_list_url(),
            data={
                "title": "New comment",
                "description": "A newly identified issue.",
                "x_position": 62.45,
                "y_position": 31.8,
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["drawing"], self.drawing.pk)
        self.assertEqual(response.json()["marker_number"], 2)
        self.assertEqual(response.json()["status"], ReviewComment.Status.OPEN)
        self.assertEqual(response.json()["x_position"], 62.45)

    def test_create_comment_rejects_coordinates_outside_drawing(self):
        response = self.client.post(
            self.comment_list_url(),
            data={
                "title": "Invalid marker",
                "description": "Coordinates are outside the drawing.",
                "x_position": -0.01,
                "y_position": 100.01,
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("x_position", response.json())
        self.assertIn("y_position", response.json())

    def test_create_comment_requires_title_and_description(self):
        response = self.client.post(
            self.comment_list_url(),
            data={
                "title": "",
                "description": "",
                "x_position": 10,
                "y_position": 20,
            },
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("title", response.json())
        self.assertIn("description", response.json())

    def test_update_comment_status(self):
        response = self.client.patch(
            reverse("review-comment-detail", kwargs={"pk": self.comment.pk}),
            data=json.dumps({"status": ReviewComment.Status.RESOLVED}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], ReviewComment.Status.RESOLVED)
        self.comment.refresh_from_db()
        self.assertEqual(self.comment.status, ReviewComment.Status.RESOLVED)

    def test_update_comment_rejects_unknown_status(self):
        response = self.client.patch(
            reverse("review-comment-detail", kwargs={"pk": self.comment.pk}),
            data=json.dumps({"status": "PENDING"}),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("status", response.json())

    def test_delete_comment(self):
        response = self.client.delete(
            reverse("review-comment-detail", kwargs={"pk": self.comment.pk})
        )

        self.assertEqual(response.status_code, 204)
        self.assertFalse(ReviewComment.objects.filter(pk=self.comment.pk).exists())


class SeedDemoDataTests(TestCase):
    def test_seed_command_is_repeatable(self):
        output = StringIO()

        call_command("seed_demo_data", stdout=output)
        call_command("seed_demo_data", stdout=output)

        self.assertEqual(Drawing.objects.count(), 3)
        self.assertEqual(ReviewComment.objects.count(), 4)
        self.assertIn("Demo data ready: 3 drawings and 4 comments.", output.getvalue())
