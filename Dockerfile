FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY fe/package*.json ./
RUN npm ci
COPY fe/ ./
RUN echo "REACT_APP_API_URL=/api" > .env
RUN npm run build

FROM maven:3.9-eclipse-temurin-17 AS backend-build
WORKDIR /app/backend
COPY be/pom.xml ./
RUN mvn dependency:go-offline -B
COPY be/src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre AS runtime
RUN apt-get update && apt-get install -y nginx curl gettext-base && rm -rf /var/lib/apt/lists/*
COPY --from=frontend-build /app/frontend/build /var/www/html
COPY --from=backend-build /app/backend/target/*.jar /app/backend.jar
COPY nginx-railway.conf /etc/nginx/sites-available/default
COPY start.sh /start.sh
RUN chmod +x /start.sh
EXPOSE $PORT
CMD ["/start.sh"]
