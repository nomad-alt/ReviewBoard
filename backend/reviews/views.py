from django.db import transaction
from django.db.models import Count, Max, Q
from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Drawing, ReviewComment
from .serializers import DrawingSerializer, ReviewCommentSerializer


@api_view(["GET"])
def health_check(request):
    return Response({"status": "ok"})


def drawings_with_open_comment_count():
    return Drawing.objects.annotate(
        open_comment_count=Count(
            "comments",
            filter=Q(comments__status=ReviewComment.Status.OPEN),
        )
    )


class DrawingListView(generics.ListAPIView):
    serializer_class = DrawingSerializer
    queryset = drawings_with_open_comment_count()


class DrawingDetailView(generics.RetrieveAPIView):
    serializer_class = DrawingSerializer
    queryset = drawings_with_open_comment_count()


class DrawingCommentListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewCommentSerializer

    def get_drawing(self):
        if not hasattr(self, "drawing"):
            self.drawing = get_object_or_404(Drawing, pk=self.kwargs["drawing_pk"])
        return self.drawing

    def get_queryset(self):
        return ReviewComment.objects.filter(drawing=self.get_drawing())

    def perform_create(self, serializer):
        with transaction.atomic():
            drawing = Drawing.objects.select_for_update().get(
                pk=self.get_drawing().pk
            )
            current_max = ReviewComment.objects.filter(drawing=drawing).aggregate(
                highest_marker=Max("marker_number")
            )["highest_marker"]
            serializer.save(
                drawing=drawing,
                marker_number=(current_max or 0) + 1,
            )


class ReviewCommentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReviewCommentSerializer
    queryset = ReviewComment.objects.all()
