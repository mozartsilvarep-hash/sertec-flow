import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Customer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('workspace_id', models.UUIDField(blank=True, null=True, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Order',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('plan', models.CharField(choices=[('monthly', 'Mensal'), ('annual', 'Anual')], max_length=12)),
                ('method', models.CharField(choices=[('pix', 'Pix'), ('card', 'Cartão')], max_length=12)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('provider_id', models.CharField(blank=True, max_length=128, null=True, unique=True)),
                ('checkout_url', models.URLField(blank=True, max_length=1000)),
                ('status', models.CharField(default='pending', max_length=32)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('customer', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='orders', to='billing.customer')),
            ],
        ),
        migrations.CreateModel(
            name='Payment',
            fields=[
                ('provider_id', models.CharField(max_length=128, primary_key=True, serialize=False)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('refunded_amount', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('status', models.CharField(max_length=32)),
                ('paid_at', models.DateTimeField(null=True)),
                ('access_until', models.DateTimeField(null=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('order', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='payments', to='billing.order')),
            ],
        ),
    ]
