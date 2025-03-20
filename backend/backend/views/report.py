import os
import time
from pathlib import Path
from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.utils import timezone
from myapp.models import Report

# Pastikan folder `upload` ada di dalam `MEDIA_ROOT`
UPLOAD_DIR = Path(settings.MEDIA_ROOT) / "upload"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@csrf_exempt
def create_report(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        # Ambil file yang diunggah
        image_file = request.FILES.get('file')
        if not image_file:
            return JsonResponse({'error': 'No image file provided'}, status=400)

        # Validasi ukuran file (maksimum 1MB)
        if image_file.size > 1 * 1024 * 1024:
            return JsonResponse({'error': 'File too large'}, status=400)
            
        # Validasi tipe file
        allowed_types = ['.jpg', '.jpeg', '.png', '.pdf']
        file_ext = Path(image_file.name).suffix.lower()
        if file_ext not in allowed_types:
            return JsonResponse({'error': 'Invalid file type'}, status=400)
        
        # Nama unik untuk file
        timestamp = int(time.time() * 1000)
        file_name = f"{timestamp}{file_ext}"
        file_path = UPLOAD_DIR / file_name

        # Simpan file ke folder `upload/`
        with open(file_path, 'wb') as destination:
            for chunk in image_file.chunks():
                destination.write(chunk)

        # URL gambar yang bisa diakses
        file_url = f"{settings.MEDIA_URL}upload/{file_name}"

        # Ambil data dari request
        user_id = request.POST.get('id_user')
        poin_id = request.POST.get('id_poin')
        description = request.POST.get('description')
        amount_used = request.POST.get('amount_used')
        report_time = request.POST.get('time')
        status = request.POST.get('status', 'false').lower() == 'true'

        # Validasi data yang wajib ada
        if not all([user_id, poin_id, description, amount_used]):
            file_path.unlink()  # Hapus file jika data tidak lengkap
            return JsonResponse({'error': 'Missing required fields'}, status=400)

        # Konversi waktu jika disediakan, atau gunakan waktu sekarang
        try:
            if report_time:
                time_obj = datetime.strptime(report_time, "%Y-%m-%d %H:%M:%S%z")
            else:
                time_obj = timezone.now()
        except ValueError:
            time_obj = timezone.now()

        # Simpan ke database
        try:
            report = Report.objects.create(
                id_user_id=user_id,
                id_poin_id=poin_id,
                description=description,
                amount_used=amount_used,
                image_url=file_url,
                status=status,
                time=time_obj
            )
        except Exception as db_error:
            file_path.unlink()  # Hapus file jika gagal menyimpan ke database
            return JsonResponse({'error': str(db_error)}, status=500)

        return JsonResponse({
            'message': 'Evidence berhasil diupload',
            'data': {
                'id': report.id,
                'description': report.description,
                'amount_used': float(report.amount_used),
                'image_url': report.image_url,
                'time': report.time.isoformat(),
                'status': report.status
            }
        })
        
    except Exception as e:
        return JsonResponse({'error': f'An error occurred: {str(e)}'}, status=500)

@csrf_exempt
def delete_report(request, report_id):
    if request.method != 'DELETE':
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