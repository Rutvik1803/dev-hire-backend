# Quick Start - Job Posting API

## ✅ Implementation Complete!

Job posting functionality is ready where **only RECRUITERs** can create jobs!

---

## 🚀 Quick Test

### 1. Create Recruiter Account
```bash
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "recruiter@test.com",
    "name": "Test Recruiter",
    "password": "password123",
    "role": "RECRUITER"
  }'
```

💾 **Save the `accessToken` from response!**

---

### 2. Post a Job
```bash
curl -X POST http://localhost:4000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Full Stack Developer",
    "companyName": "Tech Corp",
    "location": "San Francisco, CA",
    "jobType": "FULL_TIME",
    "salaryRange": "$100k - $130k",
    "requiredSkills": ["React", "Node.js", "MongoDB"],
    "description": "Looking for experienced developer..."
  }'
```

---

### 3. View All Jobs (No Auth Required)
```bash
curl http://localhost:4000/api/jobs
```

---

## 📋 API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/jobs` | RECRUITER | Create new job |
| `GET` | `/api/jobs` | PUBLIC | Get all jobs |
| `GET` | `/api/jobs/:id` | PUBLIC | Get single job |
| `GET` | `/api/jobs/my/jobs` | RECRUITER | Get my jobs |

---

## 🔑 Job Types

- `FULL_TIME`
- `PART_TIME`
- `CONTRACT`
- `INTERNSHIP`

---

## ✅ Required Fields

```json
{
  "title": "string",
  "companyName": "string",
  "location": "string",
  "jobType": "FULL_TIME | PART_TIME | CONTRACT | INTERNSHIP",
  "salaryRange": "string",
  "requiredSkills": ["array", "of", "strings"],
  "description": "string"
}
```

---

## 🔐 Authorization Header

For protected routes (creating jobs):
```
Authorization: Bearer <your-access-token>
```

---

## 📚 Full Documentation

See [JOB_API_DOCUMENTATION.md](./JOB_API_DOCUMENTATION.md) for:
- Complete API reference
- All error scenarios
- Postman testing guide
- Security features
- Database schema

---

## 🎯 What's Implemented

✅ **Authentication Middleware** - Verify JWT tokens  
✅ **Authorization Middleware** - Role-based access control  
✅ **Job Service** - Complete business logic  
✅ **Job Controller** - Request handlers  
✅ **Job Routes** - API endpoints  
✅ **Database Migration** - Job table created  
✅ **Input Validation** - All fields validated  
✅ **Error Handling** - Proper status codes  

---

## 🧪 Test Scenarios

✅ Recruiter can create job  
✅ Developer cannot create job (403 Forbidden)  
✅ Anyone can view jobs  
✅ Recruiter can view their own jobs  
✅ Invalid job type returns 400  
✅ Missing fields returns 400  
✅ No token returns 401  
✅ Invalid token returns 401  

---

**Ready to test! 🚀**
