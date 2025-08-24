# Local Development Setup Guide

## Overview
This guide will help you set up the JWT Authentication System on your local development environment. The project consists of three main components that need to be configured and run.

## Prerequisites

### Required Software
- **Python 3.8+** (Recommended: 3.11)
- **Node.js 16+** (Recommended: 18 LTS)
- **PostgreSQL 12+** (Recommended: 15)
- **Git**
- **Code Editor** (VS Code recommended)

### Optional Tools
- **Docker & Docker Compose** (for containerized development)
- **Postman** (for API testing)
- **pgAdmin** (PostgreSQL GUI)

### Installation Commands

#### macOS (using Homebrew)
```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install required software
brew install python@3.11 node postgresql git
brew install --cask visual-studio-code

# Start PostgreSQL service
brew services start postgresql
```

#### Ubuntu/Debian
```bash
# Update package list
sudo apt update

# Install Python
sudo apt install python3.11 python3.11-venv python3-pip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Git
sudo apt install git
```

#### Windows
1. Download and install Python from [python.org](https://python.org)
2. Download and install Node.js from [nodejs.org](https://nodejs.org)
3. Download and install PostgreSQL from [postgresql.org](https://postgresql.org)
4. Install Git from [git-scm.com](https://git-scm.com)
5. Install VS Code from [code.visualstudio.com](https://code.visualstudio.com)

## Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/bekarys2003/app.git
cd app
```

### 2. Database Setup

#### Create PostgreSQL Database

```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# Create database and user
CREATE DATABASE jwt_auth_db;
CREATE USER jwt_auth_user WITH PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE jwt_auth_db TO jwt_auth_user;
\q
```

#### Test Database Connection

```bash
psql -h localhost -U jwt_auth_user -d jwt_auth_db
# Enter password when prompted
# If successful, you should see the PostgreSQL prompt
\q
```

## Backend Setup (Django)

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Verify activation (should show virtual environment path)
which python
```

### 3. Install Dependencies

```bash
pip install --upgrade pip
pip install django djangorestframework django-cors-headers psycopg2-binary PyJWT python-decouple google-auth
```

Or use requirements.txt if available:
```bash
pip install -r requirements.txt
```

### 4. Environment Configuration

Create `.env` file in the backend directory:

```bash
# Create .env file
touch .env

# Add the following content to .env
cat > .env << 'EOF'
SECRET_KEY=django-insecure-your-secret-key-for-development-only
DEBUG=True
DB_NAME=jwt_auth_db
DB_USER=jwt_auth_user
DB_PASSWORD=your_password_here
DB_HOST=localhost
DB_PORT=5432
EOF
```

### 5. Database Migrations

```bash
# Create and apply migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser
```

### 6. Test Backend

```bash
# Run development server
python manage.py runserver

# In another terminal, test the API
curl http://localhost:8000/api/register
```

Expected output: `{"detail":"Method \"GET\" not allowed."}`

This confirms the API is running correctly.

### 7. Load Sample Data (Optional)

Create sample users for testing:

```bash
python manage.py shell
```

```python
from accaunts.models import User

# Create test user
user = User.objects.create_user(
    email='test@example.com',
    password='testpass123',
    first_name='Test',
    last_name='User'
)
print(f"Created user: {user.email}")
exit()
```

## Frontend Setup (React)

### 1. Navigate to Frontend Directory

```bash
cd ../frontend
```

### 2. Install Dependencies

```bash
# Install npm packages
npm install

# Verify installation
npm list --depth=0
```

### 3. Environment Configuration

Create `.env` file in the frontend directory:

```bash
# Create .env file
touch .env

# Add configuration
cat > .env << 'EOF'
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here
EOF
```

### 4. Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add `http://localhost:3000` to authorized origins
6. Copy Client ID to `.env` file

### 5. Test Frontend

```bash
# Start development server
npm start

# Browser should open to http://localhost:3000
# You should see the login page
```

### 6. Test Full Authentication Flow

1. Open browser to `http://localhost:3000`
2. Click "Register" and create an account
3. Login with the new account
4. You should be redirected to the home page

## Mobile App Setup (React Native/Expo)

### 1. Navigate to Mobile App Directory

```bash
cd ../MyLoginApp
```

### 2. Install Dependencies

```bash
# Install npm packages
npm install

# Install Expo CLI globally
npm install -g @expo/cli
```

### 3. Install Expo Go App

- **iOS**: Download from App Store
- **Android**: Download from Google Play Store

### 4. Start Development Server

```bash
# Start Expo development server
npx expo start

# Or with specific options
npx expo start --clear
```

### 5. Run on Device/Simulator

#### Physical Device
1. Scan QR code with Expo Go app
2. App will load on your device

#### iOS Simulator (macOS only)
```bash
npx expo start --ios
```

#### Android Emulator
```bash
npx expo start --android
```

## Development Workflow

### Daily Development Setup

Create a startup script to launch all services:

`start-dev.sh`:
```bash
#!/bin/bash

# Start PostgreSQL (if not running)
brew services start postgresql  # macOS
# sudo service postgresql start  # Linux

# Start backend
cd backend
source venv/bin/activate
python manage.py runserver &
BACKEND_PID=$!

# Start frontend
cd ../frontend
npm start &
FRONTEND_PID=$!

# Start mobile app
cd ../MyLoginApp
npx expo start &
EXPO_PID=$!

echo "All services started!"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo "Mobile: Scan QR code with Expo Go"

# Wait for user input to stop services
read -p "Press Enter to stop all services..."

# Stop all services
kill $BACKEND_PID $FRONTEND_PID $EXPO_PID
echo "All services stopped."
```

Make it executable:
```bash
chmod +x start-dev.sh
./start-dev.sh
```

### Testing the Complete Flow

1. **Backend API Test**:
```bash
# Test registration
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"John","last_name":"Doe","email":"john@test.com","password":"testpass123","password_confirm":"testpass123"}'

# Test login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"testpass123"}' \
  -c cookies.txt

# Test authenticated endpoint
curl -X GET http://localhost:8000/api/user \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

2. **Frontend Test**:
   - Navigate to `http://localhost:3000`
   - Test registration and login forms
   - Verify navigation between pages
   - Check browser console for errors

3. **Mobile App Test**:
   - Launch app in Expo Go
   - Test navigation between screens
   - Verify animations work correctly

## Development Tools & Extensions

### VS Code Extensions

Install these extensions for better development experience:

```bash
# Install VS Code extensions
code --install-extension ms-python.python
code --install-extension ms-vscode.vscode-json
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-typescript-next
```

### Browser Extensions

- **React Developer Tools** - Chrome/Firefox
- **Redux DevTools** - Chrome/Firefox
- **Apollo Client Devtools** - If using GraphQL

### Database Tools

#### pgAdmin (GUI for PostgreSQL)
```bash
# macOS
brew install --cask pgadmin4

# Ubuntu
sudo apt install pgadmin4
```

#### Command Line Tools
```bash
# View database tables
psql -h localhost -U jwt_auth_user -d jwt_auth_db -c "\dt"

# View user records
psql -h localhost -U jwt_auth_user -d jwt_auth_db -c "SELECT * FROM accaunts_user;"
```

## Troubleshooting

### Common Issues

#### 1. Python Virtual Environment Issues
```bash
# If venv activation fails
python3 -m venv --clear venv
source venv/bin/activate
pip install --upgrade pip
```

#### 2. PostgreSQL Connection Issues
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql  # macOS
sudo service postgresql status        # Linux

# Reset PostgreSQL password
sudo -u postgres psql -c "ALTER USER jwt_auth_user PASSWORD 'newpassword';"
```

#### 3. Node.js Version Issues
```bash
# Check Node.js version
node --version
npm --version

# Use Node Version Manager (nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

#### 4. Port Already in Use
```bash
# Find process using port 8000
lsof -ti:8000
kill -9 $(lsof -ti:8000)

# Find process using port 3000
lsof -ti:3000
kill -9 $(lsof -ti:3000)
```

#### 5. CORS Issues
Make sure Django settings include:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
CORS_ALLOW_CREDENTIALS = True
```

#### 6. JWT Token Issues
Check token expiration in authentication.py:
```python
# Access tokens expire in 30 seconds (for development, increase to 15 minutes)
'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=15),
```

### Debug Commands

#### Backend Debugging
```bash
# Enable Django debug mode
export DJANGO_DEBUG=True

# Run with verbose output
python manage.py runserver --verbosity=2

# Check migrations status
python manage.py showmigrations

# Test database connection
python manage.py dbshell
```

#### Frontend Debugging
```bash
# Clear npm cache
npm cache clean --force

# Reinstall node_modules
rm -rf node_modules package-lock.json
npm install

# Run with verbose logging
npm start --verbose
```

#### Mobile App Debugging
```bash
# Clear Expo cache
npx expo start --clear

# Reset project
npm run reset-project

# Check Expo doctor
npx expo doctor
```

### Performance Tips

1. **Database Optimization**:
   - Create indexes for frequently queried fields
   - Use connection pooling in production

2. **Frontend Optimization**:
   - Enable React Fast Refresh
   - Use React DevTools Profiler

3. **Mobile App Optimization**:
   - Optimize images and assets
   - Use Expo development build for faster testing

## Next Steps

After successful setup:

1. **Explore the Code**:
   - Read through Django models and views
   - Understand React component structure
   - Review Expo app navigation

2. **Make Changes**:
   - Add new API endpoints
   - Create new React components
   - Modify mobile app screens

3. **Testing**:
   - Write unit tests for Django views
   - Add React component tests
   - Test mobile app functionality

4. **Deployment**:
   - Follow the deployment guide for production setup
   - Set up CI/CD pipeline

## Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [React Documentation](https://react.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [PostgreSQL Documentation](https://postgresql.org/docs/)

This setup guide should get you up and running with the complete JWT authentication system for local development!