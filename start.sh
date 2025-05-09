#!/bin/sh

# Verifica si PORT está definido, si no usa 8000 como valor por defecto
HOST_PORT=${PORT:-8000}

# Ejecuta Gunicorn con el puerto configurado
exec gunicorn --bind 0.0.0.0:$HOST_PORT app:app