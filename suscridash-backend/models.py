import json
import os
from werkzeug.security import generate_password_hash

_db = None
DB_FILE = 'db_simulada.json'

def init_db():
    global _db
    if _db is None:
        if os.path.exists(DB_FILE):
            with open(DB_FILE, 'r') as f:
                _db = json.load(f)
        else:
            _db = {
                'users': [
                    {
                        'id': '1',
                        'email': 'admin@suscridash.cl',
                        'password': 'admin123',
                        'name': 'Administrador',
                        'user_type': 'admin',
                        'created_at': '2023-01-01T00:00:00'
                    },
                    {
                        'id': '2',
                        'email': 'empresa@ejemplo.cl',
                        'password': 'empresa123',
                        'name': 'Empresa Ejemplo',
                        'user_type': 'business',
                        'business_name': 'Mi Empresa SA',
                        'tax_id': '12345678-9',
                        'subscriptions': 8,
                        'status': 'active',
                        'created_at': '2023-05-15T10:30:00'
                    },
                    {
                        'id': '3',
                        'email': 'cliente@ejemplo.cl',
                        'password': 'cliente123',
                        'name': 'Cliente Ejemplo',
                        'user_type': 'customer',
                        'created_at': '2023-06-20T14:15:00'
                    },
                    {
                        'id': '4',
                        'email': 'tech@solutions.cl',
                        'password': 'tech123',
                        'name': 'Tech Solutions',
                        'user_type': 'business',
                        'business_name': 'Tech Solutions SA',
                        'tax_id': '76543210-1',
                        'subscriptions': 12,
                        'status': 'active',
                        'created_at': '2023-07-10T09:45:00'
                    },
                    {
                        'id': '5',
                        'email': 'marketing@digital.cl',
                        'password': 'marketing123',
                        'name': 'Marketing Digital',
                        'user_type': 'business',
                        'business_name': 'Digital Marketing SpA',
                        'tax_id': '98765432-1',
                        'subscriptions': 5,
                        'status': 'pending',
                        'created_at': '2023-08-05T16:20:00'
                    },
                    {
                        'id': '6',
                        'email': 'cloud@services.cl',
                        'password': 'cloud123',
                        'name': 'Cloud Services',
                        'user_type': 'business',
                        'business_name': 'Cloud Services Ltda',
                        'tax_id': '54321678-9',
                        'subscriptions': 3,
                        'status': 'active',
                        'created_at': '2023-09-12T11:10:00'
                }
            ],
            'subscriptions': [
                {
                    'id': '1',
                    'business_id': '2',  # Empresa Ejemplo
                    'customer_id': '3',  # Cliente Ejemplo
                    'plan_id': '1',      # Plan Básico
                    'start_date': '2023-05-15',
                    'renewal_date': '2023-06-15',
                    'status': 'active',
                    'payment_method': 'Visa **** 4242',
                    'monthly_amount': 9900,
                    'created_at': '2023-05-15T10:30:00'
                },
                {
                    'id': '2',
                    'business_id': '2',  # Empresa Ejemplo
                    'customer_id': '6',  # Otro cliente (agregar a users si no existe)
                    'plan_id': '2',      # Plan Premium
                    'start_date': '2023-04-10',
                    'renewal_date': '2023-06-10',
                    'status': 'active',
                    'payment_method': 'Mastercard **** 5555',
                    'monthly_amount': 19900,
                    'created_at': '2023-04-10T14:15:00'
                },
                {
                    'id': '3',
                    'business_id': '2',  # Empresa Ejemplo
                    'customer_id': '7',  # Otro cliente (agregar a users si no existe)
                    'plan_id': '1',      # Plan Básico
                    'start_date': '2023-01-20',
                    'renewal_date': '2023-07-20',
                    'status': 'cancelled',
                    'payment_method': 'Transferencia bancaria',
                    'monthly_amount': 9900,
                    'created_at': '2023-01-20T09:45:00'
                }
            ],
                # En la función init_db(), agregar esto al diccionario _db:
            'subscription_plans': [
                    {
                        'id': '1',
                        'business_id': '2',  # Empresa Ejemplo
                        'nombre': "Plan Básico",
                        'precio': 9900,
                        'moneda': "CLP",
                        'periodo': "mes",
                        'descripcion': "Acceso básico a las funcionalidades",
                        'caracteristicas': ["Soporte por email", "Acceso básico"],
                        'estado': "activo",
                        'created_at': '2023-01-01T00:00:00'
                    },
                    {
                        'id': '2',
                        'business_id': '2',  # Empresa Ejemplo
                        'nombre': "Plan Premium",
                        'precio': 19900,
                        'moneda': "CLP",
                        'periodo': "mes",
                        'descripcion': "Acceso completo con soporte prioritario",
                        'caracteristicas': ["Soporte 24/7", "Acceso completo", "Actualizaciones"],
                        'estado': "activo",
                        'created_at': '2023-01-01T00:00:00'
                    }
                ],
                'system_settings': {
                    'system_name': 'Suscridash',
                    'currency': 'CLP',
                    'logo_url': '',
                    'session_timeout': 30,  # minutos
                    'email_notifications': True,
                    'app_notifications': True,
                    'created_at': '2023-01-01T00:00:00',
                    'updated_at': '2023-01-01T00:00:00'
                }
            }
            save_db()   

def save_db():
    with open(DB_FILE, 'w') as f:
        json.dump(_db, f, indent=2)

def get_db():
    if _db is None:
        init_db()
    return _db