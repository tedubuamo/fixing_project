from django.db.models.functions import ExtractMonth, ExtractYear
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.db.models import Sum
from myapp.models import User, Marketingfee, Report, Recommendation

@csrf_exempt
def user_overview(request, id_user=None):
    month = request.GET.get('month')
    year = request.GET.get('year')

    try:
        user = User.objects.get(id_user=id_user)
        
        # Ambil semua report untuk bulan dan tahun yang dipilih
        reports = Report.objects.filter(
            id_user=id_user,
            time__year=year,
            time__month=getMonthNumber(month)
        ).order_by('time')

        # Debug
        print(f"Found {reports.count()} reports for {month} {year}")
        
        # Hitung total per hari
        daily_totals = {}
        for report in reports:
            date = report.time.strftime('%d %B %Y')
            if date not in daily_totals:
                daily_totals[date] = 0
            daily_totals[date] += report.amount_used
            # Debug
            print(f"Date: {date}, Amount: {report.amount_used}")

        # Format data untuk chart
        monthly_data = {
            'labels': list(daily_totals.keys()) if daily_totals else [f"{month} {year}"],
            'datasets': [{
                'label': 'Total Marketing Fee',
                'data': list(daily_totals.values()) if daily_totals else [0],
                'borderColor': '#FF4B2B',
                'backgroundColor': 'rgba(255, 75, 43, 0.1)',
                'tension': 0.4
            }]
        }

        # Debug
        print("Chart data:", monthly_data)

        marketing = Marketingfee.objects.filter(id_user=id_user)
        report = Report.objects.filter(id_user=id_user)
        recommendation = Recommendation.objects.all()
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

    # Filter dan ekstrak bulan & tahun dari timestamp
    marketing_qs = marketing.annotate(
        month=ExtractMonth('time'),
        year=ExtractYear('time')
    )
    
    report_qs = report.annotate(
        month=ExtractMonth('time'),
        year=ExtractYear('time')
    )

    # Filter berdasarkan bulan dan tahun jika diberikan
    if month and year:
        marketing_qs = marketing_qs.filter(month=int(month), year=int(year))
        report_qs = report_qs.filter(month=int(month), year=int(year))

    # Konversi ke list JSON
    market_data = list(marketing_qs.values("total", "month", "year"))

    recommendations_dict = {
        rec["id_poin"]: rec["recommend"]
        for rec in recommendation.values("id_poin", "recommend")
    }
    
    # Kelompokkan berdasarkan `id_poin` dan jumlahkan `amount_used`
    report_data = list(report_qs.values("id_poin","month","year").annotate(
        total_amount=Sum("amount_used")
    ).order_by("id_poin"))

    if market_data:
        total_marketing_fee = market_data[0]["total"]  
    else:
        total_marketing_fee = 0  
        
    total_fee_sum = sum(report_item['total_amount'] for report_item in report_data)

    if total_marketing_fee != 0:
        total_percentage_fee = total_fee_sum / total_marketing_fee
    else:
        total_percentage_fee = 0  


    for report_item in report_data:
        id_poin = report_item["id_poin"]
        report_item["recommendation"] = recommendations_dict.get(id_poin, 0)

        recommendation_value = report_item["recommendation"]
        if recommendation_value != 0:
            report_item["percentage"] = (report_item["total_amount"] / recommendation_value) * 100
        else:
            report_item["percentage"] = 0  

    return JsonResponse({
        "user_data": {
            "username": user.username,
            "id_user": user.id_user,
            "telp": user.telp,
        },
        "marketing_fee": market_data,
        "report_data": report_data,
        "total_fee": total_fee_sum,
        "percentage_fee": total_percentage_fee,
        "monthlyData": monthly_data  # Tambahkan data untuk chart
    }, safe=False)

def getMonthNumber(month: str) -> int:
    months = {
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
    return months.get(month, 1)  # Default ke Januari jika bulan tidak ditemukan
