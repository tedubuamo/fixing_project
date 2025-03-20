from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from myapp.models import User

@csrf_exempt
def get_cluster_user(request, cluster_id):
    try:
        print(f"Searching cluster user for cluster_id: {cluster_id}")
        
        # Cari user cluster (id_user 6xxx) di cluster tersebut
        user = User.objects.filter(
            id_cluster=cluster_id,
            id_user__gte=6000,  # ID user cluster dimulai dari 6000
            id_user__lt=7000    # Sampai sebelum 7000
        ).first()

        if not user:
            print(f"No user found for cluster_id: {cluster_id}")
            return JsonResponse({
                'error': 'Cluster user not found'
            }, status=404)

        print(f"Found user {user.id_user} for cluster {cluster_id}")
        return JsonResponse({
            'id_user': user.id_user,
            'username': user.username
        })

    except Exception as e:
        print(f"Error in get_cluster_user: {str(e)}")
        return JsonResponse({
            'error': str(e)
        }, status=500)