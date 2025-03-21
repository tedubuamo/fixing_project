# Generated by Django 4.1.13 on 2025-01-21 06:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0002_authgroup_authgrouppermissions_authpermission_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Branch',
            fields=[
                ('id_branch', models.BigAutoField(primary_key=True, serialize=False)),
                ('branch', models.CharField(max_length=255)),
            ],
            options={
                'db_table': 'Branch',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Cluster',
            fields=[
                ('id_cluster', models.BigAutoField(primary_key=True, serialize=False)),
                ('cluster', models.CharField(max_length=255)),
            ],
            options={
                'db_table': 'Cluster',
                'managed': False,
            },
        ),
        migrations.CreateModel(
            name='Role',
            fields=[
                ('id_role', models.BigAutoField(primary_key=True, serialize=False)),
                ('role', models.CharField(max_length=255)),
            ],
            options={
                'db_table': 'Role',
                'managed': False,
            },
        ),
        migrations.DeleteModel(
            name='Admin',
        ),
    ]
