# Usa una imagen oficial de Python
FROM python:3.9-slim

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos necesarios del backend
COPY suscridash-backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo el backend
COPY suscridash-backend .

# Puerto expuesto (Railway usa $PORT dinámico)
EXPOSE $PORT

# Comando para iniciar Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:$PORT", "app:app"]