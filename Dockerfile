FROM python:3.9-slim

WORKDIR /app

COPY suscridash-backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY suscridash-backend .

# Usa esta sintaxis para CMD (¡IMPORTANTE!)
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT} app:app"]