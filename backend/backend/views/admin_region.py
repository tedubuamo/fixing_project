import requests
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from myapp.models import User

@csrf_exempt
def region(request, id_region=None,id_branch=None,id_cluster=None,id_poin=None):
    month = request.GET.get('month')
    year = request.GET.get('year') 

    if id_region:
        try:
            region_admin = User.objects.get(id_user=id_region, id_role__in=[2])
        except User.DoesNotExist:
            return JsonResponse({'error': 'Region admin not found'}, status=404)
        
        if not id_branch and not id_cluster: 
            list_branch = list(User.objects.filter(id_region=region_admin.id_region, id_role=3).values('id_user', 'username')) 

            return JsonResponse({
                "data_admin" : {
                    "id_user" : region_admin.id_user,
                    "username" : region_admin.username
                },
                "list_branch" : list_branch})
        
        elif id_branch and not id_cluster:
            branch_admin = User.objects.get(id_user=id_branch, id_role__in=[3])

            base_url = 'http://127.0.0.1:8000/api/admin/branch/{}/'
            response = requests.get(base_url.format(id_branch), timeout=5)  
            cluster_list = response.json()

            return JsonResponse({
                "data_admin" : {
                    "id_user" : branch_admin.id_user,
                    "username" : branch_admin.username
                },
                "list_cluster" : cluster_list})
        
        elif id_branch and id_cluster and id_poin:
            base_url = f"http://127.0.0.1:8000/api/admin/branch/{id_branch}/cluster/{id_cluster}/{id_poin}?month={month}&year={year}"
            response = requests.get(base_url, timeout=5)
            if response.status_code == 200:
                cluster_info = response.json()
                return JsonResponse(cluster_info, safe=False)
