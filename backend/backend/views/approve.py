from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from myapp.models import Report
import json
from datetime import datetime
import calendar

@csrf_exempt
def batch_approve_reports(request):
    """Fungsi untuk approve laporan secara batch tanpa autentikasi"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        user_id = data.get('user_id')
        year = int(data.get('year'))
        month = int(data.get('month'))
        
        # Validasi bulan
        if not (1 <= month <= 12):
            return JsonResponse({'error': 'Invalid month'}, status=400)
        
        # Tentukan rentang tanggal awal & akhir bulan
        first_day = datetime(year, month, 1)
        last_day = datetime(year, month, calendar.monthrange(year, month)[1], 23, 59, 59)
        
        # Ambil laporan yang belum di-approve
        reports = Report.objects.filter(
            id_user=user_id,
            time__gte=first_day,
            time__lte=last_day,
            status=False
        )
        
        count = reports.count()
        if count == 0:
            return JsonResponse({'message': 'No pending reports found for this period'})
        
        # Update status laporan
        current_time = timezone.now()
        reports.update(status=True, approved_at=current_time)
        
        return JsonResponse({
            'message': 'Reports approved successfully',
            'data': {
                'approved_count': count,
                'user_id': user_id,
                'month': month,
                'year': year,
                'approved_at': current_time.isoformat()
            }
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
