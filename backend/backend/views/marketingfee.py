from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.shortcuts import get_object_or_404
from myapp.models import Recommendation, Marketingfee, User, Poin, Report
import json
from django.db.models import Sum
from datetime import datetime
from django.db import connection


@csrf_exempt
def recommendation(request, id_user):
    if request.method == "POST":
        try:
            # Mengambil data yang dikirim
            data = json.loads(request.body)
            
            # Memastikan data 'recommendations' ada dan berupa list
            recommendations = data.get("recommendations")
            if not recommendations or not isinstance(recommendations, list):
                return JsonResponse({"status": "error", "message": "Recommendations must be provided as a list"}, status=400)

            # Set poin yang wajib diisi
            required_poin_ids = set(range(1, 8))  # {1, 2, 3, 4, 5, 6, 7}
            provided_poin_ids = set()

            user = get_object_or_404(User, id_user=id_user)
            created_recommendations = []

            # Loop melalui setiap item dalam 'recommendations'
            for rec in recommendations:
                id_poin = rec.get("id_poin")
                recommend = rec.get("recommend")

                if not id_poin or recommend is None:
                    return JsonResponse({"status": "error", "message": "Each recommendation must include 'id_poin' and 'recommend'"}, status=400)

                # Menambahkan id_poin yang ada ke dalam set provided_poin_ids
                provided_poin_ids.add(id_poin)

                # Memastikan id_poin valid dan ada di database
                poin = get_object_or_404(Poin, id_poin=id_poin)

                recommendation_entry = Recommendation.objects.create(
                    id_user=user,
                    id_poin=poin,
                    recommend=recommend,
                    time=timezone.now()
                )

                created_recommendations.append({
                    "id": recommendation_entry.id,
                    "id_user": recommendation_entry.id_user.id_user,
                    "id_poin": recommendation_entry.id_poin.id_poin,
                    "time": recommendation_entry.time,
                    "recommend": recommendation_entry.recommend
                })

            # Memastikan semua id_poin dari 1 sampai 7 ada
            if not provided_poin_ids == required_poin_ids:
                missing_poin = required_poin_ids - provided_poin_ids
                return JsonResponse({
                    "status": "error",
                    "message": f"Missing required points: {', '.join(map(str, missing_poin))}"
                }, status=400)

            # Menyusun response dengan data rekomendasi yang berhasil dibuat
            return JsonResponse({
                "status": "success",
                "message": "Recommendations recorded successfully",
                "data": created_recommendations
            }, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"status": "error", "message": "Invalid JSON format"}, status=400)

        except Exception as e:
            return JsonResponse({"status": "error", "message": f"An error occurred: {str(e)}"}, status=500)

    return JsonResponse({"status": "error", "message": "Method not allowed"}, status=405)



@csrf_exempt
def marketingfee(request, id_user):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            total = data.get("total")

            user = get_object_or_404(User, id_user=id_user)

            marketing_fee = Marketingfee.objects.create(
                id_user=user,
                total=total,
                time=timezone.now()
            )

            return JsonResponse({
                "status": "success",
                "message": "Marketing fee recorded successfully",
                "data": {
                    "id": marketing_fee.id,
                    "id_user": marketing_fee.id_user.id_user,
                    "time": marketing_fee.time,
                    "total": marketing_fee.total
                }
            }, status=201)

        except json.JSONDecodeError:
            return JsonResponse({"status": "error", "message": "Invalid JSON format"}, status=400)

        except Exception as e:
            return JsonResponse({"status": "error", "message": f"An error occurred: {str(e)}"}, status=500)

    return JsonResponse({"status": "error", "message": "Method not allowed"}, status=405)


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

@csrf_exempt
def get_marketing_fee(request, user_id):
    try:
        month = request.GET.get('month')
        year = request.GET.get('year')

        reports = Report.objects.filter(
            id_user=user_id,
            time__month=getMonthNumber(month),
            time__year=year
        )

        total_fee = reports.aggregate(total=Sum('amount_used'))['total'] or 0

        return JsonResponse({
            'total': total_fee
        })

    except Exception as e:
        print(f"Error fetching marketing fee: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def get_monthly_marketing_fee(request, user_id):
    try:
        month = request.GET.get('month')
        year = request.GET.get('year')

        # Get daily reports for the month
        reports = Report.objects.filter(
            id_user=user_id,
            time__month=getMonthNumber(month),
            time__year=year
        ).values('time__date').annotate(
            amount=Sum('amount_used')
        ).order_by('time__date')

        daily_data = [{
            'date': report['time__date'].strftime('%d %B'),
            'amount': report['amount']
        } for report in reports]

        return JsonResponse(daily_data, safe=False)

    except Exception as e:
        print(f"Error fetching monthly data: {str(e)}")
        return JsonResponse([], safe=False)

@csrf_exempt
def submit_marketing_fee(request):
    """Fungsi untuk menyimpan marketing fee"""
    if request.method not in ['POST', 'PUT']:  # Terima metode PUT juga
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        cluster_id = data.get('clusterId')
        amount = data.get('amount')
        month = data.get('month')
        year = data.get('year')
        
        # Validasi input
        if not all([cluster_id, amount, month, year]):
            return JsonResponse({
                'error': 'Missing required fields'
            }, status=400)
            
        # Convert month name to number if needed
        months = {
            'Januari': 1, 'Februari': 2, 'Maret': 3, 'April': 4,
            'Mei': 5, 'Juni': 6, 'Juli': 7, 'Agustus': 8,
            'September': 9, 'Oktober': 10, 'November': 11, 'Desember': 12
        }
        month_number = int(month) if month.isdigit() else months.get(month, datetime.now().month)
        year_number = int(year)
        
        # Get user from cluster first
        try:
            cluster_user = User.objects.get(
                id_cluster=cluster_id,
                id_role=6
            )
            print(f"Found cluster user: {cluster_user.id_user}")
            
        except User.DoesNotExist:
            return JsonResponse({'error': 'Cluster user not found'}, status=404)
            
        # Cek apakah sudah ada marketing fee untuk bulan dan tahun ini
        try:
            with connection.cursor() as cursor:
                # Cari marketing fee yang sudah ada
                cursor.execute(
                    'SELECT id FROM "MarketingFee" WHERE id_user = %s AND EXTRACT(MONTH FROM time) = %s AND EXTRACT(YEAR FROM time) = %s',
                    [cluster_user.id_user, month_number, year_number]
                )
                existing_fee = cursor.fetchone()
                
                if existing_fee:
                    # Update marketing fee yang sudah ada
                    cursor.execute(
                        'UPDATE "MarketingFee" SET total = %s, time = %s WHERE id = %s RETURNING id',
                        [float(amount), timezone.now(), existing_fee[0]]
                    )
                    marketing_fee_id = existing_fee[0]
                    print(f"Updated marketing fee with ID: {marketing_fee_id}")
                else:
                    # Buat marketing fee baru
                    cursor.execute(
                        'INSERT INTO "MarketingFee" (id_user, total, time) VALUES (%s, %s, %s) RETURNING id',
                        [cluster_user.id_user, float(amount), timezone.now()]
                    )
                    marketing_fee_id = cursor.fetchone()[0]
                    print(f"Created new marketing fee with ID: {marketing_fee_id}")
                
            return JsonResponse({
                'message': 'Marketing fee saved successfully',
                'data': {
                    'id': marketing_fee_id,
                    'total': float(amount)
                }
            })
            
        except Exception as e:
            print(f"Error handling marketing fee: {str(e)}")
            raise
            
    except Exception as e:
        print(f"Error in submit_marketing_fee: {str(e)}")
        return JsonResponse({
            'error': str(e),
            'detail': 'Failed to process marketing fee submission'
        }, status=500)
