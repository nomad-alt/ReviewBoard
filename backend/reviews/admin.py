from django.contrib import admin

from .models import Drawing, ReviewComment


@admin.register(Drawing)
class DrawingAdmin(admin.ModelAdmin):
    list_display = ("title", "status", "created_at")
    list_filter = ("status",)
    search_fields = ("title",)


@admin.register(ReviewComment)
class ReviewCommentAdmin(admin.ModelAdmin):
    list_display = ("marker_number", "title", "drawing", "status", "updated_at")
    list_filter = ("status", "drawing")
    search_fields = ("title", "description", "drawing__title")

