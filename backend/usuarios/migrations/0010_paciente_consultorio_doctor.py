from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('usuarios', '0009_remove_resultadoprueba_usuario_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='paciente',
            name='consultorio_doctor',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='pacientes_consultorio', to=settings.AUTH_USER_MODEL),
        ),
    ]
