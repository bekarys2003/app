# Deployment Guide - JWT Authentication System

## Overview
This guide covers deploying the JWT authentication system to production environments, including backend API, frontend web app, and mobile app.

## Table of Contents
1. [Production Architecture](#production-architecture)
2. [Backend Deployment (Django)](#backend-deployment-django)
3. [Frontend Deployment (React)](#frontend-deployment-react)
4. [Mobile App Deployment (Expo)](#mobile-app-deployment-expo)
5. [Database Setup](#database-setup)
6. [Domain & SSL Configuration](#domain--ssl-configuration)
7. [Monitoring & Logging](#monitoring--logging)
8. [CI/CD Pipeline](#cicd-pipeline)
9. [Security Checklist](#security-checklist)
10. [Troubleshooting](#troubleshooting)

## Production Architecture

```
Internet
    │
    ▼
┌─────────────────┐
│   Load Balancer │ (AWS ALB / Nginx)
│   SSL Termination│
└─────────┬───────┘
          │
    ┌─────▼─────┐
    │   CDN     │ (CloudFront / Cloudflare)
    │ (Static)  │
    └─────┬─────┘
          │
┌─────────▼─────────┐    ┌─────────────────┐
│   Frontend        │    │   Backend API   │
│   (React SPA)     │    │   (Django)      │  
│   S3/Netlify      │    │   EC2/Heroku    │
└───────────────────┘    └─────────┬───────┘
                                   │
                         ┌─────────▼───────────┐
                         │   Database          │
                         │   (PostgreSQL)      │
                         │   RDS/Managed       │
                         └─────────────────────┘
```

## Backend Deployment (Django)

### Option 1: AWS EC2 with Docker

#### 1. Prepare Production Settings

Create `backend/settings/production.py`:
```python
from .base import *
import os

DEBUG = False
ALLOWED_HOSTS = ['your-api-domain.com', 'www.your-api-domain.com']

# Security Settings
SECURE_SSL_REDIRECT = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Session Security
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }
}

# CORS for production
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.com",
    "https://www.your-frontend-domain.com",
]

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/django/app.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

#### 2. Create Dockerfile

`backend/Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create log directory
RUN mkdir -p /var/log/django

# Collect static files
RUN python manage.py collectstatic --noinput --settings=backend.settings.production

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser /app /var/log/django
USER appuser

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "backend.wsgi:application"]
```

#### 3. Create requirements.txt
```txt
Django==5.0.7
djangorestframework==3.14.0
django-cors-headers==4.0.0
psycopg2-binary==2.9.6
PyJWT==2.7.0
python-decouple==3.8
google-auth==2.20.0
gunicorn==20.1.0
whitenoise==6.5.0
```

#### 4. Docker Compose for Production

`docker-compose.prod.yml`:
```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - backend

  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DJANGO_SETTINGS_MODULE=backend.settings.production
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
      - DB_HOST=db
      - DB_PORT=5432
      - SECRET_KEY=${SECRET_KEY}
    depends_on:
      - db
    networks:
      - backend
    volumes:
      - ./logs:/var/log/django

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - api
    networks:
      - backend

volumes:
  postgres_data:

networks:
  backend:
```

#### 5. Nginx Configuration

`nginx.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    upstream django {
        server api:8000;
    }

    server {
        listen 80;
        server_name your-api-domain.com;
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl;
        server_name your-api-domain.com;

        ssl_certificate /etc/ssl/certs/cert.pem;
        ssl_certificate_key /etc/ssl/certs/key.pem;

        location / {
            proxy_pass http://django;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        location /static/ {
            alias /app/staticfiles/;
        }
    }
}
```

#### 6. Deploy to EC2

```bash
# 1. Launch EC2 instance (Ubuntu 22.04)
# 2. Install Docker and Docker Compose
sudo apt update
sudo apt install docker.io docker-compose-v2

# 3. Clone repository
git clone <your-repo-url>
cd app/backend

# 4. Create .env file
cat > .env << EOF
SECRET_KEY=your-production-secret-key
DB_NAME=production_db
DB_USER=postgres
DB_PASSWORD=secure-password
EOF

# 5. Deploy
docker compose -f docker-compose.prod.yml up -d

# 6. Run migrations
docker compose exec api python manage.py migrate

# 7. Create superuser
docker compose exec api python manage.py createsuperuser
```

### Option 2: Heroku Deployment

#### 1. Prepare for Heroku

`Procfile`:
```
release: python manage.py migrate
web: gunicorn backend.wsgi:application
```

`runtime.txt`:
```
python-3.11.2
```

#### 2. Install Heroku CLI and Deploy

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:essential-0

# Set environment variables
heroku config:set SECRET_KEY=your-secret-key
heroku config:set DJANGO_SETTINGS_MODULE=backend.settings.production

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# Run migrations
heroku run python manage.py migrate

# Create superuser
heroku run python manage.py createsuperuser
```

## Frontend Deployment (React)

### Option 1: Netlify

#### 1. Prepare Build Configuration

`frontend/.env.production`:
```env
REACT_APP_API_URL=https://your-api-domain.com/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

`frontend/netlify.toml`:
```toml
[build]
  publish = "build"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

#### 2. Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Build project
cd frontend
npm run build

# Deploy
netlify deploy --prod --dir=build
```

### Option 2: AWS S3 + CloudFront

#### 1. Build Production

```bash
cd frontend
npm run build
```

#### 2. Deploy to S3

```bash
# Install AWS CLI
pip install awscli

# Configure AWS credentials
aws configure

# Create S3 bucket
aws s3 mb s3://your-frontend-bucket

# Upload build files
aws s3 sync build/ s3://your-frontend-bucket --delete

# Set bucket policy for public read
aws s3api put-bucket-policy --bucket your-frontend-bucket --policy file://bucket-policy.json
```

`bucket-policy.json`:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-frontend-bucket/*"
    }
  ]
}
```

#### 3. Create CloudFront Distribution

```bash
aws cloudfront create-distribution --distribution-config file://distribution-config.json
```

## Mobile App Deployment (Expo)

### Option 1: Expo Application Services (EAS)

#### 1. Install EAS CLI

```bash
npm install -g @expo/eas-cli
```

#### 2. Configure EAS

`MyLoginApp/eas.json`:
```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

#### 3. Build and Submit

```bash
cd MyLoginApp

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

### Option 2: Manual Build

#### Android APK Build

```bash
cd MyLoginApp

# Build APK
expo build:android

# Download APK
expo build:status
```

#### iOS Build

```bash
# Build for iOS (requires macOS)
expo build:ios

# Download IPA file
expo build:status
```

## Database Setup

### AWS RDS PostgreSQL

#### 1. Create RDS Instance

```bash
aws rds create-db-instance \
  --db-instance-identifier myapp-production \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username postgres \
  --master-user-password secure-password \
  --allocated-storage 20 \
  --vpc-security-group-ids sg-xxxxxx \
  --db-name production_db
```

#### 2. Configure Security Groups

```bash
# Allow access from EC2 instances
aws ec2 authorize-security-group-ingress \
  --group-id sg-database \
  --protocol tcp \
  --port 5432 \
  --source-group sg-backend
```

### Database Migration

```bash
# Backup development data
pg_dump development_db > backup.sql

# Restore to production
psql -h production-db-host -U postgres -d production_db < backup.sql

# Run Django migrations
python manage.py migrate --settings=backend.settings.production
```

## Domain & SSL Configuration

### Option 1: Let's Encrypt with Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-api-domain.com -d your-frontend-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Option 2: AWS Certificate Manager

```bash
# Request certificate
aws acm request-certificate \
  --domain-name your-domain.com \
  --subject-alternative-names www.your-domain.com \
  --validation-method DNS
```

## Monitoring & Logging

### Backend Monitoring

#### 1. Application Logs

`backend/settings/production.py`:
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/var/log/django/app.log',
            'maxBytes': 1024*1024*10,  # 10MB
            'backupCount': 5,
            'formatter': 'verbose',
        },
        'error_file': {
            'level': 'ERROR',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': '/var/log/django/error.log',
            'maxBytes': 1024*1024*10,
            'backupCount': 5,
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
        },
        'accaunts': {
            'handlers': ['file', 'error_file'],
            'level': 'DEBUG',
        },
    },
}
```

#### 2. Health Check Endpoint

`backend/accaunts/views.py`:
```python
from django.http import JsonResponse
from django.views import View

class HealthCheckView(View):
    def get(self, request):
        return JsonResponse({
            'status': 'healthy',
            'timestamp': timezone.now().isoformat()
        })
```

### Monitoring with AWS CloudWatch

```bash
# Install CloudWatch agent on EC2
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm

# Configure CloudWatch agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
```

## CI/CD Pipeline

### GitHub Actions Workflow

`.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: 3.11
          
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          
      - name: Run tests
        run: |
          cd backend  
          python manage.py test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "your-app-name"
          heroku_email: "your-email@example.com"
          appdir: "backend"

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install and build
        run: |
          cd frontend
          npm ci
          npm run build
          
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v1.2
        with:
          publish-dir: './frontend/build'
          production-branch: main
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## Security Checklist

### Django Security

- [ ] `DEBUG = False` in production
- [ ] Strong `SECRET_KEY` in environment variables
- [ ] Secure database credentials
- [ ] HTTPS enforcement (`SECURE_SSL_REDIRECT = True`)
- [ ] Secure cookies (`SECURE_COOKIE_*` settings)
- [ ] CORS properly configured
- [ ] Rate limiting implemented (consider django-ratelimit)
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (use Django ORM)
- [ ] XSS protection headers
- [ ] CSRF protection enabled

### Infrastructure Security

- [ ] SSL/TLS certificates configured
- [ ] Security groups properly configured
- [ ] Database not publicly accessible
- [ ] Regular security updates
- [ ] Backup strategy implemented
- [ ] Log monitoring in place
- [ ] Environment variables secured
- [ ] API keys rotated regularly

### Application Security

- [ ] JWT tokens with short expiration
- [ ] Refresh token rotation
- [ ] Password strength requirements
- [ ] Account lockout after failed attempts
- [ ] Email verification for registration
- [ ] Secure password reset flow
- [ ] Input sanitization
- [ ] File upload restrictions

## Troubleshooting

### Common Issues

#### 1. CORS Errors
```bash
# Check CORS settings in Django
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.com",
]

# Verify frontend API URL
REACT_APP_API_URL=https://your-api-domain.com/api
```

#### 2. Database Connection Issues
```bash
# Test database connection
python manage.py dbshell

# Check environment variables
echo $DB_HOST $DB_PORT $DB_NAME
```

#### 3. SSL Certificate Issues
```bash
# Test SSL configuration
openssl s_client -connect your-domain.com:443

# Check certificate expiration
openssl x509 -in cert.pem -text -noout | grep "Not After"
```

#### 4. Static Files Not Loading
```bash
# Collect static files
python manage.py collectstatic --noinput

# Check Nginx configuration
nginx -t
```

### Debugging Commands

```bash
# Check Django logs
tail -f /var/log/django/app.log

# Check Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Check Docker container logs
docker compose logs -f api

# Database queries
python manage.py dbshell
```

### Performance Monitoring

```bash
# Install Django Debug Toolbar (development only)
pip install django-debug-toolbar

# Monitor database queries
python manage.py show_slow_queries

# Monitor memory usage
docker stats
```

### Rollback Strategy

```bash
# Rollback Heroku deployment
heroku rollback v123

# Rollback Docker deployment
docker compose down
git checkout previous-commit
docker compose up -d

# Database rollback
pg_restore --clean --if-exists -d production_db backup_before_deploy.sql
```

This deployment guide provides comprehensive instructions for deploying the JWT authentication system to production environments with proper security, monitoring, and maintenance procedures.