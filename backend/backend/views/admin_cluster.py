from myapp.models import User, Marketingfee, Report, Recommendation, Poin
from django.db.models.functions import ExtractMonth, ExtractYear
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.db.models import Sum, F
from datetime import datetime

@csrf_exempt
def cluster(request, id_cluster=None):
    try:
        month = request.GET.get('month')
        year = request.GET.get('year')

        # 1. Dapatkan data admin cluster
        admin_cluster = User.objects.get(
            id_cluster=id_cluster,  # Filter berdasarkan cluster yang diakses
            id_role__in=[4, 5]     # Role 4,5 untuk admin cluster
        )

        # 2. Ambil semua report dari user dalam cluster tersebut
        reports = Report.objects.filter(
            id_cluster=id_cluster,
            time__year=year,
            time__month=getMonthNumber(month)
        ).select_related('Poin')

        # 3. Hitung total dan breakdown per kategori poin
        report_data = []
        total_amount = 0

        for poin in Poin.objects.all():
            poin_reports = reports.filter(id_poin=poin.id_poin)
            poin_total = poin_reports.aggregate(total=Sum('amount_used'))['total'] or 0
            
            if poin_total > 0:
                total_amount += poin_total
                report_data.append({
                    'id_poin': poin.id_poin,
                    'type': poin.type,
                    'total_amount': poin_total,
                    'percentage': 0  # Will be calculated after total is known
                })

        # 4. Hitung persentase setelah total diketahui
        if total_amount > 0:
            for item in report_data:
                item['percentage'] = (item['total_amount'] / total_amount) * 100

        # 5. Format data monthly untuk chart
        monthly_data = []
        for report in reports.order_by('time'):
            monthly_data.append({
                'date': report.time.strftime('%d %B %Y'),
                'amount': report.amount_used
            })

        return JsonResponse({
            'data_admin': {
                'username': admin_cluster.username,
                'id_user': admin_cluster.id_user
            },
            'report_data': report_data,
            'monthly_data': monthly_data,
            'total_amount': total_amount
        })

    except User.DoesNotExist:
        return JsonResponse({
            'error': 'Admin cluster not found'
        }, status=404)
    except Exception as e:
        print(f"Error in cluster view: {str(e)}")
        return JsonResponse({
            'error': str(e)
        }, status=500)

def getMonthNumber(month):
    months = {
        'Januari': 1,
        'Februari': 2,
        'Maret': 3,
        'April': 4,
        'Mei': 5,
        'Juni': 6,
        'Juli': 7,
        'Agustus': 8,
        'September': 9,
        'Oktober': 10,
        'November': 11,
        'Desember': 12
    }
    return months.get(month, datetime.now().month)
