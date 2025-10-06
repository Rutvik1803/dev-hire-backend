# Quick Testing Guide

## Prerequisites
1. Ensure PostgreSQL is running
2. Configure `.env` file with proper `DATABASE_URL` and JWT secrets
3. Run `npx prisma migrate dev` to set up database
4. Run `npm run dev` to start the server

## Test Scenarios

### 1. Test Sign Up - Success ✅

**Request:**
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -v \
  -d '{
    "email": "test1@example.com",
    "name": "Test User One",
    "password": "password123"
  }'
```

**Expected Response (201):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "test1@example.com",
      "name": "Test User One",
      "role": "USER",
      "createdAt": "...",
      "updatedAt": "..."
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Check:**
- ✅ Status code: 201
- ✅ Response contains user data (no password)
- ✅ Response contains accessToken
- ✅ Cookie `refreshToken` is set (check with `-v` flag)

---

### 2. Test Sign Up - Duplicate Email ❌

**Request:**
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test1@example.com",
    "name": "Test User Two",
    "password": "password456"
  }'
```

**Expected Response (409):**
```json
{
  "status": "error",
  "message": "User already exists"
}
```

**Check:**
- ✅ Status code: 409 (Conflict)

---

### 3. Test Sign Up - Invalid Email ❌

**Request:**
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "name": "Test User",
    "password": "password123"
  }'
```

**Expected Response (400):**
```json
{
  "status": "error",
  "message": "Invalid email format"
}
```

**Check:**
- ✅ Status code: 400 (Bad Request)

---

### 4. Test Sign Up - Short Password ❌

**Request:**
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test2@example.com",
    "name": "Test User",
    "password": "123"
  }'
```

**Expected Response (400):**
```json
{
  "status": "error",
  "message": "Password must be at least 6 characters long"
}
```

**Check:**
- ✅ Status code: 400 (Bad Request)

---

### 5. Test Sign Up - Missing Fields ❌

**Request:**
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test3@example.com"
  }'
```

**Expected Response (400):**
```json
{
  "status": "error",
  "message": "Email, name, and password are required"
}
```

**Check:**
- ✅ Status code: 400 (Bad Request)

---

### 6. Test Login - Success ✅

**Request:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -v \
  -d '{
    "email": "test1@example.com",
    "password": "password123"
  }'
```

**Expected Response (200):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "test1@example.com",
      "name": "Test User One",
      "role": "USER",
      "createdAt": "...",
      "updatedAt": "..."
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Check:**
- ✅ Status code: 200
- ✅ Response contains user data (no password)
- ✅ Response contains accessToken (different from signup token)
- ✅ Cookie `refreshToken` is set (check with `-v` flag)
- ✅ Cookie is saved in `cookies.txt`

---

### 7. Test Login - Wrong Password ❌

**Request:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test1@example.com",
    "password": "wrongpassword"
  }'
```

**Expected Response (401):**
```json
{
  "status": "error",
  "message": "Invalid email or password"
}
```

**Check:**
- ✅ Status code: 401 (Unauthorized)

---

### 8. Test Login - Non-existent User ❌

**Request:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@example.com",
    "password": "password123"
  }'
```

**Expected Response (401):**
```json
{
  "status": "error",
  "message": "Invalid email or password"
}
```

**Check:**
- ✅ Status code: 401 (Unauthorized)
- ✅ Generic error message (security best practice)

---

### 9. Test Login - Missing Fields ❌

**Request:**
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test1@example.com"
  }'
```

**Expected Response (400):**
```json
{
  "status": "error",
  "message": "Email and password are required"
}
```

**Check:**
- ✅ Status code: 400 (Bad Request)

---

## Verify Database

### Check User Creation
```bash
npx prisma studio
```

Then navigate to the `User` table and verify:
- ✅ User exists with correct email and name
- ✅ Password is hashed (not plain text)
- ✅ Role is set to "USER"

### Check Refresh Tokens
Navigate to the `RefreshToken` table and verify:
- ✅ Tokens are created for each signup/login
- ✅ Each token has a `userId` reference
- ✅ `expiresAt` is 7 days from creation
- ✅ Multiple tokens per user (if logged in multiple times)

---

## Test with Postman/Thunder Client

### Setup
1. Create a new request
2. Set method to `POST`
3. Set URL
4. Add header: `Content-Type: application/json`
5. Set body to raw JSON
6. Send request

### Sign Up
- URL: `http://localhost:4000/api/auth/signup`
- Body:
  ```json
  {
    "email": "postman@example.com",
    "name": "Postman User",
    "password": "password123"
  }
  ```
- Check Cookies tab for `refreshToken`
- Save `accessToken` from response

### Login
- URL: `http://localhost:4000/api/auth/login`
- Body:
  ```json
  {
    "email": "postman@example.com",
    "password": "password123"
  }
  ```
- Check Cookies tab for `refreshToken`
- Compare `accessToken` with previous one (should be different)

---

## Token Verification

### Decode Access Token
Go to [jwt.io](https://jwt.io) and paste your access token.

**Expected Payload:**
```json
{
  "userId": 1,
  "role": "USER",
  "iat": 1696593600,
  "exp": 1696594500
}
```

**Verify:**
- ✅ `userId` matches user ID
- ✅ `role` is correct
- ✅ `exp` is 15 minutes from `iat`

### Decode Refresh Token
Decode the refresh token cookie value at [jwt.io](https://jwt.io).

**Expected Payload:**
```json
{
  "userId": 1,
  "role": "USER",
  "iat": 1696593600,
  "exp": 1697198400
}
```

**Verify:**
- ✅ `userId` matches user ID
- ✅ `role` is correct
- ✅ `exp` is 7 days from `iat`

---

## Security Checks

### HTTP-only Cookie
- ✅ Cookie cannot be accessed via `document.cookie` in browser
- ✅ Cookie is automatically sent with requests to same domain

### Password Hashing
- ✅ Check database - password should be a bcrypt hash
- ✅ Format: `$2b$10$...` (60 characters)

### Token Secrets
- ✅ Ensure `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` are set in `.env`
- ✅ Secrets should be different
- ✅ Use strong random strings (64+ characters)

---

## Clean Up Test Data

### Delete Test Users
```sql
-- In Prisma Studio or psql
DELETE FROM "RefreshToken" WHERE "userId" IN (SELECT id FROM "User" WHERE email LIKE '%test%');
DELETE FROM "User" WHERE email LIKE '%test%';
```

Or use Prisma:
```bash
npx prisma studio
```
Then manually delete from the UI.

---

## Troubleshooting

### Server Won't Start
- ✅ Check if `.env` file exists
- ✅ Verify `DATABASE_URL` is correct
- ✅ Ensure PostgreSQL is running
- ✅ Run `npm install` to ensure all dependencies are installed

### Database Connection Error
- ✅ Verify PostgreSQL is running: `pg_isready`
- ✅ Check database credentials in `.env`
- ✅ Run `npx prisma migrate dev` to create database

### Token Not Set in Cookie
- ✅ Check if `cookie-parser` middleware is registered in `src/index.ts`
- ✅ Use `-v` flag with curl to see response headers
- ✅ Check `Set-Cookie` header in response

### Invalid Token Errors
- ✅ Verify `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` in `.env`
- ✅ Ensure secrets are strings, not undefined
- ✅ Check token expiration hasn't passed

---

## Success Checklist

- [ ] Server starts without errors
- [ ] Can register new user
- [ ] Password is hashed in database
- [ ] Access token is returned in response
- [ ] Refresh token is set as HTTP-only cookie
- [ ] Cannot register duplicate email
- [ ] Can login with correct credentials
- [ ] Cannot login with wrong password
- [ ] Error messages are appropriate
- [ ] HTTP status codes are correct
- [ ] Tokens have correct expiration
- [ ] Database stores refresh tokens

---

**All tests passing? Great! Your authentication system is working perfectly! 🎉**
