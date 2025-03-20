from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from myapp.models import Branch, Cluster, Report, User, Region
from django.db.models import Sum
from datetime import datetime

@csrf_exempt
def admin_region_dashboard(request, region_id):
    try:
        print(f"Processing request for region_id: {region_id}")
        
        # Parse query parameters
        month = request.GET.get('month', '')
        year = request.GET.get('year', '')
        
        print(f"Request params - month: {month}, year: {year}")
        
        # Convert month name to number
        month_map = {
            'Januari': 1, 'Februari': 2, 'Maret': 3, 'April': 4,
            'Mei': 5, 'Juni': 6, 'Juli': 7, 'Agustus': 8,
            'September': 9, 'Oktober': 10, 'November': 11, 'Desember': 12
        }
        month_number = month_map.get(month, datetime.now().month)
        year_number = int(year) if year.isdigit() else datetime.now().year

        # Get region data
        region = Region.objects.get(id_region=region_id)
        
        # Get all branches in this region
        branches = Branch.objects.filter(id_region=region_id)
        
        # Initialize data structures
        branch_data = []
        total_region_usage = 0
        total_reports = 0
        
        # Calculate data for each branch
        for branch in branches:
            # Get all clusters in this branch
            clusters = Cluster.objects.filter(id_branch=branch.id_branch)
            
            # Calculate total usage for this branch
            branch_reports = Report.objects.filter(
                id_user__id_cluster__id_branch=branch.id_branch,
                time__month=month_number,
                time__year=year_number
            )
            
            branch_total = branch_reports.aggregate(
                total_amount=Sum('amount_used')
            )['total_amount'] or 0
            
            total_region_usage += branch_total
            total_reports += branch_reports.count()
            
            branch_data.append({
                "id_branch": branch.id_branch,
                "name": branch.branch,
                "totalUsage": branch_total,
                "percentage": 0  # Will calculate after getting total
            })
        
        # Calculate percentages
        for branch_info in branch_data:
            branch_info["percentage"] = (
                (branch_info["totalUsage"] / total_region_usage * 100)
                if total_region_usage > 0 else 0
            )
        
        # Prepare response data
        response_data = {
            "regionName": region.region,
            "overview": {
                "total_amount": total_region_usage,
                "total_reports": total_reports
            },
            "branches": branch_data
        }
        
        print(f"Sending response: {response_data}")
        return JsonResponse(response_data)
        
    except Region.DoesNotExist:
        error_msg = f"Region with id {region_id} not found"
        print(f"Error: {error_msg}")
        return JsonResponse({"error": error_msg}, status=404)
    except Exception as e:
        print(f"Error in admin_region_dashboard: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500) 