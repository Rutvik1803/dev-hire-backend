# DevHire Backend - Authentication API Documentation

## Overview
This document provides complete documentation for the authentication API endpoints.

## Base URL
```
http://localhost:4000/api/auth
```

---

## Endpoints

### 1. Sign Up (User Registration)

**Endpoint:** `POST /api/auth/signup`

**Description:** Register a new user account with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securePassword123"
}
```

**Validation Rules:**
- `email`: Required, must be valid email format
- `name`: Required
- `password`: Required, minimum 6 characters

**Success Response (201 Created):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "createdAt": "2025-10-06T10:00:00.000Z",
      "updatedAt": "2025-10-06T10:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Cookies Set:**
- `refreshToken`: HTTP-only cookie, expires in 7 days

**Error Responses:**

*400 Bad Request - Missing Fields:*
```json
{
  "status": "error",
  "message": "Email, name, and password are required"
}
```

*400 Bad Request - Invalid Email:*
```json
{
  "status": "error",
  "message": "Invalid email format"
}
```

*400 Bad Request - Weak Password:*
```json
{
  "status": "error",
  "message": "Password must be at least 6 characters long"
}
```

*409 Conflict - User Exists:*
```json
{
  "status": "error",
  "message": "User already exists"
}
```

---

### 2. Login

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate user and generate access & refresh tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Validation Rules:**
- `email`: Required
- `password`: Required

**Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "createdAt": "2025-10-06T10:00:00.000Z",
      "updatedAt": "2025-10-06T10:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Cookies Set:**
- `refreshToken`: HTTP-only cookie, expires in 7 days

**Error Responses:**

*400 Bad Request - Missing Fields:*
```json
{
  "status": "error",
  "message": "Email and password are required"
}
```

*401 Unauthorized - Invalid Credentials:*
```json
{
  "status": "error",
  "message": "Invalid email or password"
}
```

---

## Token Management

### Access Token
- **Type:** JWT (JSON Web Token)
- **Expires:** 15 minutes
- **Delivery:** Sent in JSON response body
- **Usage:** Include in `Authorization` header for protected routes
  ```
  Authorization: Bearer <accessToken>
  ```
- **Payload:**
  ```json
  {
    "userId": 1,
    "role": "USER",
    "iat": 1696593600,
    "exp": 1696594500
  }
  ```

### Refresh Token
- **Type:** JWT (JSON Web Token)
- **Expires:** 7 days
- **Delivery:** Set as HTTP-only cookie
- **Storage:** Stored in database `RefreshToken` table
- **Security Features:**
  - HTTP-only: Prevents JavaScript access
  - Secure: Only sent over HTTPS (in production)
  - SameSite: 'strict' - Prevents CSRF attacks
- **Payload:**
  ```json
  {
    "userId": 1,
    "role": "USER",
    "iat": 1696593600,
    "exp": 1697198400
  }
  ```

---

## Security Features

### Password Security
- Passwords are hashed using **bcrypt** with 10 salt rounds
- Original passwords are never stored in the database
- Password comparison is done securely using bcrypt's compare function

### Token Security
- Separate secrets for access and refresh tokens
- Short-lived access tokens (15 minutes) minimize exposure
- Refresh tokens are stored in database for validation and revocation
- HTTP-only cookies prevent XSS attacks
- Secure cookies in production (HTTPS only)
- SameSite strict policy prevents CSRF attacks

### Error Handling
- Generic error messages for authentication failures (doesn't reveal if email exists)
- All errors are properly typed with appropriate HTTP status codes
- Consistent error response format across all endpoints

---

## Error Codes Reference

| Status Code | Error Type | Description |
|------------|------------|-------------|
| 400 | Bad Request | Invalid input data or validation failure |
| 401 | Unauthorized | Invalid credentials or authentication failure |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists (e.g., duplicate email) |
| 500 | Internal Server Error | Unexpected server error |

---

## Database Schema

### User Table
```prisma
model User {
  id        Int           @id @default(autoincrement())
  email     String        @unique
  password  String
  name      String
  role      Role          @default(USER)
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
  tokens    RefreshToken[]
}
```

### RefreshToken Table
```prisma
model RefreshToken {
  id        Int      @id @default(autoincrement())
  token     String
  user      User     @relation(fields: [userId], references: [id])
  userId    Int
  createdAt DateTime @default(now())
  expiresAt DateTime
}
```

### Role Enum
```prisma
enum Role {
  USER
  ADMIN
}
```

---

## Testing Examples

### cURL Examples

**Sign Up:**
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Postman/Thunder Client

1. Create a new request
2. Set method to `POST`
3. Set URL to `http://localhost:4000/api/auth/signup` or `/login`
4. Set Headers: `Content-Type: application/json`
5. Set Body (raw JSON):
   ```json
   {
     "email": "test@example.com",
     "name": "Test User",
     "password": "password123"
   }
   ```
6. Send request
7. Check cookies in response (refreshToken should be set)

---

## Environment Variables

Required environment variables (see `.env.example`):

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/devhire?schema=public"

# JWT Secrets (Generate secure random strings for production)
ACCESS_TOKEN_SECRET=your-access-token-secret-here
REFRESH_TOKEN_SECRET=your-refresh-token-secret-here
```

**Important:** Generate strong random strings for JWT secrets in production:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Future Enhancements

Potential features to implement:

1. **Refresh Token Endpoint** - `/api/auth/refresh` to get new access token
2. **Logout Endpoint** - `/api/auth/logout` to invalidate refresh token
3. **Password Reset** - Email-based password reset flow
4. **Email Verification** - Verify email addresses before account activation
5. **Account Lockout** - Lock accounts after multiple failed login attempts
6. **Two-Factor Authentication** - Add 2FA support
7. **Session Management** - View and revoke active sessions
8. **OAuth Integration** - Google, GitHub, etc.

---

## Support

For issues or questions, please contact the development team.
