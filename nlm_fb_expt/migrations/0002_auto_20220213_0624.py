# Generated by Django 3.1.1 on 2022-02-13 06:24

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('nlm_fb_expt', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='trial',
            old_name='answer',
            new_name='correct_answer',
        ),
    ]