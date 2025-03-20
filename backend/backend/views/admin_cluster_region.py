from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Sum
from myapp.models import Branch, Cluster, Report, User, Marketingfee, Poin, Recommendation
from datetime import datetime

@csrf_exempt
def admin_cluster_region_dashboard(request, cluster_id):
    try:
        # Get month and year from query params
        month = request.GET.get('month', '')
        year = request.GET.get('year', '')
        
        # Convert month name to number
        months = {
            'Januari': 1, 'Februari': 2, 'Maret': 3, 'April': 4,
            'Mei': 5, 'Juni': 6, 'Juli': 7, 'Agustus': 8,
            'September': 9, 'Oktober': 10, 'November': 11, 'Desember': 12
        }
        month_number = int(month) if month.isdigit() else months.get(month, datetime.now().month)
        year_number = int(year) if year.isdigit() else datetime.now().year

        # Get cluster user data
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

        # Hitung total amount dan reports
        total_amount = current_reports.aggregate(Sum('amount_used'))['amount_used__sum'] or 0
        
        # Prepare monthly data for chart
        monthly_data = {
            'labels': [],
            'datasets': [{
                'label': 'Total Marketing Fee',
                'data': [],
                'borderColor': '#FF4B2B',
                'backgroundColor': 'rgba(255, 75, 43, 0.1)',
                'tension': 0.4
            }]
        }

        # Process monthly data
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

        # Sort and add to monthly_data
        for month_name in sorted(monthly_totals.keys(), key=lambda x: months[x]):
            monthly_data['labels'].append(month_name)
            monthly_data['datasets'][0]['data'].append(monthly_totals[month_name])

        # Get usage details grouped by poin
        usage_details = []
        poin_types = Poin.objects.all()

        for poin in poin_types:
            # Ambil total amount untuk poin ini
            poin_reports = current_reports.filter(id_poin=poin.id_poin)
            total_amount = poin_reports.aggregate(total=Sum('amount_used'))['total'] or 0

            # Ambil rekomendasi untuk poin ini
            recommendation = Recommendation.objects.filter(
                id_user=cluster_user.id_user,
                id_poin=poin.id_poin,
                time__year=year_number,
                time__month=month_number
            ).first()

            recommend_value = recommendation.recommend if recommendation else 0
            
            # Hitung persentase berdasarkan rekomendasi
            percentage = (total_amount / recommend_value * 100) if recommend_value > 0 else 0

            usage_details.append({
                'id_poin': poin.id_poin,
                'type': poin.type,
                'total_amount': total_amount,
                'percentage': round(percentage, 2),
                'recommendation': recommend_value  # Ubah dari 'recommend' ke 'recommendation'
            })

        # Ambil marketing fee dengan pola yang sama seperti user_dashboard
        marketing_fee = Marketingfee.objects.filter(
            id_user=cluster_user.id_user,  # Gunakan id_user dari cluster_user
            time__year=year_number,
            time__month=month_number
        ).aggregate(total=Sum('total'))['total'] or 0  # Gunakan nama field yang sama

        response_data = {
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
            'reports': list(current_reports.values()),
            'marketing_fee': marketing_fee
        }

        return JsonResponse(response_data)

    except User.DoesNotExist:
        return JsonResponse({"error": "Cluster user not found"}, status=404)
    except Exception as e:
        print(f"Error in admin_cluster_region_dashboard: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def check_cluster_access_region(request, branch_id, cluster_id):
    try:
        # Debug log
        print(f"Checking access for branch {branch_id} to cluster {cluster_id}")
        
        # Cek apakah cluster ada di bawah branch yang ada di region tersebut
        cluster = Cluster.objects.filter(
            id_cluster=cluster_id,
            id_branch=branch_id
        ).first()
        
        has_access = cluster is not None
        print(f"Access result: {has_access}")
        
        return JsonResponse({
            'hasAccess': has_access
        })
    except Exception as e:
        print(f"Error in check_cluster_access_region: {str(e)}")
        return JsonResponse({
            'hasAccess': False,
            'error': str(e)
        }, status=500)