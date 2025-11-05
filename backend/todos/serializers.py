from rest_framework import serializers


class RecurrenceSerializer(serializers.Serializer):
    rrule = serializers.CharField(allow_blank=True, required=False)
    timezone = serializers.CharField(allow_blank=True, required=False)


class TodoSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    user_id = serializers.CharField(read_only=True)
    title = serializers.CharField()
    notes = serializers.CharField(allow_blank=True, required=False)
    due = serializers.DateTimeField(allow_null=True, required=False)
    tags = serializers.ListField(child=serializers.CharField(), required=False)
    is_completed = serializers.BooleanField(required=False)
    recurrence = RecurrenceSerializer(required=False, allow_null=True)
    exceptions = serializers.ListField(child=serializers.DateTimeField(), required=False)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)


    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError('Title must not be empty.')
        return value