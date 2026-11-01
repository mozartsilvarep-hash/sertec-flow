from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('billing', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='payment',
            name='provider_updated_at',
            field=models.DateTimeField(null=True),
        ),
    ]
