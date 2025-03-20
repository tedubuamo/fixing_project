from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from myapp.models import Branch, Cluster, Report, User, Marketingfee
from django.db.models import Sum
from datetime import datetime

@csrf_exempt
def admin_branch_dashboard(request, branch_id):
    try:
        print(f"Processing request for branch_id: {branch_id}")
        
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

        # Get branch data
        branch = Branch.objects.get(id_branch=branch_id)
        
        # Get clusters in this branch
        clusters = Cluster.objects.filter(id_branch=branch_id)
        
        if not clusters.exists():
            return JsonResponse({
                "error": f"No clusters found for branch {branch_id}"
            }, status=404)
        
        clusters_data = []
        total_branch_usage = 0
        
        for cluster in clusters:
            users = User.objects.filter(id_cluster=cluster.id_cluster)
            
            # Calculate total usage for this cluster
            total_usage = Report.objects.filter(
                id_user__in=users.values('id_user'),
                time__month=month_number,
                time__year=year_number
            ).aggregate(
                total=Sum('amount_used')
            )['total'] or 0
            
            total_branch_usage += total_usage
            
            clusters_data.append({
                "id_cluster": cluster.id_cluster,
                "name": cluster.cluster,
                "totalUsage": total_usage,
                "percentage": 0  # Will be calculated after total is known
            })
        
        # Calculate percentages
        for cluster in clusters_data:
            cluster["percentage"] = (
                (cluster["totalUsage"] / total_branch_usage * 100) 
                if total_branch_usage > 0 else 0
            )
        
        response_data = {
            "branchName": branch.branch,
            "overview": {
                "total_amount": total_branch_usage,
                "total_reports": Report.objects.filter(
                    id_user__in=User.objects.filter(
                        id_cluster__in=clusters.values('id_cluster')
                    ).values('id_user'),
                    time__month=month_number,
                    time__year=year_number
                ).count()
            },
            "clusters": clusters_data,
            "monthlyData": {
                "labels": [],
                "datasets": []
            }
        }
        
        print(f"Sending response: {response_data}")
        return JsonResponse(response_data)
        
    except Branch.DoesNotExist:
        error_msg = f"Branch with id {branch_id} not found"
        print(f"Error: {error_msg}")
        return JsonResponse({"error": error_msg}, status=404)
    except Exception as e:
        print(f"Error in admin_branch_dashboard: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)

def get_monthly_data(year):
    # Implementasi logika untuk mendapatkan data bulanan
    # Sesuaikan dengan kebutuhan
    return {
        'labels': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        'datasets': [
            {
                'label': 'Marketing Fee',
                'data': [0] * 12,  # Isi dengan data sebenarnya
                'borderColor': '#FF4B2B',
                'backgroundColor': 'rgba(255, 75, 43, 0.1)',
            }
        ]
    } 