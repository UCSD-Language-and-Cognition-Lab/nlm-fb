# Generated by Django 3.1.1 on 2022-02-13 07:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('nlm_fb_expt', '0002_auto_20220213_0624'),
    ]

    operations = [
        migrations.AddField(
            model_name='participant',
            name='key',
            field=models.CharField(default='', max_length=80),
            preserve_default=False,
        ),
    ]
