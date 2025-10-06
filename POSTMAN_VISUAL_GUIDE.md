# Visual Postman Testing Guide

## 📸 Step-by-Step with Visual Instructions

---

## Step 1: Open Postman and Create New Request

**What you'll see:**
```
┌─────────────────────────────────────────┐
│  Postman                                │
│  ┌────────┐                             │
│  │  New ▼ │  ← Click here               │
│  └────────┘                             │
│                                         │
│  Then select: "HTTP Request"           │
└─────────────────────────────────────────┘
```

---

## Step 2: Configure Sign Up Request

### URL Bar:
```
┌──────────────────────────────────────────────────────┐
│  POST ▼  │ http://localhost:4000/api/auth/signup   │
└──────────────────────────────────────────────────────┘
         ↑                           ↑
    Method Type              Your API endpoint
```

### Tabs Section:
```
┌──────────────────────────────────────────────────────┐
│  Params  Headers  Body  Pre-request  Tests  Settings│
│  ──────  ───────  ────                               │
│                   ↑                                  │
│              Click "Body" tab                        │
└──────────────────────────────────────────────────────┘
```

### Body Configuration:
```
┌──────────────────────────────────────────────────────┐
│  ○ none  ○ form-data  ○ x-www-form-urlencoded        │
│  ● raw   ○ binary     ○ GraphQL                      │
│                                                       │
│  Text ▼  →  Change to  →  JSON ▼                     │
│                                 ↑                     │
│                         Select this!                 │
└──────────────────────────────────────────────────────┘

Then paste this in the text area below:

{
  "email": "test@example.com",
  "name": "Test User",
  "password": "password123"
}
```

### Headers Tab:
```
┌──────────────────────────────────────────────────────┐
│  Params  Headers  Body  Pre-request  Tests  Settings│
│          ───────                                     │
│          ↑ Click "Headers"                           │
└──────────────────────────────────────────────────────┘

Add this header:
┌──────────────────────────┬──────────────────────────┐
│ Key                      │ Value                    │
├──────────────────────────┼──────────────────────────┤
│ Content-Type             │ application/json         │
└──────────────────────────┴──────────────────────────┘
```

---

## Step 3: Send Request

```
┌──────────────────────────────────────────────────────┐
│                                                       │
│                          ┌──────┐                    │
│                          │ Send │  ← Click here      │
│                          └──────┘                    │
│                                                       │
└──────────────────────────────────────────────────────┘
```

---

## Step 4: Check Response

### Status Code (Bottom Right):
```
┌──────────────────────────────────────────────────────┐
│  Response Body                                        │
│                                                       │
│  Status: 201 Created  ✓  Time: 150 ms  Size: 450 B  │
│          ────────────                                │
│               ↑                                       │
│        Should be 201                                 │
└──────────────────────────────────────────────────────┘
```

### Response Body:
```
┌──────────────────────────────────────────────────────┐
│  Body  Cookies  Headers  Test Results                │
│  ────                                                 │
│                                                       │
│  {                                                    │
│    "status": "success",                              │
│    "message": "User registered successfully",        │
│    "data": {                                         │
│      "user": {                                       │
│        "id": 1,                                      │
│        "email": "test@example.com",                  │
│        "name": "Test User",                          │
│        "role": "USER",                               │
│        ...                                           │
│      },                                              │
│      "accessToken": "eyJhbGci..."                    │
│    }                                                 │
│  }                                                   │
└──────────────────────────────────────────────────────┘
```

### Cookies Tab:
```
┌──────────────────────────────────────────────────────┐
│  Body  Cookies  Headers  Test Results                │
│        ───────                                        │
│        ↑ Click "Cookies"                             │
│                                                       │
│  Cookies for localhost:4000                          │
│  ┌──────────────┬───────────────┬──────────────┐    │
│  │ Name         │ Value         │ Expires      │    │
│  ├──────────────┼───────────────┼──────────────┤    │
│  │ refreshToken │ eyJhbGci...   │ 7 days       │    │
│  │              │ (JWT token)   │              │    │
│  └──────────────┴───────────────┴──────────────┘    │
│                                                       │
│  ✓ Should see refreshToken here!                     │
└──────────────────────────────────────────────────────┘
```

---

## Step 5: Test Login Request

### Create New Request:
```
┌──────────────────────────────────────────────────────┐
│  POST ▼  │ http://localhost:4000/api/auth/login     │
└──────────────────────────────────────────────────────┘
```

### Body (same as before but different endpoint):
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

### Expected Response (200 OK):
```
┌──────────────────────────────────────────────────────┐
│  Status: 200 OK  ✓  Time: 100 ms                     │
│          ──────                                       │
│                                                       │
│  {                                                    │
│    "status": "success",                              │
│    "message": "Login successful",                    │
│    "data": {                                         │
│      "user": { ... },                                │
│      "accessToken": "eyJhbGci..."  ← New token!      │
│    }                                                 │
│  }                                                   │
└──────────────────────────────────────────────────────┘
```

---

## Common Views in Postman

### Request Building Area:
```
┌──────────────────────────────────────────────────────┐
│  GET ▼  │ Enter URL here                      Send   │
├──────────────────────────────────────────────────────┤
│                                                       │
│  Params │ Headers │ Body │ Pre-request │ Tests       │
│                                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │                                              │    │
│  │  Your request body / headers go here        │    │
│  │                                              │    │
│  └─────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

### Response Area:
```
┌──────────────────────────────────────────────────────┐
│  Body │ Cookies │ Headers │ Test Results             │
│                                                       │
│  Status: 200 OK  Time: 100ms  Size: 500B             │
│                                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │                                              │    │
│  │  Response body appears here                 │    │
│  │  (JSON format)                               │    │
│  │                                              │    │
│  └─────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────┘
```

---

## Color Coding in Status Codes

Postman shows different colors for different status codes:

- **🟢 Green (200-299)** - Success! ✅
  - 200 OK
  - 201 Created

- **🟡 Yellow (400-499)** - Client errors ⚠️
  - 400 Bad Request
  - 401 Unauthorized
  - 409 Conflict

- **🔴 Red (500-599)** - Server errors ❌
  - 500 Internal Server Error

---

## Keyboard Shortcuts

Useful shortcuts in Postman:

| Action | Shortcut (Mac) | Shortcut (Windows) |
|--------|----------------|-------------------|
| Send Request | Cmd + Enter | Ctrl + Enter |
| New Request | Cmd + N | Ctrl + N |
| Save Request | Cmd + S | Ctrl + S |
| Format JSON | Cmd + B | Ctrl + B |

---

## Collections View (Left Sidebar)

```
┌─────────────────────────┐
│ Collections             │
│                         │
│ 📁 DevHire Auth API     │
│   ├─ 📁 Sign Up         │
│   │   ├─ ✉️ Success     │
│   │   ├─ ✉️ Duplicate   │
│   │   └─ ✉️ Invalid     │
│   │                     │
│   └─ 📁 Login           │
│       ├─ ✉️ Success     │
│       └─ ✉️ Wrong Pass  │
│                         │
└─────────────────────────┘
       ↑
    Organize your
    requests here
```

---

## Quick Tips

### 💡 Tip 1: Save Your Requests
```
Click "Save" → Name it → Select Collection
```

### 💡 Tip 2: See Raw Request
```
Click "Code" link (right side) → See cURL version
```

### 💡 Tip 3: Postman Console
```
View → Show Postman Console
See all network activity and logs
```

### 💡 Tip 4: Beautify JSON
```
After getting response, click "Pretty" → "JSON"
Makes it easier to read
```

---

## Troubleshooting Visual Indicators

### ❌ Connection Refused:
```
┌──────────────────────────────────────┐
│  ⚠️  Could not send request          │
│                                      │
│  Error: connect ECONNREFUSED         │
│  localhost:4000                      │
│                                      │
│  → Server is not running!            │
│     Run: npm run dev                 │
└──────────────────────────────────────┘
```

### ❌ 404 Not Found:
```
┌──────────────────────────────────────┐
│  Status: 404 Not Found               │
│                                      │
│  → Check your URL!                   │
│     Correct: /api/auth/signup        │
│     Wrong: /api/signup               │
└──────────────────────────────────────┘
```

### ❌ Invalid JSON:
```
┌──────────────────────────────────────┐
│  Status: 400 Bad Request             │
│                                      │
│  {                                   │
│    "error": "Invalid JSON"           │
│  }                                   │
│                                      │
│  → Check JSON syntax!                │
│     Missing comma, quote, etc.       │
└──────────────────────────────────────┘
```

---

## Success Checklist ✅

After each request, verify:

- [ ] Green status code (200/201)
- [ ] Response body has "status": "success"
- [ ] User data present (no password field)
- [ ] accessToken is a long string
- [ ] refreshToken cookie is set
- [ ] No errors in response

---

## Next Steps

1. ✅ Test Sign Up → Should work
2. ✅ Test Login → Should work
3. ✅ Test errors → Should return proper codes
4. ✅ Check cookies → Should be set
5. 📖 Read [POSTMAN_GUIDE.md](./POSTMAN_GUIDE.md) for advanced testing

---

**You're all set! Happy testing! 🚀**
