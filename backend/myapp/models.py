from django.db import models


class Area(models.Model):
    id_area = models.BigAutoField(primary_key=True)
    area = models.CharField()

    class Meta:
        managed = False
        db_table = 'Area'
        app_label = "myapp"


class Branch(models.Model):
    id_branch = models.BigAutoField(primary_key=True)
    branch = models.CharField()
    id_region = models.ForeignKey('Region', models.DO_NOTHING, db_column='id_region', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Branch'
        app_label = "myapp"


class Cluster(models.Model):
    id_cluster = models.BigAutoField(primary_key=True)
    cluster = models.CharField(max_length=255)
    id_branch = models.ForeignKey(Branch, models.DO_NOTHING, db_column='id_branch', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Cluster'
        app_label = "myapp"


class Marketingfee(models.Model):
    id = models.BigAutoField(primary_key=True)
    id_user = models.ForeignKey('User', models.DO_NOTHING, db_column='id_user', blank=True, null=True)
    id_cluster = models.ForeignKey('Cluster', models.DO_NOTHING, db_column='id_cluster', blank=True, null=True)
    time = models.DateTimeField(blank=True, null=True)
    total = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'MarketingFee'
        app_label = "myapp"


class Poin(models.Model):
    id_poin = models.BigAutoField(primary_key=True)
    type = models.CharField()

    class Meta:
        managed = False
        db_table = 'Poin'
        app_label = "myapp"


class Recommendation(models.Model):
    id = models.BigAutoField(primary_key=True)
    id_user = models.ForeignKey('User', models.DO_NOTHING, db_column='id_user', blank=True, null=True)
    id_poin = models.ForeignKey(Poin, models.DO_NOTHING, db_column='id_poin', blank=True, null=True)
    time = models.DateTimeField(blank=True, null=True)
    recommend = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Recommendation'
        app_label = "myapp"


class Region(models.Model):
    id_region = models.BigAutoField(primary_key=True)
    region = models.CharField()
    id_area = models.ForeignKey(Area, models.DO_NOTHING, db_column='id_area', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Region'
        app_label = "myapp"


class Report(models.Model):
    id = models.BigAutoField(primary_key=True)
    id_user = models.ForeignKey('User', models.DO_NOTHING, db_column='id_user', blank=True, null=True)
    id_poin = models.ForeignKey(Poin, models.DO_NOTHING, db_column='id_poin', blank=True, null=True)
    description = models.CharField(max_length=255, blank=True, null=True)
    amount_used = models.FloatField(blank=True, null=True)
    image_url = models.CharField(max_length=255, blank=True, null=True)
    time = models.DateTimeField(blank=True, null=True)
    status = models.BooleanField()
    approved_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'Report'
        app_label = "myapp"


class Role(models.Model):
    id_role = models.BigAutoField(primary_key=True)
    role = models.CharField()

    class Meta:
        managed = False
        db_table = 'Role'
        app_label = "myapp"


class User(models.Model):
    id_user = models.BigIntegerField(primary_key=True)
    email = models.CharField(unique=True, max_length=255)
    password = models.CharField(max_length=255)
    username = models.CharField(unique=True, max_length=255)
    telp = models.CharField(blank=True, null=True)
    id_cluster = models.ForeignKey(Cluster, models.DO_NOTHING, db_column='id_cluster', blank=True, null=True)
    id_branch = models.ForeignKey(Branch, models.DO_NOTHING, db_column='id_branch', blank=True, null=True)
    id_role = models.ForeignKey(Role, models.DO_NOTHING, db_column='id_role', blank=True, null=True)
    id_region = models.ForeignKey(Region, models.DO_NOTHING, db_column='id_region', blank=True, null=True)
    id_area = models.ForeignKey(Area, models.DO_NOTHING, db_column='id_area', blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'User'
        app_label = "myapp"


class AuthGroup(models.Model):
    name = models.CharField(unique=True, max_length=150)

    class Meta:
        managed = False
        db_table = 'auth_group'


class AuthGroupPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)
    permission = models.ForeignKey('AuthPermission', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_group_permissions'
        unique_together = (('group', 'permission'),)


class AuthPermission(models.Model):
    name = models.CharField(max_length=255)
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING)
    codename = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'auth_permission'
        unique_together = (('content_type', 'codename'),)


class AuthUser(models.Model):
    password = models.CharField(max_length=128)
    last_login = models.DateTimeField(blank=True, null=True)
    is_superuser = models.BooleanField()
    username = models.CharField(unique=True, max_length=150)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.CharField(max_length=254)
    is_staff = models.BooleanField()
    is_active = models.BooleanField()
    date_joined = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auth_user'


class AuthUserGroups(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    group = models.ForeignKey(AuthGroup, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_groups'
        unique_together = (('user', 'group'),)


class AuthUserUserPermissions(models.Model):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)
    permission = models.ForeignKey(AuthPermission, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'auth_user_user_permissions'
        unique_together = (('user', 'permission'),)


class DjangoAdminLog(models.Model):
    action_time = models.DateTimeField()
    object_id = models.TextField(blank=True, null=True)
    object_repr = models.CharField(max_length=200)
    action_flag = models.SmallIntegerField()
    change_message = models.TextField()
    content_type = models.ForeignKey('DjangoContentType', models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(AuthUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'django_admin_log'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    id = models.BigAutoField(primary_key=True)
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'