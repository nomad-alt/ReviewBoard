from decimal import Decimal

from rest_framework import serializers

from .models import Drawing, ReviewComment


class DrawingSerializer(serializers.ModelSerializer):
    open_comment_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Drawing
        fields = (
            "id",
            "title",
            "image",
            "status",
            "open_comment_count",
            "created_at",
        )


class ReviewCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReviewComment
        fields = (
            "id",
            "drawing",
            "marker_number",
            "title",
            "description",
            "x_position",
            "y_position",
            "status",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "drawing",
            "marker_number",
            "created_at",
            "updated_at",
        )

    def validate_x_position(self, value):
        if not Decimal("0.00") <= value <= Decimal("100.00"):
            raise serializers.ValidationError("Must be between 0 and 100.")
        return value

    def validate_y_position(self, value):
        if not Decimal("0.00") <= value <= Decimal("100.00"):
            raise serializers.ValidationError("Must be between 0 and 100.")
        return value

