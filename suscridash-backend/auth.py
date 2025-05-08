from werkzeug.security import generate_password_hash, check_password_hash
import uuid

# Importamos db después de definir las funciones para evitar circularidad
from models import get_db, save_db

def authenticate_user(email, password, user_type):
    db = get_db()
    
    # Buscar usuario por email y tipo
    user = None
    for u in db['users']:
        if u['email'] == email and u['user_type'] == user_type:
            user = u
            break
    
    if not user or user['password'] != password:
        return None
    
    return user

def register_user(user_data):
    db = get_db()
    
    # Verificar si el usuario ya existe
    for user in db['users']:
        if user['email'] == user_data['email'] and user['user_type'] == user_data['user_type']:
            raise ValueError('El usuario ya existe')
    
    # Crear nuevo usuario
    new_user = {
        'id': str(uuid.uuid4()),
        'email': user_data['email'],
        'password': user_data['password'],  # O usar generate_password_hash para producción
        'name': user_data['name'],
        'user_type': user_data['user_type']
    }
    
    if user_data['user_type'] == 'business':
        new_user['business_name'] = user_data['business_name']
        new_user['tax_id'] = user_data['tax_id']
    
    db['users'].append(new_user)
    save_db()  # Guarda los cambios en el archivo
    return new_user

def get_current_user(user_id):
    db = get_db()
    for user in db['users']:
        if user['id'] == user_id:
            return user
    return None