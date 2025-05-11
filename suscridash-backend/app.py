from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
from datetime import datetime, timedelta
import os
import uuid
from dotenv import load_dotenv

# Primero cargar configuración
load_dotenv()

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173",
                    "https://suscridash.onrender.com"
                    ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Type"],
        "max_age": 86400
    }
})

# Habilitar CORS para las opciones preflight
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

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
                'business_name': business.get('business_name', 'Sin nombre'),
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
    
@app.route('/api/admin/recent-activity', methods=['GET'])
def get_recent_activity():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Token no proporcionado'}), 401
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        if payload['user_type'] != 'admin':
            return jsonify({'error': 'Acceso no autorizado'}), 403
        
        # Datos simulados de actividad - en un sistema real esto vendría de la base de datos
        recent_activity = [
            {
                'id': '1',
                'type': 'new_business',
                'title': 'Nueva empresa registrada',
                'description': 'Tech Solutions SA',
                'timestamp': '2023-11-15T10:30:00',
                'icon': 'business'
            },
            {
                'id': '2',
                'type': 'new_subscription',
                'title': 'Nueva suscripción creada',
                'description': 'Plan Premium',
                'timestamp': '2023-11-15T09:15:00',
                'icon': 'subscription'
            },
            {
                'id': '3',
                'type': 'payment',
                'title': 'Pago procesado',
                'description': '$120,000 CLP',
                'timestamp': '2023-11-14T16:45:00',
                'icon': 'payment'
            },
            {
                'id': '4',
                'type': 'user_signup',
                'title': 'Nuevo usuario registrado',
                'description': 'cliente@nuevo.cl',
                'timestamp': '2023-11-14T14:20:00',
                'icon': 'user'
            },
            {
                'id': '5',
                'type': 'business_updated',
                'title': 'Empresa actualizada',
                'description': 'Marketing Digital SpA',
                'timestamp': '2023-11-14T11:10:00',
                'icon': 'update'
            }
        ]
        
        return jsonify({'activity': recent_activity})
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401
    
@app.route('/api/admin/subscriptions', methods=['GET'])
def get_all_subscriptions():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Token no proporcionado'}), 401
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        if payload['user_type'] != 'admin':
            return jsonify({'error': 'Acceso no autorizado'}), 403
        
        db = get_db()
        return jsonify({'subscriptions': db.get('subscriptions', [])})
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401

@app.route('/api/admin/subscriptions/<subscription_id>', methods=['DELETE'])
def delete_subscription(subscription_id):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Token no proporcionado'}), 401
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        if payload['user_type'] != 'admin':
            return jsonify({'error': 'Acceso no autorizado'}), 403
        
        db = get_db()
        subscriptions = db.get('subscriptions', [])
        
        # Buscar y eliminar la suscripción
        for i, sub in enumerate(subscriptions):
            if sub['id'] == subscription_id:
                del subscriptions[i]
                save_db()
                return jsonify({'message': 'Suscripción eliminada correctamente'})
        
        return jsonify({'error': 'Suscripción no encontrada'}), 404
        
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401
    
@app.route('/api/admin/subscriptions/<subscription_id>', methods=['PUT'])
def update_subscription(subscription_id):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Token no proporcionado'}), 401
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        if payload['user_type'] != 'admin':
            return jsonify({'error': 'Acceso no autorizado'}), 403
        
        data = request.get_json()
        
        # Validar datos de entrada
        required_fields = ['plan_name', 'status', 'monthly_amount']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Falta el campo requerido: {field}'}), 400
        
        # Validar estados permitidos
        valid_statuses = ['active', 'pending', 'cancelled']
        if data['status'] not in valid_statuses:
            return jsonify({'error': f'Estado no válido. Debe ser uno de: {", ".join(valid_statuses)}'}), 400
        
        # Validar monto positivo
        if not isinstance(data['monthly_amount'], (int, float)) or data['monthly_amount'] <= 0:
            return jsonify({'error': 'El monto mensual debe ser un número positivo'}), 400
        
        db = get_db()
        subscriptions = db.get('subscriptions', [])
        
        # Buscar y actualizar suscripción
        for sub in subscriptions:
            if sub['id'] == subscription_id:
                sub.update({
                    'plan_name': data['plan_name'],
                    'status': data['status'],
                    'monthly_amount': data['monthly_amount']
                })
                save_db()
                return jsonify({
                    'message': 'Suscripción actualizada correctamente',
                    'subscription': sub
                })
        
        return jsonify({'error': 'Suscripción no encontrada'}), 404
        
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401

@app.route('/api/admin/subscriptions', methods=['POST'])
def create_subscription():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Token no proporcionado'}), 401
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        if payload['user_type'] != 'admin':
            return jsonify({'error': 'Acceso no autorizado'}), 403
        
        data = request.get_json()
        
        # Validar datos de entrada
        required_fields = ['business_id', 'plan_name', 'status', 'monthly_amount', 'start_date']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Falta el campo requerido: {field}'}), 400
        
        # Validar estados permitidos
        valid_statuses = ['active', 'pending']
        if data['status'] not in valid_statuses:
            return jsonify({'error': f'Estado no válido. Debe ser uno de: {", ".join(valid_statuses)}'}), 400
        
        # Validar monto positivo
        if not isinstance(data['monthly_amount'], (int, float)) or data['monthly_amount'] <= 0:
            return jsonify({'error': 'El monto debe ser un número positivo'}), 400
        
        # Validar fecha
        try:
            start_date = datetime.strptime(data['start_date'], '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': 'Formato de fecha inválido. Use YYYY-MM-DD'}), 400
        
        # Calcular fecha de renovación (1 año después)
        renewal_date = start_date + timedelta(days=365)
        
        db = get_db()
        
        # Obtener nombre de la empresa
        business_name = ""
        for user in db['users']:
            if user['id'] == data['business_id'] and user['user_type'] == 'business':
                business_name = user.get('business_name', '')
                break
        
        # Crear nueva suscripción
        new_subscription = {
            'id': str(uuid.uuid4()),
            'business_id': data['business_id'],
            'business_name': business_name,
            'plan_name': data['plan_name'],
            'start_date': data['start_date'],
            'renewal_date': renewal_date.strftime('%Y-%m-%d'),
            'status': data['status'],
            'monthly_amount': data['monthly_amount'],
            'payment_method': 'credit_card',  # Valor por defecto
            'created_at': datetime.utcnow().isoformat()
        }
        
        # Agregar a la base de datos
        if 'subscriptions' not in db:
            db['subscriptions'] = []
        db['subscriptions'].append(new_subscription)
        save_db()
        
        return jsonify({
            'message': 'Suscripción creada correctamente',
            'subscription': new_subscription
        }), 201
        
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401
    
@app.route('/api/customer/subscription', methods=['GET'])
def check_customer_subscription():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Token no proporcionado'}), 401
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        if payload['user_type'] != 'customer':
            return jsonify({'error': 'Acceso no autorizado'}), 403
        
        db = get_db()
        # Verificar si el usuario tiene suscripciones activas
        subscriptions = db.get('subscriptions', [])
        user_subscriptions = [s for s in subscriptions 
                            if s.get('customer_id') == payload['user_id'] 
                            and s.get('status') == 'active']
        
        return jsonify({
            'hasSubscription': len(user_subscriptions) > 0,
            'subscriptions': user_subscriptions
        })
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401
    
@app.route('/api/business/financial-stats', methods=['GET'])
def get_business_financial_stats():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Token no proporcionado'}), 401
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        if payload['user_type'] != 'business':
            return jsonify({'error': 'Acceso no autorizado'}), 403
        
        # Obtener el rango de tiempo del query param (default: mensual)
        time_range = request.args.get('range', 'mensual')
        
        # Datos simulados - en un sistema real esto vendría de la base de datos
        # Basado en el business_id del usuario (payload['user_id'])
        
        # Datos para diferentes rangos de tiempo
        data = {
            'ingresos': {
                'mensual': {
                    'labels': ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'],
                    'data': [12000, 19000, 15000, 18000, 22000, 25000, 21000]
                },
                'trimestral': {
                    'labels': ['Q1', 'Q2', 'Q3'],
                    'data': [45000, 52000, 68000]
                },
                'anual': {
                    'labels': ['2021', '2022', '2023'],
                    'data': [250000, 280000, 310000]
                }
            },
            'gastos': {
                'mensual': {
                    'labels': ['Suscripciones', 'Nóminas', 'Servicios', 'Otros'],
                    'data': [5000, 8000, 3000, 2000]
                },
                'trimestral': {
                    'labels': ['Suscripciones', 'Nóminas', 'Servicios', 'Otros'],
                    'data': [15000, 24000, 9000, 6000]
                },
                'anual': {
                    'labels': ['Suscripciones', 'Nóminas', 'Servicios', 'Otros'],
                    'data': [60000, 96000, 36000, 24000]
                }
            },
            'resumen': {
                'mensual': {
                    'ingresos': sum([12000, 19000, 15000, 18000, 22000, 25000, 21000]),
                    'gastos': sum([5000, 8000, 3000, 2000]),
                    'beneficio': sum([12000, 19000, 15000, 18000, 22000, 25000, 21000]) - sum([5000, 8000, 3000, 2000]),
                    'margen': ((sum([12000, 19000, 15000, 18000, 22000, 25000, 21000]) - sum([5000, 8000, 3000, 2000])) / 
                              sum([12000, 19000, 15000, 18000, 22000, 25000, 21000])) * 100
                },
                'trimestral': {
                    'ingresos': sum([45000, 52000, 68000]),
                    'gastos': sum([15000, 24000, 9000, 6000]),
                    'beneficio': sum([45000, 52000, 68000]) - sum([15000, 24000, 9000, 6000]),
                    'margen': ((sum([45000, 52000, 68000]) - sum([15000, 24000, 9000, 6000])) / 
                              sum([45000, 52000, 68000])) * 100
                },
                'anual': {
                    'ingresos': sum([250000, 280000, 310000]),
                    'gastos': sum([60000, 96000, 36000, 24000]),
                    'beneficio': sum([250000, 280000, 310000]) - sum([60000, 96000, 36000, 24000]),
                    'margen': ((sum([250000, 280000, 310000]) - sum([60000, 96000, 36000, 24000])) / 
                              sum([250000, 280000, 310000])) * 100
                }
            },
            'suscripciones': {
                'total': 1245,
                'activas': 892,
                'canceladas': 353,
                'crecimiento': 12.5,
                'planes': [
                    {'nombre': 'Básico', 'cantidad': 512, 'color': 'rgba(79, 70, 229, 0.7)'},
                    {'nombre': 'Premium', 'cantidad': 380, 'color': 'rgba(99, 102, 241, 0.7)'},
                    {'nombre': 'Empresarial', 'cantidad': 353, 'color': 'rgba(129, 140, 248, 0.7)'}
                ],
                'tendencia': [65, 59, 80, 81, 56, 55, 90]
            }
        }
        
        return jsonify({
            'ingresos': data['ingresos'][time_range],
            'gastos': data['gastos'][time_range],
            'resumen': data['resumen'][time_range],
            'suscripciones': data['suscripciones'],
            'time_range': time_range
        })
        
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401
    except KeyError:
        return jsonify({'error': 'Rango de tiempo no válido'}), 400
    
@app.route('/api/business/plans', methods=['GET'])
def get_business_plans():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Token no proporcionado'}), 401
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        if payload['user_type'] != 'business':
            return jsonify({'error': 'Acceso no autorizado'}), 403
        
        db = get_db()
        business_id = payload['user_id']
        
        # Filtrar planes por business_id (en un sistema real)
        # Aquí simulamos que todos los planes pertenecen a la empresa actual
        plans = db.get('subscription_plans', [])
        
        return jsonify({'plans': plans})
        
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401

@app.route('/api/business/plans', methods=['POST'])
def create_business_plan():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Token no proporcionado'}), 401
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        if payload['user_type'] != 'business':
            return jsonify({'error': 'Acceso no autorizado'}), 403
        
        data = request.get_json()
        
        # Validar datos requeridos
        required_fields = ['nombre', 'precio', 'moneda', 'periodo', 'descripcion']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Falta el campo requerido: {field}'}), 400
        
        # Validar precio positivo
        if not isinstance(data['precio'], (int, float)) or data['precio'] <= 0:
            return jsonify({'error': 'El precio debe ser un número positivo'}), 400
        
        db = get_db()
        if 'subscription_plans' not in db:
            db['subscription_plans'] = []
            
        new_plan = {
            'id': str(uuid.uuid4()),
            'business_id': payload['user_id'],
            'nombre': data['nombre'],
            'precio': data['precio'],
            'moneda': data['moneda'],
            'periodo': data['periodo'],
            'descripcion': data['descripcion'],
            'caracteristicas': data.get('caracteristicas', []),
            'estado': data.get('estado', 'activo'),
            'created_at': datetime.utcnow().isoformat()
        }
        
        db['subscription_plans'].append(new_plan)
        save_db()
        
        return jsonify({
            'message': 'Plan creado correctamente',
            'plan': new_plan
        }), 201
        
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401

@app.route('/api/business/plans/<plan_id>', methods=['PUT'])
def update_business_plan(plan_id):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Token no proporcionado'}), 401
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        if payload['user_type'] != 'business':
            return jsonify({'error': 'Acceso no autorizado'}), 403
        
        data = request.get_json()
        
        db = get_db()
        plans = db.get('subscription_plans', [])
        
        # Buscar y actualizar plan
        for plan in plans:
            if plan['id'] == plan_id and plan['business_id'] == payload['user_id']:
                if 'nombre' in data:
                    plan['nombre'] = data['nombre']
                if 'precio' in data:
                    if not isinstance(data['precio'], (int, float)) or data['precio'] <= 0:
                        return jsonify({'error': 'El precio debe ser un número positivo'}), 400
                    plan['precio'] = data['precio']
                if 'moneda' in data:
                    plan['moneda'] = data['moneda']
                if 'periodo' in data:
                    plan['periodo'] = data['periodo']
                if 'descripcion' in data:
                    plan['descripcion'] = data['descripcion']
                if 'caracteristicas' in data:
                    plan['caracteristicas'] = data['caracteristicas']
                if 'estado' in data:
                    plan['estado'] = data['estado']
                
                save_db()
                return jsonify({
                    'message': 'Plan actualizado correctamente',
                    'plan': plan
                })
        
        return jsonify({'error': 'Plan no encontrado'}), 404
        
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401

@app.route('/api/business/plans/<plan_id>', methods=['DELETE'])
def delete_business_plan(plan_id):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Token no proporcionado'}), 401
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        if payload['user_type'] != 'business':
            return jsonify({'error': 'Acceso no autorizado'}), 403
        
        db = get_db()
        plans = db.get('subscription_plans', [])
        
        # Buscar y eliminar plan
        for i, plan in enumerate(plans):
            if plan['id'] == plan_id and plan['business_id'] == payload['user_id']:
                del plans[i]
                save_db()
                return jsonify({'message': 'Plan eliminado correctamente'})
        
        return jsonify({'error': 'Plan no encontrado'}), 404
        
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401

@app.route('/api/business/plans/<plan_id>/toggle-status', methods=['PUT'])
def toggle_business_plan_status(plan_id):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Token no proporcionado'}), 401
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        if payload['user_type'] != 'business':
            return jsonify({'error': 'Acceso no autorizado'}), 403
        
        db = get_db()
        plans = db.get('subscription_plans', [])
        
        # Buscar y cambiar estado del plan
        for plan in plans:
            if plan['id'] == plan_id and plan['business_id'] == payload['user_id']:
                plan['estado'] = 'activo' if plan['estado'] == 'inactivo' else 'inactivo'
                save_db()
                return jsonify({
                    'message': 'Estado del plan actualizado',
                    'plan': plan
                })
        
        return jsonify({'error': 'Plan no encontrado'}), 404
        
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401
    
@app.route('/api/business/subscribers', methods=['GET'])
def get_business_subscribers():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Token no proporcionado'}), 401
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        if payload['user_type'] != 'business':
            return jsonify({'error': 'Acceso no autorizado'}), 403
        
        # Obtener parámetros de filtrado
        status_filter = request.args.get('status', 'all')
        search_query = request.args.get('search', '')
        
        db = get_db()
        business_id = payload['user_id']
        
        # Filtrar suscriptores por business_id y estado
        subscriptions = db.get('subscriptions', [])
        users = db.get('users', [])
        
        # Crear diccionario de usuarios para búsqueda rápida
        users_dict = {u['id']: u for u in users if u['user_type'] == 'customer'}
        
        # Obtener planes de la empresa
        business_plans = [p for p in db.get('subscription_plans', []) 
                         if p['business_id'] == business_id]
        plans_dict = {p['id']: p for p in business_plans}
        
        subscribers = []
        for sub in subscriptions:
            if sub['business_id'] == business_id:
                user = users_dict.get(sub['customer_id'])
                plan = plans_dict.get(sub['plan_id'])
                
                if user and plan:
                    subscriber_data = {
                        'id': sub['id'],
                        'customer_id': sub['customer_id'],
                        'nombre': user['name'],
                        'email': user['email'],
                        'telefono': user.get('phone', ''),
                        'plan_id': sub['plan_id'],
                        'plan': plan['nombre'],
                        'fechaInicio': sub['start_date'],
                        'proximoPago': sub['renewal_date'],
                        'estado': sub['status'],
                        'metodoPago': sub['payment_method'],
                        'created_at': sub['created_at']
                    }
                    
                    # Aplicar filtros
                    if status_filter == 'all' or sub['status'] == status_filter:
                        if search_query.lower() in user['name'].lower() or \
                           search_query.lower() in user['email'].lower():
                            subscribers.append(subscriber_data)
        
        # Ordenar por fecha de creación (más recientes primero)
        subscribers.sort(key=lambda x: x['created_at'], reverse=True)
        
        return jsonify({'subscribers': subscribers})
        
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401

@app.route('/api/business/subscribers/<subscriber_id>', methods=['GET'])
def get_subscriber_details(subscriber_id):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Token no proporcionado'}), 401
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        if payload['user_type'] != 'business':
            return jsonify({'error': 'Acceso no autorizado'}), 403
        
        db = get_db()
        business_id = payload['user_id']
        
        # Buscar la suscripción
        subscription = next((s for s in db.get('subscriptions', []) 
                          if s['id'] == subscriber_id and s['business_id'] == business_id), None)
        
        if not subscription:
            return jsonify({'error': 'Suscripción no encontrada'}), 404
            
        # Obtener datos del usuario
        user = next((u for u in db.get('users', []) 
                    if u['id'] == subscription['customer_id'] and u['user_type'] == 'customer'), None)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
            
        # Obtener datos del plan
        plan = next((p for p in db.get('subscription_plans', []) 
                   if p['id'] == subscription['plan_id']), None)
        
        if not plan:
            return jsonify({'error': 'Plan no encontrado'}), 404
            
        # Datos completos del suscriptor
        subscriber_data = {
            'id': subscription['id'],
            'customer_id': user['id'],
            'nombre': user['name'],
            'email': user['email'],
            'telefono': user.get('phone', ''),
            'plan_id': plan['id'],
            'plan': plan['nombre'],
            'descripcion_plan': plan['descripcion'],
            'caracteristicas_plan': plan['caracteristicas'],
            'fechaInicio': subscription['start_date'],
            'proximoPago': subscription['renewal_date'],
            'estado': subscription['status'],
            'metodoPago': subscription['payment_method'],
            'monto': subscription.get('monthly_amount', plan['precio']),
            'moneda': plan['moneda'],
            'periodo': plan['periodo'],
            'created_at': subscription['created_at'],
            'historial_pagos': []  # En un sistema real, esto vendría de otra tabla
        }
        
        return jsonify({'subscriber': subscriber_data})
        
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401

@app.route('/api/business/subscribers/<subscriber_id>/status', methods=['PUT'])
def update_subscriber_status(subscriber_id):
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Token no proporcionado'}), 401
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        if payload['user_type'] != 'business':
            return jsonify({'error': 'Acceso no autorizado'}), 403
        
        data = request.get_json()
        new_status = data.get('status')
        
        if new_status not in ['active', 'cancelled']:
            return jsonify({'error': 'Estado no válido'}), 400
        
        db = get_db()
        business_id = payload['user_id']
        
        # Buscar y actualizar suscripción
        for sub in db.get('subscriptions', []):
            if sub['id'] == subscriber_id and sub['business_id'] == business_id:
                sub['status'] = new_status
                save_db()
                
                # En un sistema real, aquí podrías registrar el cambio de estado
                return jsonify({
                    'message': f'Estado actualizado a {new_status}',
                    'subscriber': {
                        'id': sub['id'],
                        'status': sub['status']
                    }
                })
        
        return jsonify({'error': 'Suscripción no encontrada'}), 404
        
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401

@app.route('/api/business/subscribers/export', methods=['GET'])
def export_subscribers():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Token no proporcionado'}), 401
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        if payload['user_type'] != 'business':
            return jsonify({'error': 'Acceso no autorizado'}), 403
        
        db = get_db()
        business_id = payload['user_id']
        
        # Obtener todos los suscriptores de la empresa
        subscriptions = [s for s in db.get('subscriptions', []) 
                        if s['business_id'] == business_id]
        users = {u['id']: u for u in db.get('users', []) if u['user_type'] == 'customer'}
        plans = {p['id']: p for p in db.get('subscription_plans', []) 
                if p['business_id'] == business_id}
        
        # Preparar datos para exportación
        export_data = []
        for sub in subscriptions:
            user = users.get(sub['customer_id'])
            plan = plans.get(sub['plan_id'])
            
            if user and plan:
                export_data.append({
                    'Nombre': user['name'],
                    'Email': user['email'],
                    'Teléfono': user.get('phone', ''),
                    'Plan': plan['nombre'],
                    'Estado': 'Activo' if sub['status'] == 'active' else 'Cancelado',
                    'Fecha Inicio': sub['start_date'],
                    'Próximo Pago': sub['renewal_date'],
                    'Método de Pago': sub['payment_method'],
                    'Monto': f"{plan['precio']} {plan['moneda']}"
                })
        
        # En un sistema real, podrías generar un CSV o Excel aquí
        # Por simplicidad, devolvemos los datos como JSON
        return jsonify({
            'message': 'Datos listos para exportación',
            'format': 'csv',  # Podría ser 'excel' o 'pdf' en un sistema real
            'data': export_data,
            'count': len(export_data)
        })
        
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401
    
@app.route('/api/businesses/<business_id>', methods=['GET'])
def get_business_details_public(business_id):
    # Esta ruta es pública pero podrías querer validar el token para usuarios autenticados
    auth_header = request.headers.get('Authorization')
    
    # Verificar token si está presente, pero no requerirlo
    if auth_header and auth_header.startswith('Bearer '):
        try:
            token = auth_header.split(' ')[1]
            jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            # Token válido, pero no necesitamos hacer nada especial en este caso
        except:
            # Token inválido o expirado, pero permitimos continuar ya que es una ruta pública
            pass
    
    db = get_db()
    
    # Buscar empresa
    business = None
    for u in db['users']:
        if u['id'] == business_id and u['user_type'] == 'business':
            business = u
            break
    
    if not business:
        return jsonify({'error': 'Empresa no encontrada'}), 404
    
    # Obtener planes de la empresa
    plans = [p for p in db.get('subscription_plans', []) 
             if p['business_id'] == business_id and p.get('estado', 'activo') == 'activo']
    
    # Formatear respuesta
    business_data = {
        'id': business['id'],
        'business_name': business.get('business_name', ''),
        'email': business['email'],
        'description': business.get('description', ''),
        'logo': business.get('logo', '🏢'),
        'categories': business.get('categories', []),
        'plans': [{
            'id': p['id'],
            'name': p['nombre'],
            'description': p['descripcion'],
            'monthly_price': p['precio'],
            'yearly_price': p.get('precio_anual', p['precio'] * 12 * 0.9),  # 10% descuento por defecto
            'currency': p['moneda'],
            'period': p['periodo'],
            'features': p.get('caracteristicas', []),
            'status': p.get('estado', 'activo')
        } for p in plans]
    }
    
    return jsonify({'business': business_data})

# Configuración del sistema
@app.route('/api/admin/settings', methods=['GET'])
def get_system_settings():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Token no proporcionado'}), 401
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        if payload['user_type'] != 'admin':
            return jsonify({'error': 'Acceso no autorizado'}), 403
        
        db = get_db()
        
        # Obtener o inicializar configuración del sistema
        if 'system_settings' not in db:
            db['system_settings'] = {
                'system_name': 'Suscridash',
                'currency': 'CLP',
                'logo_url': '',
                'session_timeout': 30,  # minutos
                'email_notifications': True,
                'app_notifications': True,
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            save_db()
        
        return jsonify({'settings': db['system_settings']})
        
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401

@app.route('/api/admin/settings', methods=['PUT'])
def update_system_settings():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Token no proporcionado'}), 401
    
    token = auth_header.split(' ')[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        if payload['user_type'] != 'admin':
            return jsonify({'error': 'Acceso no autorizado'}), 403
        
        data = request.get_json()
        
        # Validar datos de entrada con valores por defecto
        if not data:
            return jsonify({'error': 'Datos no proporcionados'}), 400
        
        # Establecer valores por defecto si no están presentes
        system_name = data.get('system_name', 'Suscridash')
        currency = data.get('currency', 'CLP')
        
        try:
            session_timeout = int(data.get('session_timeout', 30))
            if session_timeout <= 0:
                session_timeout = 30
        except (ValueError, TypeError):
            session_timeout = 30
        
        db = get_db()
        
        # Inicializar si no existe
        if 'system_settings' not in db:
            db['system_settings'] = {
                'system_name': 'Suscridash',
                'currency': 'CLP',
                'logo_url': '',
                'session_timeout': 30,
                'email_notifications': True,
                'app_notifications': True,
                'created_at': datetime.utcnow().isoformat()
            }
        
        # Actualizar configuración solo con los campos proporcionados
        updated_settings = {
            'system_name': system_name,
            'currency': currency,
            'session_timeout': session_timeout,
            'email_notifications': data.get('email_notifications', db['system_settings'].get('email_notifications', True)),
            'app_notifications': data.get('app_notifications', db['system_settings'].get('app_notifications', True)),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        # Mantener el logo existente si no se proporciona uno nuevo
        if 'logo_url' in data:
            updated_settings['logo_url'] = data['logo_url']
        elif 'logo_url' in db['system_settings']:
            updated_settings['logo_url'] = db['system_settings']['logo_url']
        else:
            updated_settings['logo_url'] = ''
        
        # Mantener la fecha de creación original
        if 'created_at' in db['system_settings']:
            updated_settings['created_at'] = db['system_settings']['created_at']
        else:
            updated_settings['created_at'] = datetime.utcnow().isoformat()
        
        db['system_settings'] = updated_settings
        save_db()
        
        return jsonify({
            'message': 'Configuración actualizada correctamente',
            'settings': db['system_settings']
        })
        
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expirado'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Token inválido'}), 401
    
if __name__ == '__main__':
    app.run(debug=True, port=5000)