from mongoengine import Document, StringField, BooleanField, DateTimeField, ListField, EmbeddedDocument, EmbeddedDocumentField
from datetime import datetime


class Recurrence(EmbeddedDocument):
    rrule = StringField(default='')
    timezone = StringField(default='UTC')


class Todo(Document):
    meta = {'collection': 'todos'}


    user_id = StringField(required=True)
    title = StringField(required=True, max_length=280)
    notes = StringField(default='')
    due = DateTimeField(null=True)
    tags = ListField(StringField())
    is_completed = BooleanField(default=False)
    recurrence = EmbeddedDocumentField(Recurrence, null=True)
    exceptions = ListField(DateTimeField())
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)
    
    
    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()
        return super().save(*args, **kwargs)