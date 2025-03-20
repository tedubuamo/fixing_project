from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Sum, Count, Q
from myapp.models import User, Report, Region, Branch, Cluster, Marketingfee
from datetime import datetime

@csrf_exempt
def admin_area_dashboard(request, id_area):
    try:
        # Get month dan year dari query params dan konversi ke integer
        month_param = request.GET.get('month', str(datetime.now().month))
        year = int(request.GET.get('year', datetime.now().year))

        # Konversi nama bulan ke angka jika diperlukan
        month_map = {
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

        # Cek apakah month_param adalah nama bulan atau angka
        try:
            month = int(month_param)
        except ValueError:
            month = month_map.get(month_param, datetime.now().month)

        print(f"Converting month param: {month_param} to number: {month}")  # Debug log

        # Validasi admin area - Gunakan id_user 1001 untuk admin area
        try:
            admin = User.objects.get(id_user=1001, id_role=1)  # admin area dengan id 1001
        except User.DoesNotExist:
            return JsonResponse({"error": "Admin area not found"}, status=404)

        # Get semua region dalam area 1 (karena hanya ada 1 area)
        regions = Region.objects.filter(id_area=1)  # id_area selalu 1
        
        # Overview data
        total_marketing_fee = Marketingfee.objects.filter(
            id_user__id_region__in=regions.values('id_region')
        ).aggregate(total=Sum('total'))['total'] or 0

        total_usage = Report.objects.filter(
            id_user__id_region__in=regions.values('id_region'),
            time__month=month,
            time__year=year
        ).aggregate(total=Sum('amount_used'))['total'] or 0

        pending_approvals = Report.objects.filter(
            id_user__id_region__in=regions.values('id_region'),
            status=False
        ).count()

        # Data per region
        region_data = []
        for region in regions:
            region_usage = Report.objects.filter(
                id_user__id_region=region.id_region,
                time__month=month,
                time__year=year
            ).aggregate(total=Sum('amount_used'))['total'] or 0

            region_marketing_fee = Marketingfee.objects.filter(
                id_user__id_region=region.id_region
            ).aggregate(total=Sum('total'))['total'] or 0

            # Get branches dalam region
            branches = Branch.objects.filter(id_region=region.id_region)
            branch_data = []

            for branch in branches:
                branch_usage = Report.objects.filter(
                    id_user__id_branch=branch.id_branch,
                    time__month=month,
                    time__year=year
                ).aggregate(total=Sum('amount_used'))['total'] or 0

                clusters = Cluster.objects.filter(id_branch=branch.id_branch)
                cluster_data = []

                for cluster in clusters:
                    cluster_usage = Report.objects.filter(
                        id_user__id_cluster=cluster.id_cluster,
                        time__month=month,
                        time__year=year
                    ).aggregate(total=Sum('amount_used'))['total'] or 0

                    cluster_data.append({
                        "id_cluster": cluster.id_cluster,
                        "name": cluster.cluster,
                        "total_usage": cluster_usage
                    })

                branch_data.append({
                    "id_branch": branch.id_branch,
                    "name": branch.branch,
                    "total_usage": branch_usage,
                    "clusters": cluster_data
                })

            region_data.append({
                "id_region": region.id_region,
                "name": region.region,
                "total_marketing_fee": region_marketing_fee,
                "total_usage": region_usage,
                "usage_percentage": (region_usage / region_marketing_fee * 100) if region_marketing_fee > 0 else 0,
                "branches": branch_data
            })

        # Get pending reports yang butuh approval
        pending_reports = Report.objects.filter(
            id_user__id_region__in=regions.values('id_region'),
            status=False
        ).select_related('id_user', 'id_poin').order_by('-time')[:10]

        pending_report_data = [{
            "id_report": report.id,
            "description": report.description,
            "amount": report.amount_used,
            "time": report.time.strftime("%Y-%m-%d %H:%M:%S") if report.time else None,
            "user": {
                "username": report.id_user.username,
                "cluster": report.id_user.id_cluster.cluster if report.id_user.id_cluster else None,
                "branch": report.id_user.id_branch.branch if report.id_user.id_branch else None,
                "region": report.id_user.id_region.region if report.id_user.id_region else None
            },
            "poin": report.id_poin.type if report.id_poin else None
        } for report in pending_reports]

        response_data = {
            "overview": {
                "total_marketing_fee": total_marketing_fee,
                "total_usage": total_usage,
                "usage_percentage": (total_usage / total_marketing_fee * 100) if total_marketing_fee > 0 else 0,
                "total_reports": Report.objects.filter(
                    id_user__id_region__in=regions.values('id_region')
                ).count(),
                "pending_approvals": pending_approvals
            },
            "regions": region_data,
            "pending_reports": pending_report_data
        }

        return JsonResponse(response_data)

    except Exception as e:
        print(f"Error in admin_area_dashboard: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500) 