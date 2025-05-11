#!/bin/sh

# Verifica si PORT está definido, si no usa 8000 como valor por defecto
HOST_PORT=${PORT:-8000}

# Configuración de Gunicorn para producción
exec gunicorn --bind 0.0.0.0:$HOST_PORT \
              --workers 4 \
              --threads 2 \
              --timeout 120 \
              --access-logfile - \
              --error-logfile - \
              app:app