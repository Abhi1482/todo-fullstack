# Backend — Django Files (MongoDB Atlas ready)

# File: backend/todos/views.py
from pydoc import doc
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from .models import Todo, Recurrence
from .serializers import TodoSerializer
from .nlp import parse_quick_add

from bson import ObjectId
from datetime import datetime


def todo_to_dict(doc):
    d = doc.to_mongo().to_dict()
    _id = d.pop('_id', None)
    if _id is not None:
        d['id'] = str(_id)
    if 'user_id' in d:
        d['user_id'] = str(d['user_id'])
    return d


def get_todo_or_404(pk, user):
    try:
        return Todo.objects.get(id=ObjectId(pk), user_id=str(user.id))
    except Exception:
        return None


class TodoViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        docs = Todo.objects(user_id=str(request.user.id)).order_by('-created_at')
        items = [todo_to_dict(d) for d in docs]
        return Response(items)

    def retrieve(self, request, pk=None):
        doc = get_todo_or_404(pk, request.user)
        if not doc:
            return Response({'detail': 'Not found'}, status=404)
        return Response(todo_to_dict(doc))

    def create(self, request):
        serializer = TodoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        val = serializer.validated_data
        rec = None
        if val.get('recurrence'):
            rec = Recurrence(**val['recurrence']) if val['recurrence'] else None
        doc = Todo(
    user_id=str(request.user.id),
    title=val['title'],
    notes=val.get('notes', ''),
    due=val.get('due', None),
    tags=val.get('tags', []),
    is_completed=val.get('is_completed', False),
    recurrence=rec,
    exceptions=val.get('exceptions', []),
    status=val.get('status', 'new'),
).save()

        return Response(todo_to_dict(doc), status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk=None):
        doc = get_todo_or_404(pk, request.user)
        if not doc:
            return Response({'detail': 'Not found'}, status=404)
        serializer = TodoSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        val = serializer.validated_data
        for k, v in val.items():
            if k == "recurrence":
                doc.recurrence = Recurrence(**v) if v else None
            elif k == "status":
                # Update both status and completion flag
                doc.status = v
                if v == "completed":
                    doc.is_completed = True
                elif v in ["new", "scheduled", "in_progress"]:
                    doc.is_completed = False
            else:
                setattr(doc, k, v)

        doc.save()

        return Response(todo_to_dict(doc))

    def destroy(self, request, pk=None):
        doc = get_todo_or_404(pk, request.user)
        if not doc:
            return Response({'detail': 'Not found'}, status=404)
        doc.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['post'], url_path='quick-add')
    def quick_add(self, request):
        text = request.data.get('text', '')
        parsed = parse_quick_add(text)
        rec = Recurrence(rrule=parsed['rrule']) if parsed.get('rrule') else None
        doc = Todo(
            user_id=str(request.user.id),
            title=parsed.get('title', text),
            tags=parsed.get('tags', []),
            due=parsed.get('due', None),
            recurrence=rec,
        ).save()
        return Response(todo_to_dict(doc), status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='suggest')
    def suggest(self, request):
        text = request.data.get('text', '')
        parsed = parse_quick_add(text)
        return Response({
            'suggested_due': parsed.get('due'),
            'suggested_tags': parsed.get('tags'),
            'rrule': parsed.get('rrule')
        })

    @action(detail=True, methods=['post'], url_path='skip-occurrence')
    def skip_occurrence(self, request, pk=None):
        doc = get_todo_or_404(pk, request.user)
        if not doc:
            return Response({'detail': 'Not found'}, status=404)
        dt_str = request.data.get('datetime')
        if not dt_str:
            return Response({'detail': 'datetime required'}, status=400)
        try:
            dt = datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
        except Exception:
            return Response({'detail': 'Invalid datetime format, use ISO'}, status=400)
        doc.exceptions = doc.exceptions or []
        doc.exceptions.append(dt)
        doc.save()
        return Response(todo_to_dict(doc))
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user_view(request):
    """
    Requires an Authorization: Bearer <access_token> header.
    """
    return Response({
        'username': request.user.username,
        'email': request.user.email
    })

@api_view(['post'])
@permission_classes([AllowAny])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')
    if not username or not password:
        return Response({'detail':'username & password required'}, status=400)
    if User.objects.filter(username=username).exists():
        return Response({'detail':'username already exists'}, status=400)
    try:
        validate_password(password)
    except ValidationError as e:
        return Response({'detail': e.messages}, status=400)
    user = User.objects.create_user(username=username, password=password)
    return Response({'id': user.id, 'username': user.username}, status=201)



