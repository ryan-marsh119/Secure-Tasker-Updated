from rest_framework.test import APITestCase

# Create your tests here.

class SecretDataTest(APITestCase):
    
    def test_print_statement(self):
        print("Hello from secret_data app tests.py file! Pizza is good!!")
        self.assertTrue(True)

    def test_new(self):
        print("HEEEEELP!!!!")
        self.assertTrue(True)