from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Primero cargar configuración
load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173"],  # Asegúrate que este es el puerto de tu frontend
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Configuración
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)

# Importar después de crear app para evitar circularidad
from models import init_db
from auth import authenticate_user, register_user, get_current_user

# Inicializar base de datos
init_db()

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user_type = data.get('userType', 'customer')
    
    user = authenticate_user(email, password, user_type)
    if not user:
        return jsonify({'error': 'Credenciales inválidas'}), 401
    
    # Crear tokens
    access_token = jwt.encode({
        'user_id': user['id'],
        'email': user['email'],
        'user_type': user['user_type'],
        'exp': datetime.utcnow() + app.config['JWT_ACCESS_TOKEN_EXPIRES']
    }, app.config['SECRET_KEY'], algorithm='HS256')
    
    refresh_token = jwt.encode({
        'user_id': user['id'],
        'exp': datetime.utcnow() + app.config['JWT_REFRESH_TOKEN_EXPIRES']
    }, app.config['SECRET_KEY'], algorithm='HS256')
    
    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': {
            'id': user['id'],
            'email': user['email'],
            'name': user['name'],
            'user_type': user['user_type'],
            'business_name': user.get('business_name', ''),
            'tax_id': user.get('tax_id', '')
        }
    })

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    user_type = data.get('userType', 'customer')
    
    required_fields = ['email', 'password', 'fullName']
    if user_type == 'business':
        required_fields.extend(['businessName', 'taxId'])
    
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Falta el campo requerido: {field}'}), 400
    
    if data['password'] != data.get('confirmPassword', ''):
        return jsonify({'error': 'Las contraseñas no coinciden'}), 400
    
    user_data = {
        'email': data['email'],
        'password': data['password'],
        'name': data['fullName'],
        'user_type': user_type
    }
    
    if user_type == 'business':
        user_data['business_name'] = data['businessName']
        user_data['tax_id'] = data['taxId']
    
    try:
        user = register_user(user_data)
        
        # Crear tokens como en login
        access_token = jwt.encode({
            'user_id': user['id'],
            'email': user['email'],
            'user_type': user['user_type'],
            'exp': datetime.utcnow() + app.config['JWT_ACCESS_TOKEN_EXPIRES']
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name'],
                'user_type': user['user_type'],
                'business_name': user.get('business_name', ''),
                'tax_id': user.get('tax_id', '')
            }
        })
    except ValueError as e:
        return jsonify({'error': str(e)}), 400

@app.route('/api/auth/me', methods=['GET'])
def get_me():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Token no proporcionado'}), 401
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user = get_current_user(payload['user_id'])
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
            
        return jsonify({
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name'],
                'user_type': user['user_type'],
                'business_name': user.get('business_name', ''),
                'tax_id': user.get('tax_id', '')
            }
        })
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401

if __name__ == '__main__':
    app.run(debug=True, port=5000)