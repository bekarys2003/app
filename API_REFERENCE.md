# API Reference - JWT Authentication System

## Overview
This document provides detailed API reference for the Django REST API backend.

## Base Configuration
- **Base URL**: `http://localhost:8000/api/` (Development)
- **Content-Type**: `application/json`
- **Authentication**: Bearer Token in Authorization header

## Authentication Flow

### Token Types
- **Access Token**: Short-lived (30 seconds), used for API requests
- **Refresh Token**: Long-lived (7 days), stored in HTTP-only cookie

### Token Format
```
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

## Endpoints

### 1. User Registration

**Endpoint**: `POST /api/register`

**Description**: Creates a new user account

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "first_name": "string (required, max 255 chars)",
  "last_name": "string (required, max 255 chars)", 
  "email": "string (required, unique, valid email format)",
  "password": "string (required, min 8 chars)",
  "password_confirm": "string (required, must match password)"
}
```

**Success Response** (201 Created):
```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com"
}
```

**Error Responses**:

400 Bad Request - Password Mismatch:
```json
{
  "detail": "Password do not match!"
}
```

400 Bad Request - Validation Error:
```json
{
  "email": ["Enter a valid email address."],
  "password": ["This field is required."]
}
```

400 Bad Request - Email Already Exists:
```json
{
  "email": ["user with this email already exists."]
}
```

---

### 2. User Login

**Endpoint**: `POST /api/login`

**Description**: Authenticates user credentials and issues JWT tokens

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "string (required, valid email)",
  "password": "string (required)"
}
```

**Success Response** (200 OK):
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE2OTQ1MjA5NjAsImlhdCI6MTY5NDUyMDkzMH0.xyz"
}
```

**Response Cookies**:
```
Set-Cookie: refresh_token=<refresh_jwt>; HttpOnly; Max-Age=604800; Path=/
```

**Error Responses**:

401 Unauthorized - Invalid Credentials:
```json
{
  "detail": "invalid creditentials"
}
```

400 Bad Request - Missing Fields:
```json
{
  "email": ["This field is required."],
  "password": ["This field is required."]
}
```

---

### 3. Get User Profile

**Endpoint**: `GET /api/user`

**Description**: Returns authenticated user's profile information

**Request Headers**:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Success Response** (200 OK):
```json
{
  "id": 1,
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com"
}
```

**Error Responses**:

401 Unauthorized - Missing Token:
```json
{
  "detail": "unauthenticated"
}
```

401 Unauthorized - Invalid/Expired Token:
```json
{
  "detail": "unauthenticated"
}
```

---

### 4. Refresh Access Token

**Endpoint**: `POST /api/refresh`

**Description**: Issues a new access token using the refresh token

**Request Headers**:
```
Content-Type: application/json
Cookie: refresh_token=<refresh_jwt>
```

**Request Body**: None (uses cookie)

**Success Response** (200 OK):
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE2OTQ1MjA5NjAsImlhdCI6MTY5NDUyMDkzMH0.xyz"
}
```

**Error Responses**:

401 Unauthorized - Invalid/Missing Refresh Token:
```json
{
  "detail": "unauthenticated"
}
```

401 Unauthorized - Expired Refresh Token:
```json
{
  "detail": "unauthenticated"  
}
```

---

### 5. User Logout

**Endpoint**: `POST /api/logout`

**Description**: Invalidates refresh token and logs out user

**Request Headers**:
```
Content-Type: application/json
Cookie: refresh_token=<refresh_jwt>
```

**Request Body**: None

**Success Response** (200 OK):
```json
{
  "message": "success"
}
```

**Response Actions**:
- Deletes refresh token from database
- Clears refresh_token cookie

**Error Responses**:

200 OK - Even if no token provided:
```json
{
  "message": "success"
}
```

---

### 6. Forgot Password

**Endpoint**: `POST /api/forgot`

**Description**: Initiates password reset process by sending reset email

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "string (required, valid email)"
}
```

**Success Response** (200 OK):
```json
{
  "message": "success"
}
```

**Process**:
1. Generates random 10-character token
2. Stores token with email in Reset model
3. Sends email with reset link to `http://localhost:3000/reset/{token}`

**Error Responses**:

400 Bad Request - Invalid Email:
```json
{
  "email": ["Enter a valid email address."]
}
```

**Note**: Always returns success even if email doesn't exist (security best practice)

---

### 7. Reset Password

**Endpoint**: `POST /api/reset`

**Description**: Completes password reset using token from email

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "token": "string (required, reset token from email)",
  "password": "string (required, new password)",
  "password_confirm": "string (required, must match password)"
}
```

**Success Response** (200 OK):
```json
{
  "message": "success"
}
```

**Error Responses**:

400 Bad Request - Password Mismatch:
```json
{
  "detail": "Password do not match!"
}
```

400 Bad Request - Invalid Token:
```json
{
  "detail": "Invalid link!"
}
```

400 Bad Request - User Not Found:
```json
{
  "detail": "User not found!"
}
```

---

### 8. Google OAuth Authentication

**Endpoint**: `POST /api/google-auth`

**Description**: Authenticates user using Google OAuth token

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "token": "string (required, Google credential token)"
}
```

**Success Response** (200 OK):
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjE2OTQ1MjA5NjAsImlhdCI6MTY5NDUyMDkzMH0.xyz"
}
```

**Response Cookies**:
```
Set-Cookie: refresh_token=<refresh_jwt>; HttpOnly; Max-Age=604800; Path=/
```

**Process**:
1. Verifies Google token with Google's servers
2. Extracts user information (email, first_name, last_name)
3. Creates new user if doesn't exist, or finds existing user
4. Issues JWT tokens same as regular login

**Error Responses**:

401 Unauthorized - Missing Token:
```json
{
  "detail": "Token not provided"
}
```

401 Unauthorized - Invalid Google Token:
```json
{
  "detail": "Invalid Google token"
}
```

401 Unauthorized - Failed to Get User Info:
```json
{
  "detail": "Failed to retrieve user info from Google"
}
```

## Status Codes Summary

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful requests |
| 201 | Created | Successful user registration |
| 400 | Bad Request | Validation errors, missing fields |
| 401 | Unauthorized | Authentication failures |
| 500 | Internal Server Error | Server errors |

## Rate Limiting

Currently no rate limiting is implemented. In production, consider implementing:
- Registration: 5 requests per hour per IP
- Login: 10 requests per 15 minutes per IP
- Password reset: 3 requests per hour per email

## Security Headers

The API returns standard security headers:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
```

## CORS Policy

Allowed origins for development:
- `http://localhost:3000`
- `http://127.0.0.1:3000`

Credentials are allowed for cookie-based refresh tokens.

## Error Handling

All errors follow this format:
```json
{
  "detail": "Error message description"
}
```

Or for field validation errors:
```json
{
  "field_name": ["Error message for this field"],
  "another_field": ["Another error message"]
}
```

## Token Payload Structure

### Access Token Payload
```json
{
  "user_id": 1,
  "exp": 1694520960,  // Expiration timestamp
  "iat": 1694520930   // Issued at timestamp
}
```

### Refresh Token Payload
```json
{
  "user_id": 1,
  "exp": 1695125760,  // Expiration timestamp (7 days)
  "iat": 1694520960   // Issued at timestamp
}
```

## Database Models Reference

### User Model Fields
- `id`: Integer (Primary Key)
- `first_name`: CharField(max_length=255)
- `last_name`: CharField(max_length=255)  
- `email`: CharField(max_length=255, unique=True)
- `password`: CharField(max_length=255) - Hashed
- `is_staff`: Boolean
- `is_active`: Boolean
- `date_joined`: DateTime

### UserToken Model Fields  
- `id`: Integer (Primary Key)
- `user_id`: Integer (Foreign Key to User)
- `token`: CharField(max_length=255) - Refresh token
- `password`: CharField(max_length=255) - Unused field
- `created_at`: DateTime
- `expired_at`: DateTime

### Reset Model Fields
- `id`: Integer (Primary Key)
- `email`: CharField(max_length=255)
- `token`: CharField(max_length=255, unique=True)

## SDK/Client Examples

### JavaScript/Axios
```javascript
// Configure base URL and credentials
axios.defaults.baseURL = 'http://localhost:8000/api/';
axios.defaults.withCredentials = true;

// Login
const response = await axios.post('login', {
  email: 'user@example.com',
  password: 'password123'
});

// Set token for subsequent requests
axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;

// Get user profile
const userResponse = await axios.get('user');
```

### Python/Requests
```python
import requests

# Login
response = requests.post('http://localhost:8000/api/login', json={
    'email': 'user@example.com',
    'password': 'password123'
})

token = response.json()['token']

# Get user profile
headers = {'Authorization': f'Bearer {token}'}
user_response = requests.get('http://localhost:8000/api/user', headers=headers)
```

### cURL Examples

**Login**:
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}' \
  -c cookies.txt
```

**Get User Profile**:
```bash
curl -X GET http://localhost:8000/api/user \
  -H "Authorization: Bearer <access_token>" \
  -b cookies.txt
```

**Refresh Token**:
```bash
curl -X POST http://localhost:8000/api/refresh \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

This API reference provides comprehensive information for integrating with the JWT authentication system.