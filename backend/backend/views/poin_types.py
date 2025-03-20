from django.http import JsonResponse
from myapp.models import Poin

def get_poin_types(request):
    try:
        poin_types = Poin.objects.all().values('id_poin', 'type')
        return JsonResponse(list(poin_types), safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500) 