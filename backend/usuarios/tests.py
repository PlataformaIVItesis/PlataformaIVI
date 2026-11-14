from django.contrib.auth.models import User
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Paciente, ResultadoPrueba, TipoPrueba


class DoctorPatientWorkflowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.doctor = User.objects.create_user(username='doctor_test')
        self.doctor.profile.role = 'doctor'
        self.doctor.profile.save(update_fields=['role'])
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer token_{self.doctor.id}_{self.doctor.username}')

    def create_patient(self, username, ci, *, age=None, office=False, doctor=None):
        user = User.objects.create_user(username=username)
        profile = user.profile
        profile.role = 'paciente'
        profile.save(update_fields=['role'])
        patient = Paciente.objects.create(profile=profile)
        patient.ci = ci
        patient.age = age
        patient.is_office_patient = office
        patient.consultorio_doctor = doctor or self.doctor
        patient.save()
        return user, patient

    def test_office_patient_creation_persists_age_and_shows_it_in_doctor_list(self):
        self.create_patient('not_office_patient', '98123457', age=15, office=False)
        response = self.client.post('/api/doctor/consultorio/', {
            'name': 'Paciente de prueba',
            'ci': '98123456',
            'age': 12,
        }, format='json')

        self.assertEqual(response.status_code, 200, response.data)
        patient_data = response.data['patient']
        self.assertEqual(patient_data['age'], 12)

        listing = self.client.get('/api/doctor/?office=1')
        self.assertEqual(listing.status_code, 200, listing.data)
        self.assertEqual(len(listing.data), 1)
        self.assertEqual(listing.data[0]['paciente_edad'], 12)
        self.assertEqual(listing.data[0]['paciente_ci'], '98123456')

    def test_patient_signup_persists_age_in_patient_record(self):
        response = self.client.post('/api/signup/', {
            'username': 'registered_patient',
            'email': 'registered@example.com',
            'password': 'SecurePass123!',
            'first_name': 'Paciente',
            'last_name': 'Registrado',
            'ci': '76543210',
            'age': 17,
            'role': 'user',
        }, format='json')

        self.assertEqual(response.status_code, 201, response.data)
        patient_user = User.objects.get(username='registered_patient')
        self.assertEqual(patient_user.profile.paciente.age, 17)
        self.assertEqual(response.data['user']['age'], 17)

    def test_delete_removes_assigned_patient_and_all_results(self):
        user, patient = self.create_patient('patient_to_delete', '12344321', age=9, office=True)
        test_type, _created = TipoPrueba.objects.get_or_create(
            codigo='alfabeto', defaults={'nombre': 'Alfabeto'}
        )
        ResultadoPrueba.objects.create(paciente=patient, prueba=test_type, puntaje=82)

        response = self.client.delete(f'/api/doctor/patients/{user.id}/results/')

        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data['deleted_results'], 1)
        self.assertFalse(User.objects.filter(id=user.id).exists())
        self.assertFalse(ResultadoPrueba.objects.filter(paciente_id=patient.id).exists())

    def test_doctor_cannot_delete_patient_assigned_to_another_doctor(self):
        other_doctor = User.objects.create_user(username='other_doctor')
        other_doctor.profile.role = 'doctor'
        other_doctor.profile.save(update_fields=['role'])
        user, _patient = self.create_patient('other_patient', '12344322', age=10, doctor=other_doctor)

        response = self.client.delete(f'/api/doctor/patients/{user.id}/results/')

        self.assertEqual(response.status_code, 404)
        self.assertTrue(User.objects.filter(id=user.id).exists())
