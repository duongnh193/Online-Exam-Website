# 🚀 Quick Start - Docker

## Chạy ứng dụng nhanh với Docker

### 1. Yêu cầu
- Docker và Docker Compose đã cài đặt
- Port 80, 8080, 3307 chưa được sử dụng

### 2. Chạy ứng dụng

```bash
# Build và chạy tất cả services
docker compose up --build -d

# Xem logs
docker compose logs -f
```

### 3. Truy cập ứng dụng

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080
- **Swagger**: http://localhost:8080/swagger-ui.html

### 4. Dừng ứng dụng

```bash
docker compose down
```

### 5. Reset hoàn toàn (xóa database)

```bash
docker compose down -v
```

## Troubleshooting

### Lỗi port đã sử dụng
```bash
# Kiểm tra port
netstat -tulpn | grep :80
netstat -tulpn | grep :8080

# Thay đổi port trong docker-compose.yml
```

### Xem logs chi tiết
```bash
docker compose logs backend
docker compose logs frontend
docker compose logs mysql
```

### Restart service
```bash
docker compose restart backend
```

Xem file `DOCKER_README.md` để biết thêm chi tiết! 