# Generated by Django 5.1.6 on 2025-03-20 06:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('library', '0011_remove_book_id_alter_book_isbn'),
    ]

    operations = [
        migrations.AddField(
            model_name='book',
            name='due_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
