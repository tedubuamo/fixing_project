import os
import time
from pathlib import Path
from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.utils import timezone
from myapp.models import Report

import time
import logging
from pathlib import Path
from datetime import datetime
from django.conf import settings
from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.utils.dateparse import parse_datetime
from django.utils.timezone import make_aware
import magic

logger = logging.getLogger(__name__)

# Pastikan folder `upload` ada di dalam `MEDIA_ROOT`
UPLOAD_DIR = Path(settings.MEDIA_ROOT) / "upload"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# @csrf_exempt
# def create_report(requestuest):
#     if requestuest.method != 'POST':
#         return JsonResponse({'error': 'Method not allowed'}, status=405)
    
#     try:
#         # Ambil file yang diunggah
#         image_file = requestuest.FILES.get('file')
#         if not image_file:
#             return JsonResponse({'error': 'No image file provided'}, status=400)

#         # Validasi ukuran file (maksimum 1MB)
#         if image_file.size > 1 * 1024 * 1024:
#             return JsonResponse({'error': 'File too large'}, status=400)
            
#         # Validasi tipe file
#         allowed_types = ['.jpg', '.jpeg', '.png', '.pdf']
#         file_ext = Path(image_file.name).suffix.lower()
#         if file_ext not in allowed_types:
#             return JsonResponse({'error': 'Invalid file type'}, status=400)
        
#         # Nama unik untuk file
#         timestamp = int(time.time() * 1000)
#         file_name = f"{timestamp}{file_ext}"
#         file_path = UPLOAD_DIR / file_name

#         # Simpan file ke folder `upload/`
#         with open(file_path, 'wb') as destination:
#             for chunk in image_file.chunks():
#                 destination.write(chunk)

#         # URL gambar yang bisa diakses
#         file_url = f"{settings.MEDIA_URL}upload/{file_name}"

#         # Ambil data dari requestuest
#         user_id = requestuest.POST.get('id_user')
#         poin_id = requestuest.POST.get('id_poin')
#         description = requestuest.POST.get('description')
#         amount_used = requestuest.POST.get('amount_used')
#         report_time = requestuest.POST.get('time')
#         status = requestuest.POST.get('status', 'false').lower() == 'true'

#         # Validasi data yang wajib ada
#         if not all([user_id, poin_id, description, amount_used]):
#             file_path.unlink()  # Hapus file jika data tidak lengkap
#             return JsonResponse({'error': 'Missing requestuired fields'}, status=400)

#         # Konversi waktu jika disediakan, atau gunakan waktu sekarang
#         try:
#             if report_time:
#                 time_obj = datetime.strptime(report_time, "%Y-%m-%d %H:%M:%S%z")
#             else:
#                 time_obj = timezone.now()
#         except ValueError:
#             time_obj = timezone.now()

#         # Simpan ke database
#         try:
#             report = Report.objects.create(
#                 id_user_id=user_id,
#                 id_poin_id=poin_id,
#                 description=description,
#                 amount_used=amount_used,
#                 image_url=file_url,
#                 status=status,
#                 time=time_obj
#             )
#         except Exception as db_error:
#             file_path.unlink()  # Hapus file jika gagal menyimpan ke database
#             return JsonResponse({'error': str(db_error)}, status=500)

#         return JsonResponse({
#             'message': 'Evidence berhasil diupload',
#             'data': {
#                 'id': report.id,
#                 'description': report.description,
#                 'amount_used': float(report.amount_used),
#                 'image_url': report.image_url,
#                 'time': report.time.isoformat(),
#                 'status': report.status
#             }
#         })
        
#     except Exception as e:
#         return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)
    
@csrf_exempt
def create_report(request):
    logger.info(f"Incoming requestuest: {str(request)}", exc_info=True)

    if(request.method != "POST"):
        return JsonResponse({
            "error": "Method not allowed." 
        }, status = 405)
    
    try:
        image_file = request.FILES.get('file')
        if not image_file:
            return JsonResponse({
                "error": "Image file requestuired." 
            }, status = 400)

        if image_file.size > 1 * 1024 * 1024:
            return JsonResponse({
                "error": "Image size too large." 
            }, status = 400)
        
        # validate file
        mime = magic.Magic(mime = True)
        mime_type = mime.from_buffer(image_file.read(1024))
        allowed_mime_types = ['image/jpeg', 'image/png', 'application/pdf']
        if mime_type not in allowed_mime_types:
            logger.warning(f"Unexpected file type: {mime_type}", exc_info=True)
            return JsonResponse({
                "error": "Invalid file type." 
            }, status = 400)
        
        timestamp = int(time.time() * 1000)
        file_ext = Path(image_file.name).suffix.lower()
        file_name = f"{timestamp}{file_ext}"
        file_path = f"upload/{file_name}"

        saved_path = default_storage.save(file_path, image_file)
        file_url = default_storage.url(saved_path)
        logger.info(f"Saved a file in: {file_url}", exc_info=True)

        try:
            user_id = int(request.POST.get('id_user'))
            poin_id = int(request.POST.get('id_poin'))
            amount_used = float(request.POST.get('amount_used'))
        except (TypeError, ValueError):
            return JsonResponse({
                "error": "Invalid numeric value." 
            }, status = 400)
        
        description = request.POST.get('description')
        report_time = request.POST.get('time')
        status = request.POST.get('status', 'false').lower() == 'true'

        if not all([user_id, poin_id, description, amount_used]):
            default_storage.delete(saved_path)
            return JsonResponse({
                "error": "Missing requestuired fields." 
            }, status = 400)
        
        time_obj =  datetime.utcnow()
        if(time_obj):
            time_obj = make_aware(time_obj)
        else:
            return JsonResponse({
                "error": "Invalid date format." 
            }, status = 400)
        
        report = Report.objects.create(
            id_user_id=user_id,
            id_poin_id=poin_id,
            description=description,
            amount_used=amount_used,
            image_url=file_url,
            status=status,
            time=time_obj
        )

        return JsonResponse({
            'message': 'Evidence successfully uploaded',
            'data': {
                'id': report.id,
                'description': report.description,
                'amount_used': report.amount_used,
                'image_url': report.image_url,
                'time': report.time.isoformat(),
                'status': report.status
            }
        })
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}", exc_info=True)
        return JsonResponse({
            'error': 'Internal server error'
        }, status=500)


@csrf_exempt
def delete_report(requestuest, report_id):
    if requestuest.method != 'DELETE':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        # Cek apakah laporan ada di database
        report = Report.objects.get(id=report_id)

        # Hapus file yang terkait jika ada
        if report.image_url:
            file_path = Path(settings.MEDIA_ROOT) / Path(report.image_url.replace(settings.MEDIA_URL, ""))
            file_path = file_path.resolve()
            if file_path.exists():
                file_path.unlink()

        # Hapus entri dari database
        report.delete()
        return JsonResponse({'message': 'Evidence berhasil dihapus'}, status=200)
        
    except Report.DoesNotExist:
        return JsonResponse({'error': 'Report not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)