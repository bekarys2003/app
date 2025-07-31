# Code Architecture Documentation

## System Architecture Overview

This document provides detailed architectural information about the JWT Authentication System, including component relationships, data flow, and technical decisions.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT APPLICATIONS                                 │
├─────────────────────────────┬───────────────────────────────────────────────────┤
│     React Web Frontend     │            React Native Mobile App               │
│                             │                                                   │
│  ┌─────────────────────┐   │  ┌─────────────────────────────────────────────┐ │
│  │     Components      │   │  │            Screens                          │ │
│  │  - Login.tsx        │   │  │  - HomeScreen.tsx                           │ │
│  │  - Register.tsx     │   │  │  - BrowseScreen.tsx                         │ │
│  │  - Home.tsx         │   │  │  - ReservesScreen.tsx                       │ │
│  │  - Nav.tsx          │   │  │  - ItemDetail.tsx                           │ │
│  │  - Forgot.tsx       │   │  │  - TransitionScreen.tsx                     │ │
│  │  - Reset.tsx        │   │  └─────────────────────────────────────────────┘ │
│  └─────────────────────┘   │                                                   │
│                             │  ┌─────────────────────────────────────────────┐ │
│  ┌─────────────────────┐   │  │          Components                         │ │
│  │   State Management  │   │  │  - CardList.tsx                             │ │
│  │  - Redux Store      │   │  │  - [Other Components]                       │ │
│  │  - authSlice.ts     │   │  └─────────────────────────────────────────────┘ │
│  └─────────────────────┘   │                                                   │
│                             │  ┌─────────────────────────────────────────────┐ │
│  ┌─────────────────────┐   │  │           Navigation                        │ │
│  │     Routing         │   │  │  - Expo Router                              │ │
│  │  - React Router     │   │  │  - Tab Navigation                           │ │
│  │  - Route Guards     │   │  │  - Stack Navigation                         │ │
│  └─────────────────────┘   │  └─────────────────────────────────────────────┘ │
└─────────────────────────────┴───────────────────────────────────────────────────┘
                                            │
                                  HTTP/HTTPS Requests
                                   (JSON over REST)
                                            │
┌───────────────────────────────────────────▼───────────────────────────────────────┐
│                            API GATEWAY LAYER                                      │
│                         (Django REST Framework)                                   │
├────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                    │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐      │
│  │    URL Routing      │  │    Middleware       │  │   Authentication    │      │
│  │  - backend/urls.py  │  │  - CORS Middleware  │  │  - JWTAuthentication│      │
│  │  - accaunts/urls.py │  │  - Security Headers │  │  - Token Validation │      │
│  │                     │  │  - Session Handling │  │  - User Resolution  │      │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘      │
│                                                                                    │
└────────────────────────────────▼───────────────────────────────────────────────────┘
                                 │
┌────────────────────────────────▼───────────────────────────────────────────────────┐
│                           BUSINESS LOGIC LAYER                                    │
│                              (Django Views)                                       │
├────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                    │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐      │
│  │   User Management   │  │   Authentication    │  │   Token Management  │      │
│  │  - RegisterAPIView  │  │  - LoginAPIView     │  │  - RefreshAPIView   │      │
│  │  - UserAPIView      │  │  - GoogleAuthAPIView│  │  - LogoutAPIView    │      │
│  │                     │  │                     │  │                     │      │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘      │
│                                                                                    │
│  ┌─────────────────────┐  ┌─────────────────────┐                               │
│  │  Password Recovery  │  │   Data Validation   │                               │
│  │  - ForgotAPIView    │  │  - UserSerializer   │                               │
│  │  - ResetAPIView     │  │  - Form Validation  │                               │
│  │                     │  │  - Input Sanitization│                             │
│  └─────────────────────┘  └─────────────────────┘                               │
│                                                                                    │
└────────────────────────────────▼───────────────────────────────────────────────────┘
                                 │
┌────────────────────────────────▼───────────────────────────────────────────────────┐
│                              DATA LAYER                                           │
│                         (Django ORM & Models)                                     │
├────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                    │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐      │
│  │      User Model     │  │   UserToken Model   │  │    Reset Model      │      │
│  │  - Custom User      │  │  - Refresh Tokens   │  │  - Password Reset   │      │
│  │  - Email-based Auth │  │  - Token Tracking   │  │  - Reset Tokens     │      │
│  │  - UserManager      │  │  - Expiration       │  │  - Email Association│      │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘      │
│                                                                                    │
└────────────────────────────────▼───────────────────────────────────────────────────┘
                                 │
┌────────────────────────────────▼───────────────────────────────────────────────────┐
│                           DATABASE LAYER                                          │
│                            (PostgreSQL)                                           │
├────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                    │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐      │
│  │   accaunts_user     │  │ accaunts_usertoken  │  │  accaunts_reset     │      │
│  │  - id (PK)          │  │  - id (PK)          │  │  - id (PK)          │      │
│  │  - email (UNIQUE)   │  │  - user_id (FK)     │  │  - email            │      │
│  │  - password (HASH)  │  │  - token            │  │  - token (UNIQUE)   │      │
│  │  - first_name       │  │  - expired_at       │  │                     │      │
│  │  - last_name        │  │  - created_at       │  │                     │      │
│  │  - is_active        │  │                     │  │                     │      │
│  │  - date_joined      │  │                     │  │                     │      │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘      │
│                                                                                    │
└────────────────────────────────────────────────────────────────────────────────────┘
```

## Component Interaction Flow

### Authentication Flow Sequence

```
┌─────────┐    ┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────┐
│ Client  │    │   Frontend  │    │   Django     │    │   Database  │    │ External │
│ Browser │    │ Application │    │   Backend    │    │ PostgreSQL  │    │ Services │
└────┬────┘    └──────┬──────┘    └──────┬───────┘    └──────┬──────┘    └─────┬────┘
     │                │                  │                   │                 │
     │ 1. Access App  │                  │                   │                 │
     ├───────────────►│                  │                   │                 │
     │                │                  │                   │                 │
     │ 2. Login Form  │                  │                   │                 │
     │◄───────────────┤                  │                   │                 │
     │                │                  │                   │                 │
     │ 3. Submit Creds│                  │                   │                 │
     ├───────────────►│ 4. POST /login   │                   │                 │
     │                ├─────────────────►│ 5. Validate User  │                 │
     │                │                  ├──────────────────►│                 │
     │                │                  │ 6. User Found     │                 │
     │                │                  │◄──────────────────┤                 │
     │                │                  │ 7. Create Tokens  │                 │
     │                │                  │ 8. Store Refresh  │                 │
     │                │                  ├──────────────────►│                 │
     │                │ 9. Return Access │                   │                 │
     │                │    Token + Cookie│                   │                 │
     │                │◄─────────────────┤                   │                 │
     │10. Set Auth     │                  │                   │                 │
     │   Headers       │                  │                   │                 │
     │◄───────────────┤                  │                   │                 │
     │                │                  │                   │                 │
     │11. API Request │                  │                   │                 │
     ├───────────────►│12. Authenticated │                   │                 │
     │                │   Request        │                   │                 │
     │                ├─────────────────►│13. Verify Token   │                 │
     │                │                  │14. Get User Data  │                 │
     │                │                  ├──────────────────►│                 │
     │                │15. Response Data │                   │                 │
     │                │◄─────────────────┤                   │                 │
     │16. Display Data│                  │                   │                 │
     │◄───────────────┤                  │                   │                 │
```

### Google OAuth Flow

```
┌─────────┐    ┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────┐
│ Client  │    │   Frontend  │    │   Django     │    │   Database  │    │  Google  │
│ Browser │    │ Application │    │   Backend    │    │ PostgreSQL  │    │   APIs   │
└────┬────┘    └──────┬──────┘    └──────┬───────┘    └──────┬──────┘    └─────┬────┘
     │                │                  │                   │                 │
     │ 1. Click Google│                  │                   │                 │
     │    Login Button│                  │                   │                 │
     ├───────────────►│                  │                   │                 │
     │                │ 2. Google OAuth  │                   │                 │
     │                │    Popup         │                   │                 │
     │                ├─────────────────────────────────────────────────────►│
     │                │                  │                   │ 3. User Auth   │
     │                │                  │                   │ 4. Grant Perms │
     │                │ 5. Return Token  │                   │                 │
     │                │◄─────────────────────────────────────────────────────┤
     │                │ 6. POST /google- │                   │                 │
     │                │    -auth         │                   │                 │
     │                ├─────────────────►│ 7. Verify Token   │                 │
     │                │                  ├─────────────────────────────────────►│
     │                │                  │ 8. User Info      │                 │
     │                │                  │◄─────────────────────────────────────┤
     │                │                  │ 9. Find/Create    │                 │
     │                │                  │    User           │                 │
     │                │                  ├──────────────────►│                 │
     │                │                  │10. Create Tokens  │                 │
     │                │11. Return Access │                   │                 │
     │                │    Token         │                   │                 │
     │                │◄─────────────────┤                   │                 │
     │12. User Logged │                  │                   │                 │
     │    In          │                  │                   │                 │
     │◄───────────────┤                  │                   │                 │
```

## Detailed Component Architecture

### Backend Architecture (Django)

#### 1. Project Structure
```
backend/
├── backend/                    # Main Django project
│   ├── __init__.py
│   ├── settings.py            # Configuration
│   ├── urls.py                # Root URL routing
│   ├── wsgi.py                # WSGI application
│   └── asgi.py                # ASGI application
├── accaunts/                  # Authentication app
│   ├── __init__.py
│   ├── models.py              # Data models
│   ├── views.py               # API views/controllers
│   ├── serializers.py         # Data serialization
│   ├── authentication.py      # JWT implementation
│   ├── urls.py                # App URL routing
│   ├── admin.py               # Admin interface
│   ├── apps.py                # App configuration
│   ├── tests.py               # Unit tests
│   └── migrations/            # Database migrations
└── manage.py                  # Django management
```

#### 2. Model Relationships
```python
User (AbstractUser)
├── id: Primary Key
├── email: Unique identifier (USERNAME_FIELD)
├── first_name: User's first name
├── last_name: User's last name
├── password: Hashed password
└── Related Models:
    ├── UserToken (One-to-Many)
    │   ├── user_id: Foreign Key to User
    │   ├── token: Refresh token string
    │   ├── expired_at: Token expiration
    │   └── created_at: Token creation time
    └── Reset (One-to-Many via email)
        ├── email: User's email
        └── token: Reset token string
```

#### 3. Authentication System
```python
JWT Authentication System:
├── Access Tokens (Short-lived: 30 seconds)
│   ├── Payload: { user_id, exp, iat }
│   ├── Secret: 'access_secret'
│   └── Usage: Authorization header
├── Refresh Tokens (Long-lived: 7 days)
│   ├── Payload: { user_id, exp, iat }
│   ├── Secret: 'refresh_secret'
│   ├── Storage: HTTP-only cookie
│   └── Database tracking in UserToken model
└── Token Refresh Flow:
    ├── Client sends refresh token via cookie
    ├── Server validates token and checks database
    ├── Issues new access token
    └── Optional: Rotate refresh token
```

### Frontend Architecture (React)

#### 1. Component Hierarchy
```
App.tsx (Root)
├── BrowserRouter
├── Nav.tsx (Navigation)
└── Routes
    ├── Login.tsx
    │   ├── Form validation
    │   ├── Google OAuth button
    │   └── Redirect logic
    ├── Register.tsx
    │   ├── Form validation
    │   └── Password confirmation
    ├── Home.tsx
    │   ├── Protected route
    │   └── User dashboard
    ├── Forgot.tsx
    │   └── Password reset request
    └── Reset.tsx
        └── Password reset form
```

#### 2. State Management
```
Redux Store (store.ts)
└── authSlice.ts
    ├── State: { value: boolean }
    ├── Actions: { setAuth }
    └── Reducers: Authentication status
```

#### 3. HTTP Configuration
```
Axios Configuration (interceptors/axios.ts)
├── Base URL: http://localhost:8000/api/
├── Credentials: withCredentials: true
├── Request Interceptors:
│   └── Add Authorization header
└── Response Interceptors:
    ├── Handle 401 errors
    └── Auto-refresh tokens
```

### Mobile App Architecture (React Native/Expo)

#### 1. Navigation Structure
```
Expo Router (_layout.tsx)
├── Asset preloading
├── Font loading
├── Splash screen management
└── Tab Navigation
    ├── HomeScreen.tsx
    │   ├── Restaurant listings
    │   ├── Animated transitions
    │   └── ScrollView components
    ├── BrowseScreen.tsx
    ├── ReservesScreen.tsx
    ├── ItemDetail.tsx
    └── TransitionScreen.tsx
```

#### 2. Component Architecture
```
Screen Components
├── HomeScreen.tsx
│   ├── useSharedValue (animations)
│   ├── useAnimatedStyle
│   ├── CardList integration
│   └── Restaurant data management
├── BrowseScreen.tsx
├── ReservesScreen.tsx
└── Common Components
    ├── CardList.tsx
    │   ├── Restaurant card rendering
    │   ├── Image handling
    │   └── Section organization
    └── [Other reusable components]
```

## Data Flow Patterns

### 1. Authentication Data Flow
```
User Input → Form Validation → API Request → JWT Creation → Token Storage → Authenticated Requests
```

### 2. State Management Flow
```
User Action → Redux Action → Reducer → State Update → Component Re-render
```

### 3. API Data Flow
```
Component → Axios Request → Interceptor → Django View → Database Query → Response → Component Update
```

## Security Architecture

### 1. Authentication Security
```
Security Layer Stack:
├── HTTPS/TLS Encryption
├── CORS Protection
├── JWT Token Validation
├── HTTP-Only Cookies
├── Token Expiration
├── Database Token Tracking
└── Password Hashing (PBKDF2)
```

### 2. Input Validation
```
Validation Layers:
├── Frontend Form Validation
├── React Form Validation
├── Django Serializer Validation
├── Django Model Validation
└── Database Constraints
```

### 3. Security Headers
```
HTTP Security Headers:
├── X-Content-Type-Options: nosniff
├── X-Frame-Options: DENY
├── X-XSS-Protection: 1; mode=block
├── Strict-Transport-Security (Production)
└── Content-Security-Policy (Production)
```

## Performance Considerations

### 1. Database Optimization
```
Database Performance:
├── Indexes on frequently queried fields
├── Query optimization in Django ORM
├── Connection pooling in production
└── Database query monitoring
```

### 2. Frontend Optimization
```
React Performance:
├── Code splitting with React.lazy
├── Memoization with React.memo
├── Bundle optimization with Webpack
└── Asset optimization (images, fonts)
```

### 3. Mobile App Optimization
```
Expo/React Native Performance:
├── Asset preloading
├── Image optimization
├── Animation performance (useNativeDriver)
└── Bundle size optimization
```

## Scalability Architecture

### 1. Horizontal Scaling
```
Scaling Strategy:
├── Load balancer (Nginx/AWS ALB)
├── Multiple Django instances
├── Database read replicas
├── CDN for static assets
└── Redis for session storage
```

### 2. Microservices Preparation
```
Service Separation:
├── Authentication Service (Current)
├── User Management Service
├── Email Service
├── File Storage Service
└── Analytics Service
```

## Monitoring and Observability

### 1. Logging Architecture
```
Logging Levels:
├── Application Logs (Django)
├── Access Logs (Nginx)
├── Database Logs (PostgreSQL)
├── Error Tracking (Sentry)
└── Performance Monitoring (New Relic)
```

### 2. Metrics Collection
```
Key Metrics:
├── Authentication success/failure rates
├── API response times
├── Database query performance
├── User session duration
└── Error rates by endpoint
```

This architectural documentation provides a comprehensive view of how all components interact and the design decisions behind the JWT authentication system.