# Postman Quick Start - DevHire API

## 🚀 5-Minute Setup

### Step 1: Make Sure Server is Running ✅

```bash
npm run dev
```

Expected output: `Server started on port 4000`

---

### Step 2: Open Postman

Download from: https://www.postman.com/downloads/

---

### Step 3: Test Sign Up (First Request)

1. **Click "New" → "HTTP Request"**

2. **Set these values:**
   - Method: `POST`
   - URL: `http://localhost:4000/api/auth/signup`

3. **Add Header:**
   - Go to "Headers" tab
   - Add: `Content-Type` = `application/json`

4. **Add Body:**
   - Go to "Body" tab
   - Select "raw"
   - Select "JSON" from dropdown
   - Paste:
   ```json
   {
     "email": "test@example.com",
     "name": "Test User",
     "password": "password123"
   }
   ```

5. **Click "Send"** 🚀

**Expected Result:**
- Status: `201 Created` ✅
- Response body with user data and accessToken
- Cookie `refreshToken` set (check "Cookies" below Send button)

---

### Step 4: Test Login

1. **Create another request:**
   - Method: `POST`
   - URL: `http://localhost:4000/api/auth/login`
   - Header: `Content-Type: application/json`

2. **Body:**
   ```json
   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```

3. **Click "Send"** 🚀

**Expected Result:**
- Status: `200 OK` ✅
- Response with user data and new accessToken

---

### Step 5: Test Error (Wrong Password)

1. **Same login request but change password:**
   ```json
   {
     "email": "test@example.com",
     "password": "wrongpassword"
   }
   ```

2. **Click "Send"** 🚀

**Expected Result:**
- Status: `401 Unauthorized` ✅
- Error message: "Invalid email or password"

---

## 🎯 That's It!

You've successfully tested all core functionality!

### What You Just Tested:
✅ User registration  
✅ User login  
✅ Error handling  
✅ Token generation  
✅ Cookie management  

### Next Steps:
- See [POSTMAN_GUIDE.md](./POSTMAN_GUIDE.md) for complete testing scenarios
- See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for full API reference

---

## 📋 Quick Copy-Paste Requests

### Sign Up
```
POST http://localhost:4000/api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123"
}
```

### Login
```
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

---

## 🔍 What to Check

After each request:

1. **Status Code** (bottom right)
   - 200/201 = Success ✅
   - 400 = Validation error ⚠️
   - 401 = Auth error 🔒
   - 409 = Duplicate 🚫

2. **Response Body** (below)
   - Should see JSON with status, message, data

3. **Cookies** (click link below Send)
   - Should see `refreshToken` cookie

---

**Need detailed testing?** → [POSTMAN_GUIDE.md](./POSTMAN_GUIDE.md)
