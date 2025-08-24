# JWT Authentication System - Complete Code Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Backend (Django REST API)](#backend-django-rest-api)
4. [Frontend (React Web App)](#frontend-react-web-app)
5. [Mobile App (React Native/Expo)](#mobile-app-react-nativeexpo)
6. [Authentication Flow](#authentication-flow)
7. [API Documentation](#api-documentation)
8. [Database Schema](#database-schema)
9. [Setup Instructions](#setup-instructions)
10. [Security Considerations](#security-considerations)
11. [Deployment](#deployment)

## Project Overview

This is a full-stack JWT authentication system that demonstrates modern web and mobile development practices. The project consists of three main components:

- **Django REST API Backend**: Handles user authentication, JWT token management, and Google OAuth integration
- **React Web Frontend**: Modern web interface for user authentication and dashboard
- **React Native/Expo Mobile App**: Cross-platform mobile application with restaurant/food delivery interface

### Key Features
- ✅ User registration and login
- ✅ JWT token-based authentication with refresh tokens
- ✅ Google OAuth integration
- ✅ Password reset functionality
- ✅ Multi-platform support (Web + Mobile)
- ✅ Modern UI with animations and responsive design
- ✅ Secure authentication flow with HTTP-only cookies

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Web     │    │  React Native   │    │  External APIs  │
│   Frontend      │    │  Mobile App     │    │  (Google OAuth) │
│   (Port 3000)   │    │   (Expo)        │    │                 │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │              HTTP/HTTPS Requests            │
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   Django REST API       │
                    │   Backend Server        │
                    │   (Port 8000)           │
                    └─────────┬───────────────┘
                              │
                    ┌─────────▼───────────┐
                    │   PostgreSQL        │
                    │   Database          │
                    └─────────────────────┘
```

## Backend (Django REST API)

### Technology Stack
- **Framework**: Django 5.0.7
- **API**: Django REST Framework
- **Database**: PostgreSQL
- **Authentication**: Custom JWT implementation
- **OAuth**: Google OAuth 2.0
- **Email**: Django email system (configured for development)

### Project Structure
```
backend/
├── manage.py                 # Django management script
├── backend/                  # Main Django project
│   ├── settings.py           # Configuration settings
│   ├── urls.py              # Main URL routing
│   ├── wsgi.py              # WSGI application
│   └── asgi.py              # ASGI application
└── accaunts/                 # Authentication app
    ├── models.py            # User and token models
    ├── views.py             # API views
    ├── serializers.py       # DRF serializers
    ├── authentication.py    # JWT authentication logic
    ├── urls.py              # App URL routing
    └── migrations/          # Database migrations
```

### Core Models

#### User Model (`accaunts/models.py`)
```python
class User(AbstractUser):
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    email = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255)
    username = None  # Disabled username field
    
    USERNAME_FIELD = 'email'  # Use email for authentication
    REQUIRED_FIELDS = []
```

**Purpose**: Custom user model that uses email instead of username for authentication.

#### UserToken Model
```python
class UserToken(models.Model):
    user_id = models.IntegerField()
    token = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    expired_at = models.DateTimeField()
```

**Purpose**: Stores refresh tokens for JWT authentication with expiration tracking.

#### Reset Model
```python
class Reset(models.Model):
    email = models.CharField(max_length=255)
    token = models.CharField(max_length=255, unique=True)
```

**Purpose**: Manages password reset tokens for users.

### Authentication System (`accaunts/authentication.py`)

The JWT authentication system consists of:

1. **Access Tokens**: Short-lived (30 seconds) tokens for API requests
2. **Refresh Tokens**: Long-lived (7 days) tokens stored in HTTP-only cookies

```python
def create_access_token(id):
    return jwt.encode({
        'user_id': id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(seconds=30),
        'iat': datetime.datetime.utcnow()
    }, 'access_secret', algorithm='HS256')

def create_refresh_token(id):
    return jwt.encode({
        'user_id': id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7),
        'iat': datetime.datetime.utcnow()
    }, 'refresh_secret', algorithm='HS256')
```

### API Views (`accaunts/views.py`)

#### RegisterAPIView
- **Endpoint**: `POST /api/register`
- **Purpose**: Creates new user accounts
- **Validation**: Password confirmation matching

#### LoginAPIView  
- **Endpoint**: `POST /api/login`
- **Purpose**: Authenticates users and issues tokens
- **Returns**: Access token in response body, refresh token in HTTP-only cookie

#### UserAPIView
- **Endpoint**: `GET /api/user`
- **Purpose**: Returns authenticated user information
- **Authentication**: Requires valid access token

#### RefreshAPIView
- **Endpoint**: `POST /api/refresh`
- **Purpose**: Issues new access token using refresh token
- **Security**: Validates refresh token from HTTP-only cookie

#### LogoutAPIView
- **Endpoint**: `POST /api/logout`
- **Purpose**: Invalidates refresh token and clears cookies

#### ForgotAPIView
- **Endpoint**: `POST /api/forgot`
- **Purpose**: Initiates password reset process
- **Action**: Sends reset email with token

#### ResetAPIView
- **Endpoint**: `POST /api/reset`
- **Purpose**: Completes password reset with token

#### GoogleAuthAPIView
- **Endpoint**: `POST /api/google-auth`
- **Purpose**: Handles Google OAuth authentication
- **Process**: Verifies Google token and creates/authenticates user

## Frontend (React Web App)

### Technology Stack
- **Framework**: React 18.2.0 with TypeScript
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM 6.14.2
- **HTTP Client**: Axios
- **UI Framework**: Bootstrap (CSS classes)
- **OAuth**: @react-oauth/google

### Project Structure
```
frontend/src/
├── App.tsx                   # Main application component
├── components/               # React components
│   ├── Login.tsx            # Login form component
│   ├── Register.tsx         # Registration form
│   ├── Home.tsx             # Dashboard/home page
│   ├── Nav.tsx              # Navigation component
│   ├── Forgot.tsx           # Password reset request
│   └── Reset.tsx            # Password reset form
├── redux/                   # State management
│   ├── store.ts             # Redux store configuration
│   └── authSlice.ts         # Authentication state slice
├── interceptors/            # HTTP interceptors
│   └── axios.ts             # Axios configuration
└── index.tsx                # Application entry point
```

### Key Components

#### App Component (`App.tsx`)
```typescript
function App() {
  return <BrowserRouter>
    <Nav/>
    <Routes>
      <Route path='/login' element={<Login/>} />
      <Route path='/register' element={<Register/>} />
      <Route path='/forgot' element={<Forgot/>} />
      <Route path='/reset/:token' element={<Reset/>} />
      <Route path="/" element={<Home />} />
    </Routes>
  </BrowserRouter>
}
```

**Purpose**: Main application shell with routing configuration.

#### Login Component (`components/Login.tsx`)
Features:
- Email/password authentication
- Google OAuth integration
- Form validation
- Automatic redirect after successful login
- Token storage in Axios headers

```typescript
const submit = async (e: SyntheticEvent) => {
    e.preventDefault();
    const {data} = await axios.post<LoginResponse>('login', {
        email,
        password,
    }, {withCredentials: true});
    
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setRedirect(true);
}
```

#### Redux State Management (`redux/authSlice.ts`)
```typescript
const initialState = {
    value: false  // Authentication status
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuth: (state, action) => {
            state.value = action.payload;
        }
    }
});
```

**Purpose**: Manages global authentication state across the application.

#### Axios Configuration (`interceptors/axios.ts`)
- Sets base URL to Django backend
- Configures credentials for cross-origin requests
- Handles request/response interceptors

## Mobile App (React Native/Expo)

### Technology Stack
- **Framework**: React Native with Expo SDK ~53
- **Navigation**: Expo Router 5.1.4
- **Animations**: React Native Reanimated 3.17.4
- **Language**: TypeScript
- **UI**: Custom styled components

### Project Structure
```
MyLoginApp/
├── app/                      # Expo Router pages
│   ├── _layout.tsx          # Root layout component
│   ├── (tabs)/              # Tab navigation
│   └── +not-found.tsx       # 404 page
├── screens/                 # Screen components
│   ├── HomeScreen.tsx       # Main home screen
│   ├── BrowseScreen.tsx     # Browse restaurants
│   ├── ReservesScreen.tsx   # Reservations
│   ├── ItemDetail.tsx       # Item details
│   └── TransitionScreen.tsx # Transition animations
├── components/              # Reusable components
│   ├── CardList.tsx         # Restaurant card list
│   └── [other components]
├── assets/                  # Images and fonts
│   ├── images/              # Restaurant/food images
│   └── fonts/               # Custom fonts
└── constants/               # App constants
```

### Key Features

#### HomeScreen (`screens/HomeScreen.tsx`)
```typescript
export default function HomeScreen({ skipAnimation }: Props) {
  const translateX = useSharedValue(0);
  const { fromNav } = useLocalSearchParams();

  useEffect(() => {
    if (skipAnimation) return;
    if (fromNav === "true") {
      runOnUI(() => {
        translateX.value = -screenWidth;
        translateX.value = withTiming(0, { duration: 250 });
      })();
    }
  }, []);
  
  // Restaurant listing with deals and hot takes sections
  const deals = [
    {
      title: "Brecka Bakery",
      address: "1335 Sumas Way, Surrey, BC", 
      time: "Today 8:00 - 23.59",
      image: require("../assets/images/pexels-athena-2180877.jpg"),
    },
    // ... more restaurants
  ];
}
```

**Features**:
- Animated screen transitions
- Restaurant listings with images
- Scroll-based UI
- Location and time information

#### Root Layout (`app/_layout.tsx`)
```typescript
export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Preload images and fonts
        const images = [/* restaurant images */].map(img => Asset.loadAsync(img));
        const fonts = Font.loadAsync({
          SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
        });
        await Promise.all([...images, fonts]);
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
        SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);
}
```

**Purpose**: 
- Asset preloading for performance
- Splash screen management
- App initialization

## Authentication Flow

### Registration Flow
```
1. User fills registration form (React)
2. POST /api/register with user data
3. Django validates data and creates User
4. Returns user data (without tokens)
5. User redirected to login page
```

### Login Flow
```
1. User submits email/password (React)
2. POST /api/login with credentials
3. Django validates credentials
4. Creates access token (30s) and refresh token (7d)
5. Stores refresh token in UserToken model
6. Returns access token in response
7. Sets refresh token in HTTP-only cookie
8. React stores access token in Axios headers
9. User redirected to dashboard
```

### Google OAuth Flow
```
1. User clicks Google login button
2. Google OAuth popup/redirect
3. Google returns credential token
4. POST /api/google-auth with Google token
5. Django verifies token with Google
6. Creates or finds existing user
7. Issues JWT tokens (same as regular login)
8. User logged in and redirected
```

### Token Refresh Flow
```
1. Access token expires (30 seconds)
2. React makes API request with expired token
3. Django returns 401 Unauthorized
4. React automatically calls POST /api/refresh
5. Django validates refresh token from cookie
6. Issues new access token
7. React retries original request with new token
```

### Logout Flow
```
1. User clicks logout
2. POST /api/logout request
3. Django deletes refresh token from UserToken model
4. Clears refresh token cookie
5. React clears access token from headers
6. User redirected to login page
```

## API Documentation

### Base URL
- Development: `http://localhost:8000/api/`
- Production: Configure in Django settings

### Authentication
Most endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### Endpoints

#### POST /api/register
**Purpose**: Register new user account

**Request Body**:
```json
{
  "first_name": "John",
  "last_name": "Doe", 
  "email": "john@example.com",
  "password": "securepassword",
  "password_confirm": "securepassword"
}
```

**Response** (201 Created):
```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com"
}
```

**Errors**:
- 400: Password mismatch or validation errors

#### POST /api/login
**Purpose**: Authenticate user and issue tokens

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Sets Cookie**: `refresh_token` (HTTP-only, 7 days)

**Errors**:
- 401: Invalid credentials

#### GET /api/user
**Purpose**: Get authenticated user information

**Headers**: `Authorization: Bearer <access_token>`

**Response** (200 OK):
```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com"
}
```

**Errors**:
- 401: Invalid or expired token

#### POST /api/refresh
**Purpose**: Get new access token using refresh token

**Requires**: `refresh_token` cookie

**Response** (200 OK):
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Errors**:
- 401: Invalid or expired refresh token

#### POST /api/logout
**Purpose**: Logout user and invalidate tokens

**Requires**: `refresh_token` cookie

**Response** (200 OK):
```json
{
  "message": "success"
}
```

**Action**: Clears `refresh_token` cookie

#### POST /api/forgot
**Purpose**: Request password reset

**Request Body**:
```json
{
  "email": "john@example.com"
}
```

**Response** (200 OK):
```json
{
  "message": "success"
}
```

**Action**: Sends reset email with token

#### POST /api/reset
**Purpose**: Reset password with token

**Request Body**:
```json
{
  "token": "reset_token_here",
  "password": "newpassword",
  "password_confirm": "newpassword"
}
```

**Response** (200 OK):
```json
{
  "message": "success"
}
```

**Errors**:
- 400: Password mismatch, invalid token, or user not found

#### POST /api/google-auth
**Purpose**: Authenticate with Google OAuth

**Request Body**:
```json
{
  "token": "google_credential_token"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

**Sets Cookie**: `refresh_token` (HTTP-only, 7 days)

**Errors**:
- 401: Invalid Google token

## Database Schema

### Users Table (auth_user)
```sql
CREATE TABLE accaunts_user (
    id SERIAL PRIMARY KEY,
    password VARCHAR(128) NOT NULL,
    last_login TIMESTAMP,
    is_superuser BOOLEAN NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    is_staff BOOLEAN NOT NULL,
    is_active BOOLEAN NOT NULL,
    date_joined TIMESTAMP NOT NULL
);
```

### UserToken Table
```sql
CREATE TABLE accaunts_usertoken (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    expired_at TIMESTAMP NOT NULL
);
```

### Reset Table
```sql
CREATE TABLE accaunts_reset (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL
);
```

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Git

### Backend Setup

1. **Clone Repository**
```bash
git clone <repository-url>
cd app/backend
```

2. **Create Virtual Environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install Dependencies**
```bash
pip install django djangorestframework django-cors-headers psycopg2-binary PyJWT python-decouple google-auth
```

4. **Environment Configuration**
Create `.env` file in backend directory:
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
```

5. **Database Setup**
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

6. **Run Development Server**
```bash
python manage.py runserver
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to Frontend**
```bash
cd ../frontend
```

2. **Install Dependencies**
```bash
npm install
```

3. **Configure Environment**
Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

4. **Run Development Server**
```bash
npm start
```

Frontend will be available at `http://localhost:3000`

### Mobile App Setup

1. **Navigate to Mobile App**
```bash
cd ../MyLoginApp
```

2. **Install Dependencies**
```bash
npm install
```

3. **Install Expo CLI**
```bash
npm install -g @expo/cli
```

4. **Run Development Server**
```bash
npx expo start
```

5. **Run on Device/Emulator**
- Install Expo Go app on your phone
- Scan QR code from terminal
- Or use Android/iOS simulator

## Security Considerations

### JWT Implementation
- **Short-lived access tokens** (30 seconds) minimize exposure risk
- **Long-lived refresh tokens** (7 days) stored in HTTP-only cookies
- **Token rotation** on refresh for additional security

### Password Security
- Django's built-in password hashing (PBKDF2)
- Password validation rules enforced
- Secure password reset flow with tokens

### CORS Configuration
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
CORS_ALLOW_CREDENTIALS = True
```

### Cookie Security
- HTTP-only cookies prevent XSS attacks
- Secure flag should be enabled in production
- SameSite attribute configured for CSRF protection

### Google OAuth
- Server-side token verification
- Secure client ID configuration
- User data validation

### Environment Variables
- Sensitive data stored in environment variables
- Secret keys never committed to version control
- Database credentials secured

## Deployment

### Backend Deployment (Production)

1. **Environment Setup**
```env
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
SECRET_KEY=production-secret-key
# Production database credentials
```

2. **Security Enhancements**
```python
# settings.py
SECURE_SSL_REDIRECT = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Cookie security
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
```

3. **Static Files**
```bash
python manage.py collectstatic
```

4. **Database Migration**
```bash
python manage.py migrate --run-syncdb
```

### Frontend Deployment

1. **Build Production**
```bash
npm run build
```

2. **Configure Environment**
```env
REACT_APP_API_URL=https://your-api-domain.com/api
```

3. **Deploy to CDN/Static Hosting**
- Vercel, Netlify, or AWS S3 + CloudFront
- Configure build command: `npm run build`
- Set publish directory: `build`

### Mobile App Deployment

1. **Build for Production**
```bash
expo build:android
expo build:ios
```

2. **App Store Deployment**
```bash
expo submit:android
expo submit:ios
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Verify CORS_ALLOWED_ORIGINS in Django settings
   - Check frontend API URL configuration

2. **Token Expiration**
   - Access tokens expire in 30 seconds by design
   - Implement automatic refresh in frontend

3. **Database Connection**
   - Verify PostgreSQL is running
   - Check database credentials in .env

4. **Google OAuth Issues**
   - Verify client ID configuration
   - Check OAuth consent screen setup

### Debug Commands

```bash
# Backend logs
python manage.py runserver --verbosity=2

# Frontend network debugging
# Open browser developer tools > Network tab

# Mobile app debugging
expo start --clear
```

This documentation provides a comprehensive overview of the JWT authentication system, covering all aspects from architecture to deployment. The system demonstrates modern full-stack development practices with security-first implementation.