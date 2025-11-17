# 🐳 Docker Deployment Guide - Web Online Exam

Hướng dẫn triển khai ứng dụng Web Online Exam sử dụng Docker và Docker Compose.

## 📋 Yêu cầu hệ thống

- Docker Engine 20.10+
- Docker Compose 2.0+
- RAM: tối thiểu 4GB
- Disk: tối thiểu 2GB trống

## 🏗️ Kiến trúc ứng dụng

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │    Database     │
│   (React +      │◄──►│  (Spring Boot)  │◄──►│    (MySQL)      │
│    Nginx)       │    │                 │    │                 │
│   Port: 80      │    │   Port: 8080    │    │   Port: 3307    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Cách chạy ứng dụng

### 1. Build và chạy lần đầu tiên

```bash
# Build tất cả services
docker compose build

# Chạy ứng dụng
docker compose up -d
```

### 2. Hoặc build và chạy cùng lúc

```bash
docker compose up --build -d
```

### 3. Kiểm tra trạng thái

```bash
# Xem trạng thái containers
docker compose ps

# Xem logs tất cả services
docker compose logs -f

# Xem logs của service cụ thể
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql
```

## 🌐 Truy cập ứng dụng

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **MySQL**: localhost:3307 (username: root, password: root)

## 🔧 Các lệnh hữu ích

### Quản lý containers

```bash
# Dừng ứng dụng
docker compose down

# Dừng và xóa volumes (reset database)
docker compose down -v

# Restart tất cả services
docker compose restart

# Restart service cụ thể
docker compose restart backend
docker compose restart frontend
```

### Build và update

```bash
# Rebuild service cụ thể
docker compose build backend
docker compose up -d backend

# Rebuild tất cả và restart
docker compose up --build -d

# Pull images mới nhất
docker compose pull
```

### Debug và troubleshooting

```bash
# Truy cập vào container
docker exec -it exam-backend bash
docker exec -it exam-frontend sh
docker exec -it exam-mysql mysql -u root -p

# Xem logs realtime
docker compose logs -f --tail=100

# Xem resource usage
docker stats

# Xem networks
docker network ls
docker network inspect web-online-exam_exam-network
```

## 📁 Cấu trúc files Docker

```
web-online-exam/
├── be/
│   ├── Dockerfile                          # Backend container config
│   ├── .dockerignore                       # Files to exclude from build
│   └── src/main/resources/
│       └── application-docker.properties   # Docker environment config
├── fe/
│   ├── Dockerfile                          # Frontend container config
│   ├── .dockerignore                       # Files to exclude from build
│   ├── nginx.conf                          # Nginx configuration
│   └── env.docker                          # Environment variables for Docker
├── docker-compose.yml                      # Main orchestration file
└── DOCKER_README.md                        # This file
```

## 🔍 Troubleshooting

### Lỗi thường gặp

1. **Port đã được sử dụng**
   ```bash
   # Kiểm tra port đang sử dụng
   netstat -tulpn | grep :80
   netstat -tulpn | grep :8080
   netstat -tulpn | grep :3307
   
   # Thay đổi port trong docker-compose.yml nếu cần
   ```

2. **Database connection failed**
   ```bash
   # Kiểm tra MySQL container
   docker compose logs mysql
   
   # Restart MySQL
   docker compose restart mysql
   ```

3. **Frontend không load được**
   ```bash
   # Kiểm tra Nginx logs
   docker compose logs frontend
   
   # Rebuild frontend
   docker compose build frontend
   docker compose up -d frontend
   ```

4. **Backend không start**
   ```bash
   # Kiểm tra logs
   docker compose logs backend
   
   # Kiểm tra health check
   docker compose ps
   ```

### Xóa và reset hoàn toàn

```bash
# Dừng và xóa tất cả
docker compose down -v --rmi all

# Xóa tất cả containers, images, networks không sử dụng
docker system prune -a

# Build lại từ đầu
docker compose up --build -d
```

## 🔒 Bảo mật

### Thay đổi mật khẩu mặc định

1. **MySQL password**: Sửa trong `docker-compose.yml`
   ```yaml
   environment:
     MYSQL_ROOT_PASSWORD: your-secure-password
   ```

2. **JWT secret**: Sửa trong `be/src/main/resources/application-docker.properties`
   ```properties
   app.jwt-secret=your-secure-jwt-secret-key
   ```

### Production deployment

Để deploy production, cần:
- Sử dụng HTTPS
- Thay đổi tất cả mật khẩu mặc định
- Cấu hình firewall
- Sử dụng external database
- Setup monitoring và logging

## 📊 Monitoring

### Health checks

```bash
# Kiểm tra health của tất cả services
docker compose ps

# Test API health
curl http://localhost:8080/actuator/health

# Test frontend
curl http://localhost:3000
```

### Logs

```bash
# Xem logs với timestamp
docker compose logs -f -t

# Lọc logs theo level
docker compose logs | grep ERROR
docker compose logs | grep WARN
```

## 🔄 CI/CD Integration

Để tích hợp với CI/CD pipeline:

```bash
# Build for production
docker compose -f docker-compose.yml build --no-cache

# Run tests
docker compose run --rm backend mvn test
docker compose run --rm frontend npm test

# Deploy
docker compose up -d
```

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra logs: `docker compose logs -f`
2. Kiểm tra resource: `docker stats`
3. Restart services: `docker compose restart`
4. Reset hoàn toàn: `docker compose down -v && docker compose up --build -d` 