from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from myapp.models import Area, Region, Branch, Cluster, User
import logging

logger = logging.getLogger(__name__)

def get_areas(request):
    try:
        logger.info('Fetching areas')
        areas = Area.objects.all().values('id_area', 'area')
        logger.info(f'Found {len(areas)} areas')
        return JsonResponse(list(areas), safe=False)
    except Exception as e:
        logger.error(f'Error fetching areas: {str(e)}')
        return JsonResponse({'error': str(e)}, status=500)

def get_regions(request, area_id):
    try:
        logger.info(f'Fetching regions for area {area_id}')
        regions = Region.objects.filter(id_area=area_id).values('id_region', 'region')
        logger.info(f'Found {len(regions)} regions')
        return JsonResponse(list(regions), safe=False)
    except Exception as e:
        logger.error(f'Error fetching regions: {str(e)}')
        return JsonResponse({'error': str(e)}, status=500)

def get_branches(request, region_id):
    try:
        logger.info(f'Fetching branches for region {region_id}')
        branches = Branch.objects.filter(id_region=region_id).values('id_branch', 'branch')
        logger.info(f'Found {len(branches)} branches')
        return JsonResponse(list(branches), safe=False)
    except Exception as e:
        logger.error(f'Error fetching branches: {str(e)}')
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def get_clusters(request, branch_id):
    try:
        # Log untuk debugging
        print(f"Fetching clusters for branch_id: {branch_id}")
        
        clusters = Cluster.objects.filter(id_branch=branch_id).values('id_cluster', 'cluster')
        
        # Log hasil query
        print(f"Found clusters: {list(clusters)}")
        
        return JsonResponse(list(clusters), safe=False)
        
    except Exception as e:
        print(f"Error in get_clusters: {str(e)}")
        return JsonResponse(
            {'error': f'Failed to fetch clusters: {str(e)}'}, 
            status=500
        )

# Similar views for branches and clusters 