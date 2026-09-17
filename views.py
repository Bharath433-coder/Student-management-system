from rest_framework import viewsets, filters
from .models import Student
from .serializers import StudentSerializer


class StudentViewSet(viewsets.ModelViewSet):
    """
    Provides full CRUD for Student records:
    GET    /api/students/          -> list
    POST   /api/students/          -> create
    GET    /api/students/{id}/     -> retrieve
    PUT    /api/students/{id}/     -> full update
    PATCH  /api/students/{id}/     -> partial update
    DELETE /api/students/{id}/     -> delete
    """
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'roll_number', 'department', 'email']
