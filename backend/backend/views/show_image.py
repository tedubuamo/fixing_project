from rest_framework.response import Response
from django.conf import settings
from django.http import FileResponse
import os

def get_image(request):
        image_path = os.path.join(settings.BASE_DIR, 'images', 'upload', 'image.png')
        if os.path.exists(image_path):
            return FileResponse(open(image_path, 'rb'), content_type='image/png')
        return Response({'error': 'Image not found'}, status=404)
