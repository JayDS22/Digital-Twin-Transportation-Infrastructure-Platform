# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### LiDAR Management

#### Upload LiDAR File
```
POST /lidar/upload
Content-Type: multipart/form-data

Body:
- file: LiDAR file (LAS/LAZ)
- project_id: Project identifier

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "filename": "scan.las",
    "project_id": "proj-001",
    "status": "uploaded"
  }
}
```

#### Get All LiDAR Files
```
GET /lidar?project_id=proj-001&status=processed&limit=50

Response:
{
  "data": [...],
  "count": 10
}
```

### Asset Management

#### Get Assets
```
GET /assets?type=sidewalk&verified=true&limit=100

Response:
{
  "data": [...],
  "count": 50
}
```

#### Get Asset Summary
```
GET /assets/summary

Response:
{
  "data": [
    {
      "type": "sidewalk",
      "detected": 3245,
      "verified": 3180,
      "accuracy": 98
    }
  ]
}
```

### AI Detection

#### Run Detection
```
POST /detection/run

Body:
{
  "lidar_id": "1",
  "models": ["yolov8", "sign_detector"]
}

Response:
{
  "success": true,
  "job_id": "job-123"
}
```

#### Get Detection Status
```
GET /detection/status/:job_id

Response:
{
  "data": {
    "id": "job-123",
    "status": "processing",
    "progress": 45
  }
}
```

## Error Responses

All errors follow this format:
```json
{
  "error": {
    "message": "Error description",
    "status": 400
  }
}
```

## Rate Limiting
- 100 requests per minute per IP
- 1000 requests per hour per user
```

### docs/DEPLOYMENT.md
```markdown
# Deployment Guide

## Prerequisites
- Docker & Docker Compose
- PostgreSQL 14+
- Node.js 18+
- Python 3.9+

## Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/digital-twin-infrastructure.git
cd digital-twin-infrastructure
```

### 2. Configure Environment
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp ai-service/.env.example ai-service/.env
```

Edit each .env file with production values.

### 3. Database Setup
```bash
createdb digital_twin
psql -d digital_twin -c "CREATE EXTENSION postgis;"
psql -d digital_twin -f database/schema.sql
```

## Deployment Options

### Option 1: Docker (Recommended)
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Option 2: Manual Deployment

#### Backend
```bash
cd backend
npm install --production
npm run migrate
pm2 start src/server.js --name digital-twin-api
```

#### Frontend
```bash
cd frontend
npm install
npm run build
# Serve build/ with nginx
```

#### AI Service
```bash
cd ai-service
pip install -r requirements.txt
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

## Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
    }

    location /api {
        proxy_pass http://localhost:5000;
    }
}
```

## Monitoring
- Logs: `/var/log/digital-twin/`
- Metrics: Prometheus endpoint at `:9090/metrics`
- Health checks: `/health`

## Backup Strategy
```bash
# Daily database backup
pg_dump digital_twin > backup_$(date +%Y%m%d).sql

# Weekly file backup
tar -czf files_backup.tar.gz uploads/
```
