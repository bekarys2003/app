from django.shortcuts import render
from rest_framework import status
from rest_framework import status
from .serializers import JobSerializer
from .models import Jobs
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accaunts.authentication import JWTAuthentication

class JobAdd(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request):
        data = request.data.copy()

        data['user'] = request.user.id

        serializer = JobSerializer(data=data)
        if serializer.is_valid():
            serializer.save(user=request.user)

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class JobList(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        jobs = Jobs.objects.filter(user=request.user).order_by('-created_at')
        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)