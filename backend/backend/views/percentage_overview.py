from django.db.models.functions import ExtractMonth, ExtractYear
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.db.models import Sum, Max
from myapp.models import User, Marketingfee, Report, Cluster
from datetime import datetime

@csrf_exempt
def report_overview(request):
    try:
        # Dapatkan bulan dan tahun saat ini
        current_date = datetime.now()
        current_month = current_date.month
        current_year = current_date.year

        # Ambil branch_id dari query parameter jika ada
        branch_id = request.GET.get('branch_id')
        
        if branch_id:
            # Ambil semua cluster dalam branch tersebut
            clusters = Cluster.objects.filter(id_branch=branch_id)
            
            cluster_data = []
            total_branch_usage = 0
            
            for cluster in clusters:
                # Ambil semua user dalam cluster ini
                cluster_users = User.objects.filter(id_cluster=cluster.id_cluster)
                
                # Hitung total usage untuk cluster ini
                cluster_usage = Report.objects.filter(
                    id_user__in=cluster_users.values('id_user'),
                    time__month=current_month,
                    time__year=current_year
                ).aggregate(
                    total_used=Sum('amount_used')
                )['total_used'] or 0
                
                # Hitung total marketing fee untuk cluster ini
                cluster_marketing_fee = Marketingfee.objects.filter(
                    id_user__in=cluster_users.values('id_user'),
                    time__month=current_month,
                    time__year=current_year
                ).aggregate(
                    total=Sum('total')
                )['total'] or 0
                
                total_branch_usage += cluster_usage
                
                cluster_data.append({
                    "id_cluster": cluster.id_cluster,
                    "cluster_name": cluster.cluster,
                    "total_fee_used": cluster_usage,
                    "total_marketing_fee": cluster_marketing_fee,
                    "percentage_used": (cluster_usage / cluster_marketing_fee * 100) if cluster_marketing_fee > 0 else 0
                })
            
            # Hitung persentase relatif terhadap total branch usage
            for cluster in cluster_data:
                cluster["percentage_of_branch"] = (cluster["total_fee_used"] / total_branch_usage * 100) if total_branch_usage > 0 else 0
            
            return JsonResponse({
                "current_month": current_month,
                "current_year": current_year,
                "total_branch_usage": total_branch_usage,
                "clusters": cluster_data
            })
            
        else:
            # Jika tidak ada branch_id, kembalikan data region seperti sebelumnya
            # Cari bulan & tahun terbaru dari tabel Report
            latest_report = Report.objects.aggregate(latest_time=Max('time'))["latest_time"]

            if not latest_report:
                return JsonResponse({"error": "No report data available"}, status=400)

            latest_month = latest_report.month
            latest_year = latest_report.year

            # Ambil semua user dengan id_role=6
            users = User.objects.filter(id_role=6)

            region_totals = {}

            for user in users:
                id_user = user.id_user
                id_region = user.id_region.id_region if user.id_region else None

                # Ambil total marketing fee per user di bulan terbaru
                total_marketing_fee = (
                    Marketingfee.objects.filter(id_user=id_user)
                    .annotate(month=ExtractMonth('time'), year=ExtractYear('time'))
                    .filter(month=latest_month, year=latest_year)
                    .aggregate(total=Sum('total'))['total'] or 0
                )

                # Ambil total fee yang digunakan dari report di bulan terbaru
                total_fee_sum = (
                    Report.objects.filter(id_user=id_user)
                    .annotate(month=ExtractMonth('time'), year=ExtractYear('time'))
                    .filter(month=latest_month, year=latest_year)
                    .aggregate(total_amount=Sum("amount_used"))["total_amount"] or 0
                )

                # Simpan data per region
                if id_region:
                    if id_region not in region_totals:
                        region_totals[id_region] = {"total_fee_used": 0, "total_marketing_fee": 0}

                    region_totals[id_region]["total_fee_used"] += total_fee_sum
                    region_totals[id_region]["total_marketing_fee"] += total_marketing_fee

            # Hitung persentase total fee per region
            region_percentages = [
                {
                    "id_region": id_region,
                    "total_fee_used": totals["total_fee_used"],
                    "total_marketing_fee": totals["total_marketing_fee"],
                    "percentage_used": (totals["total_fee_used"] / totals["total_marketing_fee"]) * 100 if totals["total_marketing_fee"] != 0 else 0
                }
                for id_region, totals in region_totals.items()
            ]

            return JsonResponse({
                "latest_month": latest_month,
                "latest_year": latest_year,
                "region_overview": region_percentages
            }, safe=False)

    except Exception as e:
        print(f"Error in report_overview: {str(e)}")
        return JsonResponse({
            "error": str(e)
        }, status=500)
