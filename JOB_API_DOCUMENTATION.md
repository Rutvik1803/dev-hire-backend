# Job Posting API Documentation

## Overview
Complete API for job posting functionality where **only recruiters** can create jobs, but anyone can view them.

---

## 🔐 Authentication Required

All job creation endpoints require:
- **Bearer Token** in Authorization header
- **Role:** RECRUITER

---

## 📋 Endpoints

### 1. Create New Job (POST)
**Endpoint:** `POST /api/jobs`  
**Access:** RECRUITER only  
**Authentication:** Required

#### Headers
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

#### Request Body
```json
{
  "title": "Senior Full Stack Developer",
  "companyName": "Tech Solutions Inc",
  "location": "San Francisco, CA (Remote)",
  "jobType": "FULL_TIME",
  "salaryRange": "$120,000 - $150,000",
  "requiredSkills": ["JavaScript", "React", "Node.js", "PostgreSQL", "AWS"],
  "description": "We are looking for an experienced Full Stack Developer to join our team..."
}
```

#### Field Validations
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `title` | string | ✅ | Non-empty |
| `companyName` | string | ✅ | Non-empty |
| `location` | string | ✅ | Non-empty |
| `jobType` | enum | ✅ | FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP |
| `salaryRange` | string | ✅ | Non-empty |
| `requiredSkills` | string[] | ✅ | Non-empty array |
| `description` | string | ✅ | Non-empty |

#### Success Response (201 Created)
```json
{
  "status": "success",
  "message": "Job posted successfully",
  "data": {
    "id": 1,
    "title": "Senior Full Stack Developer",
    "companyName": "Tech Solutions Inc",
    "location": "San Francisco, CA (Remote)",
    "jobType": "FULL_TIME",
    "salaryRange": "$120,000 - $150,000",
    "requiredSkills": ["JavaScript", "React", "Node.js", "PostgreSQL", "AWS"],
    "description": "We are looking for an experienced Full Stack Developer...",
    "recruiterId": 5,
    "recruiter": {
      "id": 5,
      "name": "John Recruiter",
      "email": "recruiter@example.com",
      "role": "RECRUITER"
    },
    "createdAt": "2025-10-06T12:00:00.000Z",
    "updatedAt": "2025-10-06T12:00:00.000Z"
  }
}
```

#### Error Responses

**401 Unauthorized - No Token:**
```json
{
  "status": "error",
  "message": "Access token required"
}
```

**401 Unauthorized - Invalid Token:**
```json
{
  "status": "error",
  "message": "Invalid or expired access token"
}
```

**403 Forbidden - Not a Recruiter:**
```json
{
  "status": "error",
  "message": "You do not have permission to perform this action"
}
```

**400 Bad Request - Missing Fields:**
```json
{
  "status": "error",
  "message": "All job fields are required"
}
```

**400 Bad Request - Invalid Job Type:**
```json
{
  "status": "error",
  "message": "Invalid job type. Must be one of: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP"
}
```

---

### 2. Get All Jobs (GET)
**Endpoint:** `GET /api/jobs`  
**Access:** Public (No authentication required)

#### Success Response (200 OK)
```json
{
  "status": "success",
  "message": "Jobs retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Senior Full Stack Developer",
      "companyName": "Tech Solutions Inc",
      "location": "San Francisco, CA (Remote)",
      "jobType": "FULL_TIME",
      "salaryRange": "$120,000 - $150,000",
      "requiredSkills": ["JavaScript", "React", "Node.js"],
      "description": "Job description...",
      "recruiterId": 5,
      "recruiter": {
        "id": 5,
        "name": "John Recruiter",
        "email": "recruiter@example.com",
        "role": "RECRUITER"
      },
      "createdAt": "2025-10-06T12:00:00.000Z",
      "updatedAt": "2025-10-06T12:00:00.000Z"
    },
    {
      "id": 2,
      "title": "Frontend Developer",
      "companyName": "StartUp Co",
      "location": "New York, NY",
      "jobType": "CONTRACT",
      "salaryRange": "$80,000 - $100,000",
      "requiredSkills": ["React", "TypeScript", "CSS"],
      "description": "Another job description...",
      "recruiterId": 6,
      "recruiter": {
        "id": 6,
        "name": "Jane Recruiter",
        "email": "jane@example.com",
        "role": "RECRUITER"
      },
      "createdAt": "2025-10-06T11:00:00.000Z",
      "updatedAt": "2025-10-06T11:00:00.000Z"
    }
  ]
}
```

---

### 3. Get Job by ID (GET)
**Endpoint:** `GET /api/jobs/:id`  
**Access:** Public (No authentication required)

#### Example
```
GET /api/jobs/1
```

#### Success Response (200 OK)
```json
{
  "status": "success",
  "message": "Job retrieved successfully",
  "data": {
    "id": 1,
    "title": "Senior Full Stack Developer",
    "companyName": "Tech Solutions Inc",
    "location": "San Francisco, CA (Remote)",
    "jobType": "FULL_TIME",
    "salaryRange": "$120,000 - $150,000",
    "requiredSkills": ["JavaScript", "React", "Node.js", "PostgreSQL", "AWS"],
    "description": "Detailed job description...",
    "recruiterId": 5,
    "recruiter": {
      "id": 5,
      "name": "John Recruiter",
      "email": "recruiter@example.com",
      "role": "RECRUITER"
    },
    "createdAt": "2025-10-06T12:00:00.000Z",
    "updatedAt": "2025-10-06T12:00:00.000Z"
  }
}
```

#### Error Response (404)
```json
{
  "status": "error",
  "message": "Job not found"
}
```

---

### 4. Get My Jobs (GET)
**Endpoint:** `GET /api/jobs/my/jobs`  
**Access:** RECRUITER only  
**Authentication:** Required

Gets all jobs posted by the authenticated recruiter.

#### Headers
```
Authorization: Bearer <accessToken>
```

#### Success Response (200 OK)
```json
{
  "status": "success",
  "message": "Your jobs retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Senior Full Stack Developer",
      "companyName": "Tech Solutions Inc",
      "location": "San Francisco, CA (Remote)",
      "jobType": "FULL_TIME",
      "salaryRange": "$120,000 - $150,000",
      "requiredSkills": ["JavaScript", "React", "Node.js"],
      "description": "Job description...",
      "recruiterId": 5,
      "recruiter": {
        "id": 5,
        "name": "John Recruiter",
        "email": "recruiter@example.com",
        "role": "RECRUITER"
      },
      "createdAt": "2025-10-06T12:00:00.000Z",
      "updatedAt": "2025-10-06T12:00:00.000Z"
    }
  ]
}
```

---

## 🧪 Testing Guide

### Step 1: Create a Recruiter Account

```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "recruiter@example.com",
    "name": "John Recruiter",
    "password": "password123",
    "role": "RECRUITER"
  }'
```

**Save the `accessToken` from response!**

---

### Step 2: Create a Job (Recruiter Only)

```bash
curl -X POST http://localhost:4000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "title": "Senior Full Stack Developer",
    "companyName": "Tech Solutions Inc",
    "location": "San Francisco, CA (Remote)",
    "jobType": "FULL_TIME",
    "salaryRange": "$120,000 - $150,000",
    "requiredSkills": ["JavaScript", "React", "Node.js", "PostgreSQL", "AWS"],
    "description": "We are looking for an experienced Full Stack Developer to join our team. You will be responsible for building scalable web applications..."
  }'
```

---

### Step 3: View All Jobs (Public)

```bash
curl http://localhost:4000/api/jobs
```

---

### Step 4: View Single Job (Public)

```bash
curl http://localhost:4000/api/jobs/1
```

---

### Step 5: View My Jobs (Recruiter Only)

```bash
curl http://localhost:4000/api/jobs/my/jobs \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

### Step 6: Try as Developer (Should Fail)

Create a developer account:
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@example.com",
    "name": "Dev User",
    "password": "password123",
    "role": "DEVELOPER"
  }'
```

Try to create a job (should fail with 403):
```bash
curl -X POST http://localhost:4000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DEVELOPER_ACCESS_TOKEN" \
  -d '{
    "title": "Test Job",
    "companyName": "Test Co",
    "location": "Test Location",
    "jobType": "FULL_TIME",
    "salaryRange": "$50k - $70k",
    "requiredSkills": ["Test"],
    "description": "Test description"
  }'
```

**Expected Response (403):**
```json
{
  "status": "error",
  "message": "You do not have permission to perform this action"
}
```

---

## 📝 Postman Testing

### Collection Structure
```
📁 Job API
  📁 Create Job (RECRUITER)
    ✉️ Create Job - Success
    ✉️ Create Job - No Token (401)
    ✉️ Create Job - As Developer (403)
    ✉️ Create Job - Invalid Job Type (400)
    ✉️ Create Job - Missing Fields (400)
  📁 Get Jobs (PUBLIC)
    ✉️ Get All Jobs
    ✉️ Get Job by ID
    ✉️ Get Job - Not Found (404)
  📁 My Jobs (RECRUITER)
    ✉️ Get My Jobs
```

### Environment Variables
Set these in Postman collection:
- `baseUrl`: `http://localhost:4000`
- `recruiterToken`: (Save from recruiter login)
- `developerToken`: (Save from developer login)

---

## 🔍 Job Types Reference

| Value | Description |
|-------|-------------|
| `FULL_TIME` | Full-time position |
| `PART_TIME` | Part-time position |
| `CONTRACT` | Contract/Freelance |
| `INTERNSHIP` | Internship position |

---

## 🎯 Security Features

✅ **Role-Based Access Control (RBAC)**
- Only recruiters can create jobs
- Anyone can view jobs
- Recruiters can only see their own jobs

✅ **JWT Authentication**
- Access token required for protected routes
- Token verification on each request

✅ **Input Validation**
- All required fields validated
- Job type must be valid enum value
- Required skills must be non-empty array

✅ **Authorization Middleware**
- Separate authentication (verify token)
- Separate authorization (check role)
- Reusable for other protected routes

---

## 📊 Database Schema

```prisma
model Job {
  id              Int      @id @default(autoincrement())
  title           String
  companyName     String
  location        String
  jobType         JobType
  salaryRange     String
  requiredSkills  String[]
  description     String   @db.Text
  recruiterId     Int
  recruiter       User     @relation(fields: [recruiterId], references: [id])
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum JobType {
  FULL_TIME
  PART_TIME
  CONTRACT
  INTERNSHIP
}
```

---

## ✅ Implementation Checklist

- [x] Prisma schema with Job model
- [x] Authentication middleware (verify JWT)
- [x] Authorization middleware (check role)
- [x] Job service (business logic)
- [x] Job controller (request handlers)
- [x] Job routes (API endpoints)
- [x] Database migration
- [x] Error handling
- [x] Input validation
- [x] Role-based access control

---

## 🚀 Ready to Use!

The job posting API is fully functional and ready for testing. Recruiters can now post jobs, and all users can view them!

**Happy Coding! 🎉**
