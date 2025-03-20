from django.contrib import admin
from django.urls import path
from .views.user_registry import user_login, user_register, get_csrf_token, send_otp, check_status
from .views.user_overview import user_overview
from .views.user_cluster_evidence import user_cluster_evidence
from .views.admin_cluster import cluster
from .views.admin_branch import branch
from .views.admin_region import region
from .views.admin_area import area
from .views.marketingfee import marketingfee, recommendation, get_marketing_fee, get_monthly_marketing_fee, submit_marketing_fee
from .views.report import create_report, delete_report
from .views.approve import batch_approve_reports
from .views.locations import get_areas, get_regions, get_branches, get_clusters
from .views.user_dashboard import user_dashboard
from .views.admin_area_dashboard import admin_area_dashboard
from .views.admin_region_dashboard import admin_region_dashboard
from .views.admin_branch_dashboard import admin_branch_dashboard
from .views.admin_cluster_dashboard import admin_cluster_dashboard
from .views.poin_types import get_poin_types
from .views.get_cluster_user import get_cluster_user
from .views.percentage_overview import report_overview
from .views.admin_cluster_dashboard import get_cluster_dashboard
from .views.admin_cluster_branch import admin_cluster_branch_dashboard, check_cluster_access
from .views import admin_cluster_region
from .views.user_evidence import user_evidence
from .views.recommendations import create_recommendation, get_recommendation
from .views.show_image import get_image

urlpatterns = [
    # register api for user (SBP)
    path('csrf-token/', get_csrf_token, name='get_csrf_token'),
    path('api/user-register/', user_register, name='user_register'),
    path('api/user-register/send-otp/<str:no_telp>', send_otp, name="send-otp"),
    path('api/user-register/status-otp/<str:no_telp>', check_status, name="status-otp"),

    # login api for users
    path('api/user-login/', user_login, name='user_login'),
    path('admin/', admin.site.urls),

    # overview & evidence page api for user
    path('api/user-overview/<str:id_user>/', user_overview, name="user_overview"),
    path('api/user-evidence/<str:id_user>/<str:id_poin>/', user_cluster_evidence, name='user_cluster_evidence'),

    # Pindahkan dashboard pattern ke atas
    path('api/admin/cluster/<str:cluster_id>/dashboard', admin_cluster_dashboard, name='admin_cluster_dashboard'),
    
    # Pattern untuk cluster operations
    path('api/admin/cluster/<int:id_cluster>/', cluster, name='admin_cluster'),
    path('api/admin/cluster/<str:id_cluster>/<str:id_poin>', cluster, name="cluster_poin"),

    path('api/admin/branch/<str:id_branch>/', branch, name='branch'),
    path('api/admin/branch/<str:id_branch>/cluster/<str:id_cluster>/<str:id_poin>', branch, name='branch-list'),
    
    path('api/admin/region/<str:id_region>/', region, name='region'),
    path('api/admin/region/<str:id_region>/branch/<str:id_branch>/', region, name='region'),
    path('api/admin/region/<str:id_region>/branch/<str:id_branch>/cluster/<str:id_cluster>/<str:id_poin>', region, name='region'),
    
    path('api/admin/area/<str:id_area>/', area, name='area'),
    
    # marketingfee
    path('api/marketingfee/<int:id_user>/', marketingfee, name='marketingfee'),
    path('api/marketingfee/recommendation/<int:id_user>/', recommendation, name='recommendation'),
    path('api/marketing-fee/<int:user_id>/', get_marketing_fee, name='get_marketing_fee'),
    path('api/marketing-fee/monthly/<int:user_id>/', get_monthly_marketing_fee, name='get_monthly_marketing_fee'),
    
    # report
    path('api/report/create/', create_report, name='create_report'),
    path('api/report/delete/<int:report_id>/', delete_report, name='delete_report'),  
    path('api/report/overview/', report_overview, name='report_overview'),
    
    #approved
    path('api/approve/', batch_approve_reports, name='approve_reports'),

    path('api/locations/areas/', get_areas, name='get_areas'),
    path('api/locations/regions/<str:area_id>/', get_regions, name='get_regions'),
    path('api/locations/branches/<str:region_id>/', get_branches, name='get_branches'),
    path('api/locations/clusters/<str:branch_id>', get_clusters, name='get_clusters'),
    path('api/locations/clusters/<str:branch_id>/', get_clusters, name='get_clusters_with_slash'),

    path('api/user-dashboard/<int:user_id>/', user_dashboard),
    path('api/admin/area/dashboard/', admin_area_dashboard),
    path('api/admin/regions/<int:region_id>/dashboard/', admin_region_dashboard, name='admin_region_dashboard'),
    path('api/admin/branches/<str:branch_id>/dashboard', admin_branch_dashboard, name='admin_branch_dashboard'),
    path('api/admin/branches/<str:branch_id>/dashboard/', admin_branch_dashboard, name='admin_branch_dashboard_with_slash'),
    path('api/admin/clusters/<int:cluster_id>/dashboard/', admin_cluster_dashboard),

    path('api/poin-types', get_poin_types, name='get_poin_types'),
    path('api/poin-types/', get_poin_types, name='get_poin_types_slash'),
    path('api/admin/cluster-user/<int:cluster_id>', get_cluster_user, name='get_cluster_user'),
    path('api/admin/clusters/<str:cluster_id>/dashboard/', get_cluster_dashboard, name='get_cluster_dashboard'),

    path('api/admin/branch/clusters/<str:cluster_id>/dashboard', 
         admin_cluster_branch_dashboard, 
         name='admin_cluster_branch_dashboard'),

    path('api/admin/clusters/<int:cluster_id>/dashboard/', 
         admin_cluster_dashboard,
         name='admin_cluster_dashboard'),

    path('api/admin/region/branch/<str:branch_id>/clusters/<str:cluster_id>/check-access',
         admin_cluster_region.check_cluster_access_region,
         name='check_cluster_access_region'),
    path('api/admin/region/branch/<str:branch_id>/clusters/<str:cluster_id>/check-access/',
         admin_cluster_region.check_cluster_access_region,
         name='check_cluster_access_region'),

    path('api/admin/region/clusters/<int:cluster_id>/dashboard',  # Tanpa trailing slash
         admin_cluster_region.admin_cluster_region_dashboard,
         name='admin_cluster_region_dashboard'),

    path('api/admin/region/clusters/<int:cluster_id>/dashboard/',  # Dengan trailing slash 
         admin_cluster_region.admin_cluster_region_dashboard,
         name='admin_cluster_region_dashboard'),

    path('api/admin/get/user-evidence/<str:id_cluster>/<str:id_poin>/', 
         user_evidence, 
         name='user_evidence'),

    path('api/admin/branch/<str:branch_id>/clusters/check-access/<str:cluster_id>/',
         check_cluster_access,
         name='check_cluster_access'),

    # Admin Area Dashboard Endpoints
    path('api/admin/area/<str:id_area>/dashboard',  # Tanpa trailing slash
         admin_area_dashboard,
         name='admin_area_dashboard'),
    
    path('api/admin/area/<str:id_area>/dashboard/',  # Dengan trailing slash
         admin_area_dashboard,
         name='admin_area_dashboard'),

    path('api/recommendations/create', create_recommendation, name='create_recommendation'),
    path('api/recommendations/<str:cluster_id>/<str:poin_id>', get_recommendation, name='get_recommendation'),

    path('api/marketing-fee/submit', submit_marketing_fee, name='submit_marketing_fee'),
    
    path('api/show-image', get_image, name='get_image'),
]