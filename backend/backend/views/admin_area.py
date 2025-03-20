from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from myapp.models import User

@csrf_exempt
def area(request, id_area=None, id_region=None, id_branch=None, id_cluster=None, id_poin=None):
    if id_area:
        try:
            admin_area = User.objects.get(id_user=id_area, id_role__in=[1])
        except User.DoesNotExist:
            return JsonResponse({'error': 'Region admin not found'}, status=404)
        
        if not id_region and not id_branch and not id_cluster:
            list_region = list(User.objects.filter(id_area=admin_area.id_area, id_role=2).values('id_user', 'username')) 

            return JsonResponse({
                "data_admin" : {
                    "username" : admin_area.username,
                    "id_user" : admin_area.id_user},
                "list_region" : list_region
                }) 