from django.http import JsonResponse
from django.db.models import Sum, F
from django.views.decorators.csrf import csrf_exempt
from myapp.models import Report, Recommendation
from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import datetime

@csrf_exempt
def user_cluster_evidence(request, id_user=None, id_poin=None):
    try:
        month = request.GET.get('month')
        year = request.GET.get('year')
        
        print(f"Backend received: user={id_user}, poin={id_poin}, month={month}, year={year}")

        # Konversi month ke integer
        try:
            month = int(month) if month else datetime.now().month
            year = int(year) if year else datetime.now().year
        except ValueError as e:
            return JsonResponse({
                "error": f"Invalid month/year format: {str(e)}",
                "status": "error"
            })

        # Query data
        report_query = Report.objects.filter(
            id_user_id=id_user,
            id_poin_id=id_poin
        )

        if month and year:
            report_query = report_query.filter(
                time__month=month,
                time__year=year
            )

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

        # Query untuk Recommendation
        query_recommendation = list(
            Recommendation.objects.filter(id_user=id_user, id_poin_id=id_poin)
            .annotate(type=F("id_poin_id__type"))  
            .values("type", "id_user_id", "recommend")
        )

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
            # Cari data recommendation yang sesuai dengan type
            recommendation = next(
                (rec for rec in query_recommendation if rec["type"] == total["type"]), 
                None
            )
            # Hitung persentase jika recommendation ditemukan
            if recommendation and recommendation["recommend"]:
                total["recommend"] = recommendation["recommend"]
                total["percentage"] = round((total["total_amount"] / recommendation["recommend"]) * 100, 2)
            else:
                total["recommend"] = 0
                total["percentage"] = 0.00  # Default jika tidak ada recommendation atau recommend == 0

        return JsonResponse({
            "data_report": query_report,
            "data_recommendation": query_recommendation,
            "total_amount": total_amount,
            "status": "success"
        }, safe=False)

    except Exception as e:
        print(f"Error in user_cluster_evidence: {str(e)}")
        return JsonResponse({
            "error": str(e),
            "status": "error"
        }, status=500)

@api_view(['GET'])
def cluster_evidence_with_poin(request, id_user, id_poin):
    try:
        # Ambil parameter month dan year dari query
        month = request.GET.get('month')
        year = request.GET.get('year')

        # Base query dengan filter waktu
        reports = Report.objects.filter(
            id_user=id_user,
            id_poin=id_poin,
            time__month=month,
            time__year=year
        )

        # Proses data seperti sebelumnya
        # ... kode yang sudah ada ...

        return Response(response_data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

    