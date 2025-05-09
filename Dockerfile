FROM python:3.9-slim

WORKDIR /app

# Copia e instala dependencias
COPY suscridash-backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo el backend incluyendo el script de inicio
COPY suscridash-backend .

# Copia el script de inicio y da permisos de ejecución
COPY start.sh /app/
RUN chmod +x /app/start.sh

# Puerto expuesto (solo documentación, no afecta el funcionamiento)
EXPOSE $PORT

# Ejecuta el script de inicio
CMD ["/app/start.sh"]