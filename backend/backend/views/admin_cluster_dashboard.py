from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from myapp.models import User, Report, Cluster, Poin, Recommendation, Marketingfee
from datetime import datetime
from django.db.models import Sum

@csrf_exempt
def admin_cluster_dashboard(request, cluster_id):
    try:
        month = request.GET.get('month')
        year = request.GET.get('year')

        print(f"Request params: {{ clusterId: '{cluster_id}', month: '{month}', year: '{year}' }}")

        # Convert month name to number
        month_number = getMonthNumber(month)
        year_number = int(year)

        # Get user data for this cluster
        cluster_user = User.objects.get(
            id_cluster=cluster_id,
            id_role=6  # user biasa
        )

        # Get reports untuk chart (semua bulan di tahun tersebut)
        chart_reports = Report.objects.filter(
            id_user=cluster_user.id_user,
            time__year=year_number
        ).order_by('time')

        # Get reports untuk bulan yang dipilih
        current_reports = Report.objects.filter(
            id_user=cluster_user.id_user,
            time__year=year_number,
            time__month=month_number
        ).select_related('id_poin')

        # Hitung total amount untuk bulan ini
        total_amount = current_reports.aggregate(Sum('amount_used'))['amount_used__sum'] or 0

        # Prepare monthly data for chart
        monthly_totals = {}
        for report in chart_reports:
            month_name = {
                1: 'Januari', 2: 'Februari', 3: 'Maret', 4: 'April',
                5: 'Mei', 6: 'Juni', 7: 'Juli', 8: 'Agustus',
                9: 'September', 10: 'Oktober', 11: 'November', 12: 'Desember'
            }[report.time.month]
            
            if month_name not in monthly_totals:
                monthly_totals[month_name] = 0
            monthly_totals[month_name] += report.amount_used

        # Format data untuk chart
        monthly_data = {
            'labels': list(monthly_totals.keys()),
            'datasets': [{
                'label': 'Marketing Fee',
                'data': list(monthly_totals.values()),
                'borderColor': '#FF4B2B',
                'backgroundColor': 'rgba(255, 75, 43, 0.1)',
                'tension': 0.4
            }]
        }

        # Get marketing fee untuk bulan ini
        marketing_fee = Marketingfee.objects.filter(
            id_user=cluster_user.id_user,
            time__year=year_number,
            time__month=month_number
        ).aggregate(total=Sum('total'))['total'] or 0

        # Get all poin types and prepare usage details
        usage_details = []
        all_poin_types = Poin.objects.all()
        
        for poin in all_poin_types:
            # Get total amount for this poin
            poin_amount = current_reports.filter(
                id_poin=poin.id_poin
            ).aggregate(
                total=Sum('amount_used')
            )['total'] or 0

            # Get recommendation for this poin
            recommendation = Recommendation.objects.filter(
                id_user=cluster_user.id_user,
                id_poin=poin.id_poin,
                time__year=year_number,
                time__month=month_number
            ).first()

            # Calculate percentage
            recommend_value = recommendation.recommend if recommendation else 0
            percentage = (poin_amount / recommend_value * 100) if recommend_value > 0 else 0

            usage_details.append({
                'id_poin': poin.id_poin,
                'type': poin.type,
                'total_amount': poin_amount,
                'percentage': round(percentage, 2),
                'recommendation': recommend_value
            })

        # Prepare response data
        dashboard_data = {
            'overview': {
                'total_reports': current_reports.count(),
                'total_amount': total_amount,
                'user_data': {
                    'username': cluster_user.username,
                    'telp': cluster_user.telp or ''
                }
            },
            'monthlyData': monthly_data,
            'usage_details': usage_details,
            'reports': [{
                'id': report.id,
                'id_user_id': report.id_user_id,
                'id_poin_id': report.id_poin_id,
                'description': report.description,
                'amount_used': report.amount_used,
                'image_url': report.image_url,
                'time': report.time.isoformat(),
                'status': report.status,
                'approved_at': report.approved_at.isoformat() if report.approved_at else None
            } for report in current_reports],
            'marketing_fee': marketing_fee
        }

        return JsonResponse(dashboard_data)

    except User.DoesNotExist:
        print(f"User not found for cluster: {cluster_id}")
        return JsonResponse({'error': 'User not found'}, status=404)
    except Exception as e:
        print(f"Backend error: {{ error: '{str(e)}' }}")
        return JsonResponse({'error': str(e)}, status=500)

def getMonthNumber(month: str) -> int:
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

@csrf_exempt
def get_cluster_dashboard(request, cluster_id):
    try:
        cluster = User.objects.get(id_user=cluster_id, id_role=5)
        
        dashboard_data = {
            'cluster_name': cluster.username,
            'total_reports': Report.objects.filter(id_cluster=cluster_id).count(),
            # Tambahkan data lain yang diperlukan
        }
        
        return JsonResponse(dashboard_data)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500) 