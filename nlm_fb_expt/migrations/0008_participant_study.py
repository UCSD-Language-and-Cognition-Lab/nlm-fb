# Generated by Django 3.1.1 on 2022-03-04 18:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('nlm_fb_expt', '0007_auto_20220304_1834'),
    ]

    operations = [
        migrations.AddField(
            model_name='participant',
            name='study',
            field=models.CharField(default='', max_length=80),
            preserve_default=False,
        ),
    ]