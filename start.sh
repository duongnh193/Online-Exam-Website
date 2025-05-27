#!/bin/bash
java -jar -Dspring.profiles.active=railway /app/backend.jar &
sleep 30
envsubst '${PORT}' < /etc/nginx/sites-available/default > /etc/nginx/sites-enabled/default
nginx -g "daemon off;"
