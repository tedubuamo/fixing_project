from django.http import JsonResponse
from django.db.models import Sum, F
from django.views.decorators.csrf import csrf_exempt
from myapp.models import Report, Recommendation, User
from datetime import datetime

@csrf_exempt
def user_evidence(request, id_cluster, id_poin):
    try:
        # Get month dan year dari query params
        month = request.GET.get('month')
        year = request.GET.get('year')
        
        print(f"Backend received: cluster={id_cluster}, poin={id_poin}, month={month}, year={year}")

        # Konversi month ke integer dan set default ke bulan sekarang jika tidak ada
        try:
            month = int(month) if month else datetime.now().month
            year = int(year) if year else datetime.now().year
        except ValueError as e:
            return JsonResponse({
                "error": f"Invalid month/year format: {str(e)}",
                "status": "error"
            })

        # Get user dari cluster
        try:
            user = User.objects.get(id_cluster=id_cluster, id_role=6)
        except User.DoesNotExist:
            return JsonResponse({
                "error": f"No user found for cluster {id_cluster}",
                "status": "error"
            }, status=404)

        # Query data dengan filter bulan dan tahun
        report_query = Report.objects.filter(
            id_user=user.id_user,
            id_poin_id=id_poin
        )

        # Terapkan filter bulan dan tahun
        if month and year:
            report_query = report_query.filter(
                time__month=month,
                time__year=year
            )

        print(f"Querying reports for month={month}, year={year}")
        print(f"Found {report_query.count()} reports")

        # Query untuk Report dengan detail
        query_report = list(
            report_query
            .annotate(type=F("id_poin_id__type"))
            .values(
                "type",
                "id_user",
                "description",
                "amount_used",
                "time",
                "image_url"
            )
        )

        print(f"Found {len(query_report)} reports")

        # Debug prints
        print(f"Querying recommendation with params:")
        print(f"- user.id_user: {user.id_user}")
        print(f"- id_poin: {id_poin}")
        print(f"- month: {month}")
        print(f"- year: {year}")

        # Query untuk Recommendation
        query_recommendation = list(
            Recommendation.objects.filter(
                id_user=user.id_user, 
                id_poin_id=id_poin,
                time__month=month,
                time__year=year
            )
            .annotate(type=F("id_poin_id__type"))  
            .values("type", "id_user_id", "recommend", "time")
        )

        # Debug prints
        print(f"Raw recommendation query: {Recommendation.objects.filter(id_user=user.id_user, id_poin_id=id_poin, time__month=month, time__year=year).query}")
        print(f"Found recommendations: {query_recommendation}")

        # Menghitung total_amount berdasarkan type dengan filter waktu yang sama
        total_amount = list(
            report_query
            .annotate(type=F("id_poin_id__type"))
            .values("type")
            .annotate(total_amount=Sum("amount_used"))
            .values("type", "total_amount")
        )

        # Gabungkan total_amount dengan data dari Recommendation untuk menghitung persentase
        for total in total_amount:
            recommendation = next(
                (rec for rec in query_recommendation if rec["type"] == total["type"]), 
                None
            )
            if recommendation and recommendation["recommend"]:
                total["recommend"] = recommendation["recommend"]
                total["percentage"] = round((total["total_amount"] / recommendation["recommend"]) * 100, 2)
            else:
                total["recommend"] = 0
                total["percentage"] = 0.00

        return JsonResponse({
            "data_report": query_report,
            "data_recommendation": query_recommendation,  # Sekarang termasuk data time
            "total_amount": total_amount,
            "status": "success"
        }, safe=False)

    except Exception as e:
        print(f"Error in user_evidence: {str(e)}")
        return JsonResponse({
            "error": str(e),
            "status": "error"
        }, status=500)