from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from myapp.models import Recommendation, User, Poin
from datetime import datetime
import json

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
def create_recommendation(request):
    try:
        print("Received request at /api/recommendations/create")
        print("Request method:", request.method)
        print("Request body:", request.body.decode('utf-8'))
        
        data = json.loads(request.body)
        
        # Get user instance from cluster_id
        try:
            user = User.objects.get(id_cluster=data.get('cluster_id'), id_role=6)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)

        # Get or create recommendation
        recommendation, created = Recommendation.objects.update_or_create(
            id_user=user,  # Gunakan instance User, bukan cluster_id
            id_poin_id=data.get('poin_id'),
            time__month=getMonthNumber(data.get('month')),
            time__year=data.get('year'),
            defaults={
                'recommend': data.get('recommend'),
                'time': datetime(int(data.get('year')), getMonthNumber(data.get('month')), 1)
            }
        )

        return JsonResponse({
            'success': True,
            'data': {
                'recommendation': recommendation.recommend
            }
        })

    except Exception as e:
        print(f"Error in create_recommendation: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def get_recommendation(request, cluster_id, poin_id):
    try:
        month = request.GET.get('month')
        year = request.GET.get('year')

        if not all([cluster_id, poin_id, month, year]):
            return JsonResponse({
                'error': 'Missing required parameters'
            }, status=400)

        # Convert month name to number
        month_number = getMonthNumber(month)

        # Get user from cluster_id
        user = User.objects.filter(id_cluster=cluster_id).first()
        if not user:
            return JsonResponse({
                'error': f'No user found for cluster {cluster_id}'
            }, status=404)

        # Get recommendation
        recommendation = Recommendation.objects.filter(
            id_user=user,
            id_poin=poin_id,
            time__month=month_number,
            time__year=year
        ).first()

        return JsonResponse({
            'status': 'success',
            'recommendation': recommendation.recommend if recommendation else None
        })

    except Exception as e:
        print(f"Error in get_recommendation: {str(e)}")
        return JsonResponse({
            'error': str(e)
        }, status=500) 