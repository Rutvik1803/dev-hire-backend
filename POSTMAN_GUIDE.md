# Postman Testing Guide - DevHire Backend

Complete step-by-step guide to test your authentication API in Postman.

---

## 📋 Prerequisites

1. **Postman Installed** - Download from [postman.com](https://www.postman.com/downloads/)
2. **Server Running** - Make sure your backend is running:
   ```bash
   npm run dev
   ```
   You should see: `Server started on port 4000`

---

## 🚀 Quick Setup

### Step 1: Create a New Collection

1. Open Postman
2. Click **"New"** button → Select **"Collection"**
3. Name it: `DevHire Auth API`
4. Click **"Create"**

### Step 2: Set Collection Variables (Optional but Recommended)

This makes it easy to change the base URL later.

1. Click on your collection **"DevHire Auth API"**
2. Go to **"Variables"** tab
3. Add these variables:

| Variable Name | Initial Value | Current Value |
|---------------|---------------|---------------|
| `baseUrl` | `http://localhost:4000` | `http://localhost:4000` |
| `apiPath` | `/api/auth` | `/api/auth` |

4. Click **"Save"**

Now you can use `{{baseUrl}}{{apiPath}}/signup` in your requests!

---

## 📝 Test Case 1: User Sign Up (Success)

### Create the Request

1. Click **"Add request"** in your collection
2. Name it: `Sign Up - Success`
3. Set method to: **POST**
4. URL: `http://localhost:4000/api/auth/signup`
   - Or with variables: `{{baseUrl}}{{apiPath}}/signup`

### Set Headers

Click on **"Headers"** tab and add:

| Key | Value |
|-----|-------|
| `Content-Type` | `application/json` |

### Set Body

1. Click on **"Body"** tab
2. Select **"raw"**
3. Select **"JSON"** from the dropdown (right side)
4. Paste this:

```json
{
  "email": "john.doe@example.com",
  "name": "John Doe",
  "password": "password123"
}
```

### Send Request

Click **"Send"** button

### Expected Response (201 Created)

```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "john.doe@example.com",
      "name": "John Doe",
      "role": "USER",
      "createdAt": "2025-10-06T07:00:00.000Z",
      "updatedAt": "2025-10-06T07:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Check Response

1. **Status Code:** Should be `201 Created` (bottom right)
2. **Body:** Should contain user data and accessToken
3. **Cookies:** Click on **"Cookies"** (below Send button)
   - You should see `refreshToken` cookie
   - It should be `HttpOnly`

### Save Variables (Optional)

To use the accessToken in future requests:

1. Go to **"Tests"** tab
2. Add this script:

```javascript
// Save access token to collection variable
if (pm.response.code === 201) {
    const responseData = pm.response.json();
    pm.collectionVariables.set("accessToken", responseData.data.accessToken);
    pm.collectionVariables.set("userId", responseData.data.user.id);
}
```

3. Click **"Send"** again to save the token

---

## 🔑 Test Case 2: User Login (Success)

### Create the Request

1. Add new request: `Login - Success`
2. Method: **POST**
3. URL: `http://localhost:4000/api/auth/login`

### Headers

| Key | Value |
|-----|-------|
| `Content-Type` | `application/json` |

### Body (JSON)

```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

### Send Request

Click **"Send"**

### Expected Response (200 OK)

```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "john.doe@example.com",
      "name": "John Doe",
      "role": "USER",
      "createdAt": "2025-10-06T07:00:00.000Z",
      "updatedAt": "2025-10-06T07:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Verify

- ✅ Status code: `200 OK`
- ✅ Contains user data (no password)
- ✅ Contains new accessToken (different from signup)
- ✅ Cookie updated with new refreshToken

---

## ❌ Test Case 3: Sign Up - Duplicate Email (Error)

### Create the Request

1. Add new request: `Sign Up - Duplicate Email`
2. Method: **POST**
3. URL: `http://localhost:4000/api/auth/signup`

### Headers & Body

Same as Test Case 1 (use the same email)

```json
{
  "email": "john.doe@example.com",
  "name": "Another User",
  "password": "differentpass"
}
```

### Expected Response (409 Conflict)

```json
{
  "status": "error",
  "message": "User already exists"
}
```

### Verify

- ✅ Status code: `409 Conflict`
- ✅ Error message is clear

---

## ❌ Test Case 4: Login - Wrong Password

### Create the Request

1. Add new request: `Login - Wrong Password`
2. Method: **POST**
3. URL: `http://localhost:4000/api/auth/login`

### Body (JSON)

```json
{
  "email": "john.doe@example.com",
  "password": "wrongpassword"
}
```

### Expected Response (401 Unauthorized)

```json
{
  "status": "error",
  "message": "Invalid email or password"
}
```

### Verify

- ✅ Status code: `401 Unauthorized`
- ✅ Generic error message (security best practice)

---

## ❌ Test Case 5: Login - Non-existent User

### Create the Request

1. Add new request: `Login - User Not Found`
2. Method: **POST**
3. URL: `http://localhost:4000/api/auth/login`

### Body (JSON)

```json
{
  "email": "nonexistent@example.com",
  "password": "password123"
}
```

### Expected Response (401 Unauthorized)

```json
{
  "status": "error",
  "message": "Invalid email or password"
}
```

### Verify

- ✅ Status code: `401 Unauthorized`
- ✅ Same message as wrong password (doesn't reveal if user exists)

---

## ❌ Test Case 6: Sign Up - Invalid Email

### Create the Request

1. Add new request: `Sign Up - Invalid Email`
2. Method: **POST**
3. URL: `http://localhost:4000/api/auth/signup`

### Body (JSON)

```json
{
  "email": "invalid-email-format",
  "name": "Test User",
  "password": "password123"
}
```

### Expected Response (400 Bad Request)

```json
{
  "status": "error",
  "message": "Invalid email format"
}
```

### Verify

- ✅ Status code: `400 Bad Request`
- ✅ Validation error message

---

## ❌ Test Case 7: Sign Up - Short Password

### Create the Request

1. Add new request: `Sign Up - Short Password`
2. Method: **POST**
3. URL: `http://localhost:4000/api/auth/signup`

### Body (JSON)

```json
{
  "email": "test@example.com",
  "name": "Test User",
  "password": "123"
}
```

### Expected Response (400 Bad Request)

```json
{
  "status": "error",
  "message": "Password must be at least 6 characters long"
}
```

### Verify

- ✅ Status code: `400 Bad Request`
- ✅ Password validation working

---

## ❌ Test Case 8: Sign Up - Missing Fields

### Create the Request

1. Add new request: `Sign Up - Missing Fields`
2. Method: **POST**
3. URL: `http://localhost:4000/api/auth/signup`

### Body (JSON)

```json
{
  "email": "test@example.com"
}
```

### Expected Response (400 Bad Request)

```json
{
  "status": "error",
  "message": "Email, name, and password are required"
}
```

### Verify

- ✅ Status code: `400 Bad Request`
- ✅ Required field validation working

---

## 🔍 Inspecting Cookies in Postman

### View Cookies

1. After sending a request, click **"Cookies"** link (below Send button)
2. You'll see a list of cookies for `localhost:4000`
3. Look for `refreshToken`

### Cookie Details

The `refreshToken` cookie should have:
- **Name:** `refreshToken`
- **Value:** JWT token string
- **Domain:** `localhost`
- **Path:** `/`
- **Expires:** 7 days from now
- **HttpOnly:** ✅ (checkbox checked)
- **Secure:** ❌ (only in production)

### Managing Cookies

- **View all cookies:** Click "Cookies" → "Manage Cookies"
- **Delete cookies:** Select cookie → Click "Remove"
- **Edit cookies:** Select cookie → Modify values

---

## 🔐 Testing with Saved Access Token

If you saved the access token (from Test Case 1), you can use it in protected routes:

### Example: Protected Route Request

1. Create new request
2. Method: **GET**
3. URL: `http://localhost:4000/api/protected-route`
4. Go to **"Headers"** tab
5. Add:

| Key | Value |
|-----|-------|
| `Authorization` | `Bearer {{accessToken}}` |

The `{{accessToken}}` will automatically use the saved token!

---

## 📊 Testing All Cases at Once

### Create a Test Runner

1. Click on your collection **"DevHire Auth API"**
2. Click **"Run"** button (top right)
3. Select all requests
4. Click **"Run DevHire Auth API"**

Postman will run all requests sequentially and show you the results!

---

## 🎨 Organizing Your Collection

### Folders Structure

Create folders to organize your requests:

```
📁 DevHire Auth API
  📁 Sign Up
    ✉️ Sign Up - Success
    ✉️ Sign Up - Duplicate Email
    ✉️ Sign Up - Invalid Email
    ✉️ Sign Up - Short Password
    ✉️ Sign Up - Missing Fields
  📁 Login
    ✉️ Login - Success
    ✉️ Login - Wrong Password
    ✉️ Login - User Not Found
```

### How to Create Folders

1. Right-click on collection
2. Select "Add folder"
3. Name it (e.g., "Sign Up")
4. Drag requests into folder

---

## 🧪 Advanced: Automated Testing

Add tests to automatically verify responses:

### Example Test Script

Go to **"Tests"** tab of any request and add:

```javascript
// Test status code
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

// Test response structure
pm.test("Response has required fields", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('status');
    pm.expect(jsonData).to.have.property('message');
    pm.expect(jsonData).to.have.property('data');
});

// Test user data
pm.test("User data is correct", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.user).to.have.property('email');
    pm.expect(jsonData.data.user).to.not.have.property('password');
});

// Test token exists
pm.test("Access token exists", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data.accessToken).to.be.a('string');
    pm.expect(jsonData.data.accessToken.length).to.be.above(0);
});

// Test cookie is set
pm.test("Refresh token cookie is set", function () {
    pm.expect(pm.cookies.has('refreshToken')).to.be.true;
});
```

When you run the request, you'll see test results at the bottom!

---

## 💾 Export & Share Collection

### Export Collection

1. Click on collection menu (•••)
2. Select "Export"
3. Choose "Collection v2.1"
4. Save as `DevHire-Auth-API.postman_collection.json`

### Import Collection

1. Click "Import" button
2. Drag and drop the JSON file
3. Collection is ready to use!

---

## 🔧 Troubleshooting

### Issue: Server not responding

**Solution:**
```bash
# Check if server is running
curl http://localhost:4000/api/auth/signup

# If not, start it
npm run dev
```

### Issue: Cookies not showing

**Solution:**
- Make sure Postman is NOT using "Interceptor"
- Settings → Interceptor → Turn off
- Cookies should now work

### Issue: 404 Not Found

**Solution:**
- Check URL is exactly: `http://localhost:4000/api/auth/signup`
- Make sure server is running on port 4000
- Check for typos in URL

### Issue: Request body not sent

**Solution:**
- Make sure "Body" tab is selected
- Select "raw" format
- Select "JSON" from dropdown
- Check JSON syntax (use JSON validator)

---

## 📱 Alternative: Using Thunder Client (VS Code Extension)

If you're using VS Code, Thunder Client is a great alternative:

1. Install **Thunder Client** extension
2. Click Thunder Client icon in sidebar
3. Create new request
4. Same process as Postman!

---

## ✅ Complete Testing Checklist

Use this checklist to ensure you've tested everything:

- [ ] Sign Up - Success (201)
- [ ] Sign Up - Duplicate Email (409)
- [ ] Sign Up - Invalid Email (400)
- [ ] Sign Up - Short Password (400)
- [ ] Sign Up - Missing Fields (400)
- [ ] Login - Success (200)
- [ ] Login - Wrong Password (401)
- [ ] Login - User Not Found (401)
- [ ] Verify accessToken is returned
- [ ] Verify refreshToken cookie is set
- [ ] Verify user data has no password
- [ ] Verify status codes are correct
- [ ] Verify error messages are clear

---

## 🎯 Quick Reference

### Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/signup` | POST | Register new user |
| `/api/auth/login` | POST | Authenticate user |

### Expected Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | Login success |
| 201 | Created | Sign up success |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Invalid credentials |
| 409 | Conflict | User already exists |
| 500 | Server Error | Server problem |

### Required Headers

```
Content-Type: application/json
```

### Sign Up Body

```json
{
  "email": "user@example.com",
  "name": "Full Name",
  "password": "password123"
}
```

### Login Body

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

---

## 📞 Need Help?

If you encounter issues:
1. Check server is running: `npm run dev`
2. Check console logs for errors
3. Verify JSON body syntax
4. Check Postman console (View → Show Postman Console)

---

**Happy Testing! 🚀**

For more detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
