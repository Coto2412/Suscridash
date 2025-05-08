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
from models import init_db, get_db, save_db
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
    
@app.route('/api/admin/stats', methods=['GET'])
def get_admin_stats():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Token no proporcionado'}), 401
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        if payload['user_type'] != 'admin':
            return jsonify({'error': 'Acceso no autorizado'}), 403
        
        db = get_db()
        
        # Contar empresas (user_type = 'business')
        total_businesses = len([u for u in db['users'] if u['user_type'] == 'business'])
        
        # En un sistema real, estos valores vendrían de la base de datos
        active_subscriptions = 156  # Simulado por ahora
        total_revenue = 12543000    # Simulado por ahora
        new_customers = 23          # Simulado por ahora
        
        return jsonify({
            'total_businesses': total_businesses,
            'active_subscriptions': active_subscriptions,
            'total_revenue': total_revenue,
            'new_customers': new_customers
        })
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401

@app.route('/api/admin/recent-businesses', methods=['GET'])
def get_recent_businesses():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Token no proporcionado'}), 401
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        if payload['user_type'] != 'admin':
            return jsonify({'error': 'Acceso no autorizado'}), 403
        
        db = get_db()
        
        # Obtener las últimas 5 empresas registradas
        businesses = [u for u in db['users'] if u['user_type'] == 'business']
        recent_businesses = sorted(businesses, key=lambda x: x.get('created_at', ''), reverse=True)[:5]
        
        # Formatear la respuesta
        formatted_businesses = []
        for business in recent_businesses:
            formatted_businesses.append({
                'id': business['id'],
                'name': business.get('business_name', 'Sin nombre'),
                'email': business['email'],
                'subscriptions': business.get('subscriptions', 0),
                'status': business.get('status', 'active')
            })
        
        return jsonify({'businesses': formatted_businesses})
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401
    
@app.route('/api/admin/businesses', methods=['GET'])
def get_all_businesses():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Token no proporcionado'}), 401
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        if payload['user_type'] != 'admin':
            return jsonify({'error': 'Acceso no autorizado'}), 403
        
        db = get_db()
        
        # Obtener todas las empresas (user_type = 'business')
        businesses = [u for u in db['users'] if u['user_type'] == 'business']
        
        # Formatear la respuesta
        formatted_businesses = []
        for business in businesses:
            formatted_businesses.append({
                'id': business['id'],
                'name': business.get('business_name', 'Sin nombre'),
                'tax_id': business.get('tax_id', ''),
                'email': business['email'],
                'status': business.get('status', 'active'),
                'subscriptions': business.get('subscriptions', 0),
                'created_at': business.get('created_at', '')
            })
        
        return jsonify({'businesses': formatted_businesses})
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401

@app.route('/api/admin/businesses/<business_id>', methods=['DELETE'])
def delete_business(business_id):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Token no proporcionado'}), 401
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        if payload['user_type'] != 'admin':
            return jsonify({'error': 'Acceso no autorizado'}), 403
        
        db = get_db()
        
        # Buscar y eliminar la empresa
        for i, user in enumerate(db['users']):
            if user['id'] == business_id and user['user_type'] == 'business':
                del db['users'][i]
                save_db()
                return jsonify({'message': 'Empresa eliminada correctamente'})
        
        return jsonify({'error': 'Empresa no encontrada'}), 404
        
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401
    
@app.route('/api/admin/users', methods=['GET'])
def get_all_users():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Token no proporcionado'}), 401
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        if payload['user_type'] != 'admin':
            return jsonify({'error': 'Acceso no autorizado'}), 403
        
        db = get_db()
        
        # Obtener solo los usuarios tipo customer (excluyendo businesses y admin)
        users = [u for u in db['users'] if u['user_type'] == 'customer']
        
        # Formatear la respuesta
        formatted_users = []
        for user in users:
            user_data = {
                'id': user['id'],
                'name': user['name'],
                'email': user['email'],
                'user_type': user['user_type'],
                'created_at': user.get('created_at', '')
            }
            formatted_users.append(user_data)
        
        return jsonify({'users': formatted_users})
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401

@app.route('/api/admin/users/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Token no proporcionado'}), 401
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        if payload['user_type'] != 'admin':
            return jsonify({'error': 'Acceso no autorizado'}), 403
        
        db = get_db()
        
        # Buscar y eliminar el usuario (no permitir eliminar admin)
        for i, user in enumerate(db['users']):
            if user['id'] == user_id and user['user_type'] != 'admin':
                del db['users'][i]
                save_db()
                return jsonify({'message': 'Usuario eliminado correctamente'})
        
        return jsonify({'error': 'Usuario no encontrado o no se puede eliminar'}), 404
        
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401
    
@app.route('/api/admin/users/<user_id>', methods=['GET'])
def get_user_details(user_id):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Token no proporcionado'}), 401
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        if payload['user_type'] != 'admin':
            return jsonify({'error': 'Acceso no autorizado'}), 403
        
        db = get_db()
        
        # Buscar usuario
        user = None
        for u in db['users']:
            if u['id'] == user_id:
                user = u
                break
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
            
        return jsonify({
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name'],
                'user_type': user['user_type'],
                'created_at': user.get('created_at', ''),
                'business_name': user.get('business_name', ''),
                'tax_id': user.get('tax_id', '')
            }
        })
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401

@app.route('/api/admin/users/<user_id>', methods=['PUT'])
def update_user(user_id):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Token no proporcionado'}), 401
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        if payload['user_type'] != 'admin':
            return jsonify({'error': 'Acceso no autorizado'}), 403
        
        data = request.get_json()
        db = get_db()
        
        # Buscar y actualizar usuario
        for user in db['users']:
            if user['id'] == user_id:
                if 'name' in data:
                    user['name'] = data['name']
                if 'email' in data:
                    # Verificar que el nuevo email no exista
                    for u in db['users']:
                        if u['id'] != user_id and u['email'] == data['email']:
                            return jsonify({'error': 'El email ya está en uso'}), 400
                    user['email'] = data['email']
                if 'user_type' in data:
                    user['user_type'] = data['user_type']
                if 'business_name' in data:
                    user['business_name'] = data['business_name']
                if 'tax_id' in data:
                    user['tax_id'] = data['tax_id']
                
                save_db()
                return jsonify({
                    'message': 'Usuario actualizado correctamente',
                    'user': {
                        'id': user['id'],
                        'email': user['email'],
                        'name': user['name'],
                        'user_type': user['user_type'],
                        'business_name': user.get('business_name', ''),
                        'tax_id': user.get('tax_id', '')
                    }
                })
        
        return jsonify({'error': 'Usuario no encontrado'}), 404
        
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401
    
@app.route('/api/admin/businesses/<business_id>', methods=['GET'])
def get_business_details(business_id):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Token no proporcionado'}), 401
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        if payload['user_type'] != 'admin':
            return jsonify({'error': 'Acceso no autorizado'}), 403
        
        db = get_db()
        
        # Buscar empresa
        business = None
        for u in db['users']:
            if u['id'] == business_id and u['user_type'] == 'business':
                business = u
                break
        
        if not business:
            return jsonify({'error': 'Empresa no encontrada'}), 404
            
        return jsonify({
            'business': {
                'id': business['id'],
                'email': business['email'],
                'name': business['name'],
                'business_name': business.get('business_name', ''),
                'tax_id': business.get('tax_id', ''),
                'subscriptions': business.get('subscriptions', 0),
                'status': business.get('status', 'active'),
                'created_at': business.get('created_at', '')
            }
        })
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401

@app.route('/api/admin/businesses/<business_id>', methods=['PUT'])
def update_business(business_id):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Token no proporcionado'}), 401
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        if payload['user_type'] != 'admin':
            return jsonify({'error': 'Acceso no autorizado'}), 403
        
        data = request.get_json()
        db = get_db()
        
        # Buscar y actualizar empresa
        for user in db['users']:
            if user['id'] == business_id and user['user_type'] == 'business':
                if 'name' in data:
                    user['name'] = data['name']
                if 'email' in data:
                    # Verificar que el nuevo email no exista
                    for u in db['users']:
                        if u['id'] != business_id and u['email'] == data['email']:
                            return jsonify({'error': 'El email ya está en uso'}), 400
                    user['email'] = data['email']
                if 'business_name' in data:
                    user['business_name'] = data['business_name']
                if 'tax_id' in data:
                    user['tax_id'] = data['tax_id']
                if 'status' in data:
                    user['status'] = data['status']
                
                save_db()
                return jsonify({
                    'message': 'Empresa actualizada correctamente',
                    'business': {
                        'id': user['id'],
                        'email': user['email'],
                        'name': user['name'],
                        'business_name': user.get('business_name', ''),
                        'tax_id': user.get('tax_id', ''),
                        'subscriptions': user.get('subscriptions', 0),
                        'status': user.get('status', 'active'),
                        'created_at': user.get('created_at', '')
                    }
                })
        
        return jsonify({'error': 'Empresa no encontrada'}), 404
        
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401
    

if __name__ == '__main__':
    app.run(debug=True, port=5000)