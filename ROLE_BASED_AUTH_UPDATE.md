# Role-Based Authentication Implementation

## 📋 Summary of Changes

We've updated the authentication system to support role-based signup and login as per your UI requirements:

### **Sign Up Flow:**
- User selects role: `DEVELOPER` or `RECRUITER`
- Enters: name, email, password
- System creates user with selected role

### **Login Flow:**
- User selects role: `DEVELOPER`, `RECRUITER`, or `ADMIN`
- Enters: email, password
- System validates role matches the user's account role

---

## ✅ Changes Completed

### 1. **Prisma Schema Updated** (`prisma/schema.prisma`)

**Before:**
```prisma
enum Role {
  USER
  ADMIN
}
```

**After:**
```prisma
enum Role {
  DEVELOPER
  RECRUITER
  ADMIN
}
```

### 2. **Auth Service Updated** (`src/modules/auth/auth.service.ts`)

**Sign Up Changes:**
- ✅ Added `role` field to `UserData` type
- ✅ Added role validation (only DEVELOPER or RECRUITER allowed)
- ✅ User created with selected role

**Login Changes:**
- ✅ Added `role` field to `LoginData` type  
- ✅ Added role validation (DEVELOPER, RECRUITER, or ADMIN)
- ✅ Validates user's role matches login role
- ✅ Returns error if role mismatch

---

## 🔄 Database Migration Needed

⚠️ **IMPORTANT:** Before running the migration, you need to handle existing data.

### **Option A: Fresh Start (Development Only)**

If you're in development and don't need existing data:

```bash
# Drop the database and recreate
npx prisma migrate reset --force

# Create new migration
npx prisma migrate dev --name add_developer_recruiter_roles
```

### **Option B: Migrate Existing Data (If you have users)**

If you have existing users with `USER` role, you need to migrate them:

**Step 1: Create migration manually**
```bash
npx prisma migrate dev --create-only --name add_developer_recruiter_roles
```

**Step 2: Edit the migration file to handle existing data**

The migration file will be in: `prisma/migrations/[timestamp]_add_developer_recruiter_roles/migration.sql`

Add this before changing the enum:

```sql
-- First, update existing USER roles to DEVELOPER
UPDATE "User" SET role = 'DEVELOPER' WHERE role = 'USER';

-- Now alter the enum
ALTER TYPE "Role" RENAME TO "Role_old";

CREATE TYPE "Role" AS ENUM ('DEVELOPER', 'RECRUITER', 'ADMIN');

ALTER TABLE "User" 
  ALTER COLUMN "role" DROP DEFAULT,
  ALTER COLUMN "role" TYPE "Role" USING (role::text::"Role"),
  ALTER COLUMN "role" SET DEFAULT 'DEVELOPER';

DROP TYPE "Role_old";
```

**Step 3: Apply the migration**
```bash
npx prisma migrate dev
```

---

## 📝 API Changes

### **Sign Up Request (NEW Format)**

**Endpoint:** `POST /api/auth/signup`

**Before:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123"
}
```

**After:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123",
  "role": "DEVELOPER"
}
```

**Valid roles for signup:** `DEVELOPER` or `RECRUITER`

**Response (201):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "DEVELOPER",
      "createdAt": "...",
      "updatedAt": "..."
    },
    "accessToken": "eyJhbGci..."
  }
}
```

### **Login Request (NEW Format)**

**Endpoint:** `POST /api/auth/login`

**Before:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**After:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "DEVELOPER"
}
```

**Valid roles for login:** `DEVELOPER`, `RECRUITER`, or `ADMIN`

**Response (200):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "DEVELOPER",
      "createdAt": "...",
      "updatedAt": "..."
    },
    "accessToken": "eyJhbGci..."
  }
}
```

---

## 🚨 New Error Scenarios

### **Sign Up Errors:**

**1. Invalid Role:**
```bash
POST /api/auth/signup
{
  "email": "user@example.com",
  "name": "John",
  "password": "password123",
  "role": "ADMIN"
}
```

**Response (400):**
```json
{
  "status": "error",
  "message": "Invalid role. Only DEVELOPER or RECRUITER allowed for signup"
}
```

**2. Missing Role:**
```bash
POST /api/auth/signup
{
  "email": "user@example.com",
  "name": "John",
  "password": "password123"
}
```

**Response (400):**
```json
{
  "status": "error",
  "message": "Email, name, password, and role are required"
}
```

### **Login Errors:**

**1. Role Mismatch:**
```bash
# User registered as DEVELOPER, but trying to login as RECRUITER
POST /api/auth/login
{
  "email": "dev@example.com",
  "password": "password123",
  "role": "RECRUITER"
}
```

**Response (401):**
```json
{
  "status": "error",
  "message": "Invalid email, password, or role"
}
```

**2. Missing Role:**
```bash
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (400):**
```json
{
  "status": "error",
  "message": "Email, password, and role are required"
}
```

---

## 🧪 Testing in Postman

### **Test 1: Sign Up as Developer**

```json
POST http://localhost:4000/api/auth/signup

{
  "email": "developer@example.com",
  "name": "Dev User",
  "password": "password123",
  "role": "DEVELOPER"
}
```

**Expected:** 201 Created with DEVELOPER role

### **Test 2: Sign Up as Recruiter**

```json
POST http://localhost:4000/api/auth/signup

{
  "email": "recruiter@example.com",
  "name": "Recruiter User",
  "password": "password123",
  "role": "RECRUITER"
}
```

**Expected:** 201 Created with RECRUITER role

### **Test 3: Login as Developer**

```json
POST http://localhost:4000/api/auth/login

{
  "email": "developer@example.com",
  "password": "password123",
  "role": "DEVELOPER"
}
```

**Expected:** 200 OK

### **Test 4: Login with Wrong Role**

```json
POST http://localhost:4000/api/auth/login

{
  "email": "developer@example.com",
  "password": "password123",
  "role": "RECRUITER"
}
```

**Expected:** 401 Unauthorized

### **Test 5: Try to Sign Up as ADMIN (Should Fail)**

```json
POST http://localhost:4000/api/auth/signup

{
  "email": "admin@example.com",
  "name": "Admin",
  "password": "password123",
  "role": "ADMIN"
}
```

**Expected:** 400 Bad Request

---

## 🔐 Security Considerations

### **Why Validate Role on Login?**

This prevents:
1. ❌ Developer trying to login as Admin
2. ❌ Recruiter trying to login as Developer
3. ❌ Role escalation attacks

### **Why Only DEVELOPER/RECRUITER for Signup?**

- ✅ ADMIN accounts should be created by other means (seed script, admin panel)
- ✅ Prevents unauthorized admin account creation
- ✅ Aligns with your UI flow

---

## 📋 Frontend Integration

Your frontend should:

### **Sign Up Page:**
```javascript
// Step 1: Role selection
const role = selectedRole; // 'DEVELOPER' or 'RECRUITER'

// Step 2: Sign up
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name,
    email,
    password,
    role  // Include selected role
  })
});
```

### **Login Page:**
```javascript
// Step 1: Role selection
const role = selectedRole; // 'DEVELOPER', 'RECRUITER', or 'ADMIN'

// Step 2: Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email,
    password,
    role  // Include selected role
  })
});
```

---

## ✅ Next Steps

1. **Choose Migration Strategy:**
   - Option A: Fresh start (recommended for development)
   - Option B: Migrate existing data

2. **Run Migration:**
   ```bash
   npx prisma migrate dev --name add_developer_recruiter_roles
   ```

3. **Test the API:**
   - Test sign up with DEVELOPER role
   - Test sign up with RECRUITER role
   - Test login with correct role
   - Test login with wrong role

4. **Update Frontend:**
   - Add `role` field to signup form submission
   - Add `role` field to login form submission

---

## 🎯 Files Modified

- ✅ `prisma/schema.prisma` - Updated Role enum
- ✅ `src/modules/auth/auth.service.ts` - Added role handling
- ⏳ Database migration - Pending (needs to be run)

---

## 🚀 Ready to Test!

Once you run the migration, the API will be ready to handle role-based authentication as per your UI requirements!

**Questions or need help with the migration?** Let me know!
