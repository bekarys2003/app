# JWT Authentication System

A comprehensive full-stack authentication system built with Django REST API, React frontend, and React Native mobile app. Features JWT token authentication, Google OAuth integration, and modern security practices.

## 🚀 Quick Start

This project contains three main components:
- **Backend**: Django REST API with JWT authentication
- **Frontend**: React web application with TypeScript
- **Mobile App**: React Native/Expo cross-platform mobile app

## 📚 Complete Documentation

### 📖 **[Complete Code Documentation](./DOCUMENTATION.md)**
Comprehensive explanation of the entire codebase including:
- Project architecture and technology stack
- Detailed code explanations for all components
- Authentication flow and security implementation
- Database schema and API endpoints

### 🛠️ **[Local Development Setup](./SETUP_GUIDE.md)**
Step-by-step guide to set up the project locally:
- Prerequisites and installation instructions
- Backend, frontend, and mobile app configuration
- Database setup and environment configuration
- Development workflow and troubleshooting

### 🔌 **[API Reference](./API_REFERENCE.md)**
Complete API documentation including:
- All endpoints with request/response examples
- Authentication requirements
- Error handling and status codes
- Code examples in multiple languages

### 🚀 **[Deployment Guide](./DEPLOYMENT_GUIDE.md)**
Production deployment instructions:
- AWS, Heroku, and other platform deployments
- SSL configuration and security setup
- CI/CD pipeline configuration
- Monitoring and maintenance

## ✨ Key Features

- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Google OAuth** - Social login integration
- ✅ **Multi-platform** - Web and mobile applications
- ✅ **Modern Stack** - Django, React, React Native/Expo
- ✅ **TypeScript** - Type-safe development
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Security First** - HTTPS, CORS, secure cookies
- ✅ **Real-time Refresh** - Automatic token refresh
- ✅ **Password Reset** - Email-based password recovery

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    
│   React Web     │    │  React Native   │    
│   Frontend      │    │  Mobile App     │    
│   (Port 3000)   │    │   (Expo)        │    
└─────────┬───────┘    └─────────┬───────┘    
          │                      │            
          │         HTTP API     │            
          └──────────────────────┼───────────┐
                                 │           │
                    ┌────────────▼───────────▼─┐
                    │   Django REST API        │
                    │   Backend Server         │
                    │   (Port 8000)            │
                    └─────────┬────────────────┘
                              │
                    ┌─────────▼────────────┐
                    │   PostgreSQL         │
                    │   Database           │
                    └──────────────────────┘
```

## 🛠️ Technology Stack

### Backend
- **Django 5.0.7** - Web framework
- **Django REST Framework** - API framework
- **PostgreSQL** - Database
- **JWT** - Authentication tokens
- **Google OAuth 2.0** - Social authentication

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Axios** - HTTP client
- **Bootstrap** - UI components

### Mobile App
- **React Native** - Mobile framework
- **Expo SDK 53** - Development platform
- **TypeScript** - Type safety
- **Expo Router** - Navigation
- **React Native Reanimated** - Animations

## 🚀 Quick Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/bekarys2003/app.git
   cd app
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Mobile App Setup**
   ```bash
   cd MyLoginApp
   npm install
   npx expo start
   ```

For detailed setup instructions, see the **[Setup Guide](./SETUP_GUIDE.md)**.

## 📱 Screenshots & Demo

### Web Application
- Login/Register forms with validation
- Dashboard with user authentication
- Password reset functionality
- Google OAuth integration

### Mobile Application
- Restaurant/food delivery interface
- Smooth animations and transitions
- Cross-platform compatibility (iOS/Android)

## 🔐 Security Features

- **JWT Tokens**: Short-lived access tokens (30s) with refresh tokens (7d)
- **HTTP-Only Cookies**: Secure refresh token storage
- **CORS Protection**: Configured for specific origins
- **Password Security**: Django's built-in hashing and validation
- **Email Verification**: Secure password reset flow
- **Google OAuth**: Server-side token verification

## 🧪 Testing

```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
cd frontend
npm test

# API testing with curl
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## 📈 Performance

- **Fast Development**: Hot reload for all components
- **Optimized Builds**: Production-ready optimizations
- **Asset Preloading**: Mobile app assets preloaded
- **Efficient Queries**: Optimized database queries

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you have any questions or need help with setup:

1. Check the **[Documentation](./DOCUMENTATION.md)** for detailed explanations
2. Review the **[Setup Guide](./SETUP_GUIDE.md)** for installation help
3. Consult the **[API Reference](./API_REFERENCE.md)** for API usage
4. Follow the **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** for production setup

## 🌟 Acknowledgments

- Django and Django REST Framework communities
- React and React Native teams
- Expo development platform
- All contributors and testers
