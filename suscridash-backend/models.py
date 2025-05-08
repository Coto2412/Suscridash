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
                    'password': 'admin123',  # admin123
                    'name': 'Administrador',
                    'user_type': 'admin'
                },
                {
                    'id': '2',
                    'email': 'empresa@ejemplo.cl',
                    'password': 'empresa123',  # empresa123
                    'name': 'Empresa Ejemplo',
                    'user_type': 'business',
                    'business_name': 'Mi Empresa SA',
                    'tax_id': '12345678-9'
                },
                {
                    'id': '3',
                    'email': 'cliente@ejemplo.cl',
                    'password': 'cliente123',  # cliente123
                    'name': 'Cliente Ejemplo',
                    'user_type': 'customer'
                }
            ]
        }
        save_db()

def save_db():
    with open(DB_FILE, 'w') as f:
        json.dump(_db, f, indent=2)

def get_db():
    if _db is None:
        init_db()
    return _db