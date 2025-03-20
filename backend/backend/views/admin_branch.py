import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from myapp.models import User

@csrf_exempt
def branch(request, id_branch=None,id_cluster=None,id_poin=None):
    month = request.GET.get('month')
    year = request.GET.get('year')

    if id_branch and id_cluster and id_poin:
        api_url = f'http://127.0.0.1:8000/api/admin/cluster/{id_cluster}/{id_poin}?month={month}&year={year}'
        try:
            response = requests.get(api_url, timeout=5)
            if response.status_code == 200:
                cluster_info = response.json()
                return JsonResponse(cluster_info, safe=False)
            else:
                return JsonResponse({"error": "Cluster API error"}, status=response.status_code)
        except requests.exceptions.RequestException as e:
            return JsonResponse({"error": f"Failed to connect: {str(e)}"}, status=500)
    
    elif id_branch:
        try:
            branch_admin = User.objects.get(id_user=id_branch, id_role__in=[3])  
        except User.DoesNotExist:
            return JsonResponse({'error': 'Branch admin not found'}, status=404)

        list_cluster = list(User.objects.filter(id_branch=branch_admin.id_branch, id_role=5).values('id_user', 'username')) 

        base_url = 'http://127.0.0.1:8000/api/admin/cluster/{}/'
        cluster_summary = []

        for cluster in list_cluster:
            id_cluster = cluster['id_user']
            try:
                response = requests.get(base_url.format(id_cluster), timeout=5)  
                if response.status_code == 200:
                    cluster_info = response.json()

                    # Ambil hanya yang diperlukan
                    marketing_fee_total = sum(fee['total'] for fee in cluster_info.get('user_data', {}).get('marketing_fee', []))
                    total_fee = cluster_info.get('user_data', {}).get('total_fee', 0)
                    fee_balance = cluster_info.get('user_data', {}).get('fee_balance', 0)

                    cluster_summary.append({
                        "id_cluster": id_cluster,
                        "username": cluster["username"],
                        "marketing_fee_total": marketing_fee_total,
                        "total_fee": total_fee,
                        "fee_balance": fee_balance
                    })
                else:
                    cluster_summary.append({"id_cluster": id_cluster, "error": "Cluster API error"})
            except requests.exceptions.RequestException as e:
                cluster_summary.append({"id_cluster": id_cluster, "error": f"Failed to connect: {str(e)}"})

        return JsonResponse({
            "data_admin": {
                "id_user": branch_admin.id_user,
                "username": branch_admin.username,
            },
            "cluster_summary": cluster_summary,
        }, safe=False)
