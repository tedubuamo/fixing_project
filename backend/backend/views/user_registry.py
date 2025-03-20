from django.views.decorators.csrf import csrf_exempt
from django.middleware.csrf import get_token
from django.core.cache import cache
from django.http import JsonResponse
from dotenv import load_dotenv
from twilio.rest import Client
from myapp.models import User, Region, Branch, Cluster, Role, Area
import regex as re
import json
import os
import bcrypt
import jwt
import datetime

load_dotenv() 

def get_csrf_token(request):
    token = get_token(request)
    return JsonResponse({"csrftoken":token})


@csrf_exempt
def send_otp(request, no_telp):
    account_sid = os.getenv('account_sid')
    auth_token = os.getenv('auth_token')
    service_id = os.getenv('service_id')
    client = Client(account_sid, auth_token)

    verification = client.verify.services(service_id).verifications.create( 
        to=no_telp,
        channel="sms")

    return JsonResponse(f"OTP sent to {no_telp}. Status: {verification.status}", safe=False)

@csrf_exempt
def check_status(request, no_telp, code_otp):
    account_sid = os.getenv('account_sid')
    auth_token = os.getenv('auth_token')
    service_id = os.getenv('service_id')
    client = Client(account_sid, auth_token)

    verification_check = client.verify.services(service_id).verification_checks.create(
    to=no_telp,
    code=code_otp)

    return verification_check.status

@csrf_exempt
def user_login(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')

        # Validasi input
        if not username or not password:
            return JsonResponse({
                'error': 'Username dan password harus diisi'
            }, status=400)

        # Cari user
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return JsonResponse({
                'error': 'Username atau password salah'
            }, status=401)

        # Cek apakah password dalam format bcrypt
        is_bcrypt = user.password.startswith('$2b$') or user.password.startswith('$2a$')

        # Verifikasi password
        password_valid = False
        if is_bcrypt:
            # Password sudah dalam format bcrypt
            try:
                password_valid = bcrypt.checkpw(
                    password.encode('utf-8'), 
                    user.password.encode('utf-8')
                )
            except Exception as e:
                print(f"Bcrypt error: {str(e)}")
                password_valid = False
        else:
            # Password lama (plain text), verifikasi langsung
            password_valid = (user.password == password)
            if password_valid:
                # Update ke bcrypt hash
                hashed_password = bcrypt.hashpw(
                    password.encode('utf-8'), 
                    bcrypt.gensalt()
                ).decode('utf-8')
                user.password = hashed_password
                user.save()

        if not password_valid:
            return JsonResponse({
                'error': 'Username atau password salah'
            }, status=401)

        # Tentukan role berdasarkan id_user
        user_id = user.id_user
        user_role = None
        if 1000 <= user_id < 2000:
            user_role = 'admin_area'
        elif 2000 <= user_id < 3000:
            user_role = 'admin_region'
        elif 3000 <= user_id < 4000:
            user_role = 'admin_branch'
        elif 4000 <= user_id < 5000:
            user_role = 'admin_cluster_mcot'
        elif 5000 <= user_id < 6000:
            user_role = 'admin_cluster_gm'
        elif user_id >= 6000:
            user_role = 'user_cluster'
        else:
            user_role = 'unknown'

        # Generate token dengan role
        token = jwt.encode({
            'user_id': user.id_user,
            'username': user.username,
            'role': user_role,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, os.getenv('SECRET_KEY'), algorithm='HS256')

        # Prepare response data
        user_data = {
            'id': user.id_user,
            'username': user.username,
            'email': user.email,
            'role': user_role,
            'cluster': user.id_cluster.id_cluster if user.id_cluster else None,
            'branch': user.id_branch.id_branch if user.id_branch else None,
            'region': user.id_region.id_region if user.id_region else None,
            'area': user.id_area.id_area if user.id_area else None,
            'permissions': {
                'can_view_area': user_role in ['admin_area'],
                'can_view_region': user_role in ['admin_area', 'admin_region'],
                'can_view_branch': user_role in ['admin_area', 'admin_region', 'admin_branch'],
                'can_view_cluster': user_role in ['admin_area', 'admin_region', 'admin_branch', 
                                                'admin_cluster_mcot', 'admin_cluster_gm'],
                'is_admin': user_role != 'user_cluster'
            }
        }

        response = JsonResponse({
            'status': 'Success',
            'user': user_data,
            'token': token
        })

        response.set_cookie(
            'auth_token',
            token,
            httponly=True,
            secure=True,
            samesite='Lax',
            max_age=24 * 60 * 60  # 24 hours
        )

        print(f"User {username} logged in successfully with role {user_role}")
        return response

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        print('Login error:', str(e))
        return JsonResponse({'error': 'Internal server error'}, status=500)

@csrf_exempt
def user_register(request):
    print("Received register request")  # Debug log
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            print("Received data:", data)  # Debug log
            
            username = data.get('username')
            email = data.get('email')
            no_telp = data.get('no_telp')
            password_input = data.get('password')
            confirm_password = data.get('confirm_password')
            region_id = data.get('region')
            branch_id = data.get('branch')
            cluster_id = data.get('cluster')
            area_id = data.get('area')
            role_id = 6  # ID untuk user cluster

            # Validasi input
            if not all([username, email, password_input, confirm_password, no_telp, 
                       region_id, branch_id, cluster_id, area_id]):
                return JsonResponse({
                    "error": "Semua field harus diisi",
                    "status": "Failed"
                }, status=400)

            # Validasi password
            if password_input != confirm_password:
                return JsonResponse({
                    "error": "Password and Confirm Password must be the same.",
                    "status": "Failed"
                }, status=400)

            try:
                # Cek apakah username sudah ada
                if User.objects.filter(username=username).exists():
                    return JsonResponse({
                        "error": "Username sudah digunakan.",
                        "status": "Failed"
                    }, status=400)

                # Cek apakah email sudah ada
                if User.objects.filter(email=email).exists():
                    return JsonResponse({
                        "error": "Email sudah digunakan.",
                        "status": "Failed"
                    }, status=400)

                # Cek apakah cluster sudah memiliki user (bukan admin)
                existing_user = User.objects.filter(
                    id_cluster_id=cluster_id,
                    id_role_id=6
                ).exists()

                if existing_user:
                    return JsonResponse({
                        "error": "Cluster ini sudah memiliki user.",
                        "status": "Failed"
                    }, status=400)

                # Generate user ID
                user_id_key = 6001
                while User.objects.filter(id_user=user_id_key).exists():
                    user_id_key += 1

                # Hash password sebelum disimpan
                hashed_password = bcrypt.hashpw(
                    password_input.encode('utf-8'), 
                    bcrypt.gensalt()
                ).decode('utf-8')

                # Create new user
                user = User.objects.create(
                    id_user=user_id_key,
                    username=username,
                    email=email,
                    password=hashed_password,  # Gunakan password yang sudah di-hash
                    telp=no_telp,
                    id_cluster_id=int(cluster_id),  # Pastikan tipe data integer
                    id_branch_id=int(branch_id),
                    id_region_id=int(region_id),
                    id_role_id=role_id,
                    id_area_id=int(area_id)
                )
                
                print(f"User created successfully: {user.username}")  # Debug log
                
                return JsonResponse({
                    "message": "Registrasi berhasil!",
                    "status": "Success",
                    "username": username
                }, status=201)

            except Exception as e:
                print(f"Error creating user: {str(e)}")  # Debug log
                return JsonResponse({
                    "error": f"Gagal membuat user: {str(e)}",
                    "status": "Failed"
                }, status=500)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            print('Register error:', str(e))
            return JsonResponse({'error': 'Internal server error'}, status=500)

    return JsonResponse({"error": "Method not allowed"}, status=405)

@csrf_exempt
def user_verify(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        code_otp = data.get("code_otp")
        cache_user_data = cache.get('+xxxxxxxxxxxxxx')
        verif = check_status(request,cache_user_data.get('no_telp'),code_otp)
        
        if verif == 'approved':
            user_id_key = 6001
            while User.objects.filter(id_user=user_id_key).exists():
                user_id_key += 1

            user = User.objects.create(
                id_user = user_id_key,
                email= cache_user_data.get('email'),
                password = cache_user_data('password'),
                username= cache_user_data('username'),
                telp= cache_user_data('no_telp'),
                id_cluster=  cache_user_data('cluster'),
                id_branch=cache_user_data('branch'),
                id_region=cache_user_data('region'),
                id_role=cache_user_data('role'),
                id_area=cache_user_data('area'))
            
            user.save(force_insert=True)

            return JsonResponse({"mess":"sucess to login"})
