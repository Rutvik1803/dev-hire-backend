# Developer Dashboard API - Quick Reference Card

## 🔐 Authentication
```bash
# All requests require this header:
Authorization: Bearer {accessToken}
```

## 📊 Dashboard Statistics
```http
GET /api/developer/dashboard/stats

Response: {
  appliedJobs: 15,
  inReview: 8,
  interviews: 3,
  offers: 2,
  recentActivity: { newResponsesThisWeek: 5, upcomingInterviews: 3 }
}
```

## 📋 Applications

### Get All Applications (with filters)
```http
GET /api/developer/applications?status=APPLIED&limit=20&offset=0&sort=desc

Query Params:
- status: APPLIED | IN_REVIEW | ACCEPTED | REJECTED (optional)
- limit: number (default: 50)
- offset: number (default: 0)
- sort: asc | desc (default: desc)
```

### Get Recent Applications
```http
GET /api/developer/applications/recent?limit=10

Query Params:
- limit: number (default: 10, max: 20)
```

### Check Application Status
```http
GET /api/jobs/{jobId}/application-status

Response: {
  hasApplied: true,
  application: { id, status, appliedDate }
}
```

### Withdraw Application
```http
DELETE /api/applications/{applicationId}

Note: Cannot withdraw if status is ACCEPTED or REJECTED
```

## 👤 Profile

### Get Profile
```http
GET /api/developer/profile

Response: {
  id, email, name, role, experience, skills[], 
  resumeUrl, linkedinUrl, githubUrl, phone
}
```

### Update Profile
```http
PATCH /api/developer/profile
Content-Type: application/json

Body: {
  "experience": 5,
  "skills": ["JavaScript", "React", "Node.js"],
  "linkedinUrl": "https://linkedin.com/in/johndoe",
  "githubUrl": "https://github.com/johndoe",
  "phone": "+1234567890"
}

Note: All fields are optional
```

## 📄 Resume

### Upload Resume
```http
POST /api/developer/resume/upload
Content-Type: multipart/form-data

Form Data:
- resume: <file>

Constraints:
- File types: PDF, DOC, DOCX only
- Max size: 5MB
- Replaces existing resume
```

### Get Resume Details
```http
GET /api/developer/resume

Response: {
  resumeUrl: "/uploads/resumes/resume.pdf",
  fileName: "John_Doe_Resume.pdf",
  uploadedAt: "2024-01-10T12:00:00Z"
}
```

### Delete Resume
```http
DELETE /api/developer/resume

Deletes file from filesystem and removes URL from database
```

## 💼 Job Application

### Apply to Job
```http
POST /api/jobs/{jobId}/apply
Content-Type: application/json

Body: {
  "coverLetter": "I am excited to apply..."
}
```

## ⚠️ Common Errors

| Code | Message | Reason |
|------|---------|--------|
| 401 | Access token required | Missing/invalid token |
| 403 | You do not have permission | Wrong role |
| 404 | Application not found | Invalid ID |
| 409 | Cannot withdraw application | Status is ACCEPTED/REJECTED |
| 400 | Invalid file type | Not PDF/DOC/DOCX |

## 🎯 Quick Testing Flow

1. **Login:**
   ```bash
   POST /api/auth/login
   Body: { "email": "dev@example.com", "password": "pass123" }
   # Copy accessToken
   ```

2. **Get Stats:**
   ```bash
   GET /api/developer/dashboard/stats
   Header: Authorization: Bearer {token}
   ```

3. **View Applications:**
   ```bash
   GET /api/developer/applications
   Header: Authorization: Bearer {token}
   ```

4. **Update Profile:**
   ```bash
   PATCH /api/developer/profile
   Header: Authorization: Bearer {token}
   Body: { "experience": 5, "skills": ["JS", "React"] }
   ```

5. **Upload Resume:**
   ```bash
   POST /api/developer/resume/upload
   Header: Authorization: Bearer {token}
   Form: resume=@resume.pdf
   ```

## 📦 Response Format

### Success (200, 201)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error (400, 401, 403, 404, 409, 500)
```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

## 🔗 Base URL
```
http://localhost:4000
```

## 📚 Full Documentation
- `DEVELOPER_API_IMPLEMENTATION_COMPLETE.md` - Detailed API docs
- `FRONTEND_DEVELOPER_DASHBOARD_PROMPT.md` - Frontend integration guide
- `src/modules/developer/README.md` - Module documentation
