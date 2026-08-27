from django.urls import path

from .views import (
    DrawingCommentListCreateView,
    DrawingDetailView,
    DrawingListView,
    ReviewCommentDetailView,
    health_check,
)

urlpatterns = [
    path("health/", health_check, name="health-check"),
    path("drawings/", DrawingListView.as_view(), name="drawing-list"),
    path("drawings/<int:pk>/", DrawingDetailView.as_view(), name="drawing-detail"),
    path(
        "drawings/<int:drawing_pk>/comments/",
        DrawingCommentListCreateView.as_view(),
        name="drawing-comment-list",
    ),
    path(
        "comments/<int:pk>/",
        ReviewCommentDetailView.as_view(),
        name="review-comment-detail",
    ),
]
