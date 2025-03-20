from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from myapp.models import User, Report, Marketingfee, Poin, Recommendation
from django.db.models import Sum
from datetime import datetime
from django.db.models.functions import ExtractMonth

@csrf_exempt
def user_dashboard(request, user_id):
    try:
        month = request.GET.get('month')
        year = request.GET.get('year')

        print(f"Processing request for user {user_id}, month: {month}, year: {year}")

        # Get user data
        user = User.objects.get(id_user=user_id)
        
        # Get reports untuk chart (semua bulan di tahun tersebut)
        chart_reports = Report.objects.filter(
            id_user=user_id,
            time__year=year
        ).values('time__month').annotate(
            total=Sum('amount_used')
        ).order_by('time__month')

        # Siapkan data untuk chart
        months = {
            1: 'Januari', 2: 'Februari', 3: 'Maret', 4: 'April',
            5: 'Mei', 6: 'Juni', 7: 'Juli', 8: 'Agustus',
            9: 'September', 10: 'Oktober', 11: 'November', 12: 'Desember'
        }

        monthly_data = {
            'labels': [],
            'datasets': [{
                'label': 'Marketing Fee',
                'data': [],
                'borderColor': '#FF4B2B',
                'backgroundColor': 'rgba(255, 75, 43, 0.1)',
                'tension': 0.4
            }]
        }

        # Isi data chart untuk setiap bulan yang memiliki total usage
        for report in chart_reports:
            month_number = report['time__month']
            month_name = months[month_number]
            # Ubah format label menjadi hanya nama bulan
            monthly_data['labels'].append(month_name)
            monthly_data['datasets'][0]['data'].append(report['total'])

        # Get reports untuk bulan yang dipilih (usage details)
        month_number = getMonthNumber(month)
        year_number = int(year)
        
        current_month_reports = Report.objects.filter(
            id_user=user_id,
            time__year=year_number,
            time__month=month_number
        ).order_by('time')

        # Hitung total marketing fee yang tersedia
        marketing_fee = Marketingfee.objects.filter(
            id_user=user_id,
            time__year=year_number,
            time__month=month_number
        ).aggregate(total=Sum('total'))['total'] or 0

        # Hitung total penggunaan (total usage)
        total_usage = current_month_reports.aggregate(
            total=Sum('amount_used')
        )['total'] or 0

        # Hitung persentase penggunaan dari marketing fee
        usage_percentage = (total_usage / marketing_fee * 100) if marketing_fee > 0 else 0

        # Kelompokkan report berdasarkan tipe poin
        usage_details = []
        poin_types = Poin.objects.all()
        
        for poin in poin_types:
            # Ambil semua report untuk poin type ini
            poin_reports = current_month_reports.filter(id_poin=poin.id_poin)
            total_amount = poin_reports.aggregate(
                total=Sum('amount_used')
            )['total'] or 0

            # Ambil recommendation untuk poin ini
            recommendation = Recommendation.objects.filter(
                id_user=user_id,
                id_poin=poin.id_poin,
                time__year=year_number,
                time__month=month_number
            ).first()

            recommend_value = recommendation.recommend if recommendation else 0

            # Hitung persentase berdasarkan recommendation
            percentage = (total_amount / recommend_value * 100) if recommend_value > 0 else 0

            # Format sesuai dengan admin_cluster_region
            usage_details.append({
                'id_poin': poin.id_poin,
                'type': poin.type,
                'total_amount': total_amount,
                'percentage': round(percentage, 2),
                'recommendation': recommend_value
            })

        # Siapkan data dashboard dengan format yang konsisten dengan admin_cluster_region
        dashboard_data = {
            'overview': {
                'total_reports': current_month_reports.count(),
                'total_amount': total_usage,
                'user_data': {
                    'username': user.username,
                    'telp': user.telp or ''
                }
            },
            'monthlyData': monthly_data,
            'usage_details': usage_details,
            'reports': list(current_month_reports.values()),
            'marketing_fee': marketing_fee
        }

        return JsonResponse(dashboard_data)

    except Exception as e:
        print(f"Error in user dashboard: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

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