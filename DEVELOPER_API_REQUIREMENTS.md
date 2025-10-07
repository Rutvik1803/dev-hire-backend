# Backend API Development Prompt for Developer Dashboard

## 🎯 Objective
Create a complete set of RESTful APIs for a developer dashboard in a job hiring platform. The system should handle job browsing, job applications, application tracking, and resume management.

---

## 📦 Required APIs

### 1. **Developer Dashboard Statistics API**

**Endpoint**: `GET /api/developer/dashboard/stats`  
**Authentication**: Required (JWT) - Only DEVELOPER role  
**Description**: Get aggregated statistics for the developer's dashboard

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "appliedJobs": 15,
    "inReview": 8,
    "interviews": 3,
    "offers": 1,
    "recentActivity": {
      "newResponsesThisWeek": 5,
      "upcomingInterviews": 2
    }
  }
}
```

**Business Logic**:
- `appliedJobs`: Total number of applications submitted by developer
- `inReview`: Applications with status "IN_REVIEW"
- `interviews`: Applications with status "ACCEPTED" (or create INTERVIEW status)
- `offers`: Count of accepted applications or job offers received
- `recentActivity.newResponsesThisWeek`: Status changes in last 7 days
- `recentActivity.upcomingInterviews`: Scheduled interviews (if implementing)

---

### 2. **Get Developer's Applications API**

**Endpoint**: `GET /api/developer/applications`  
**Authentication**: Required (JWT) - Only DEVELOPER role  
**Description**: Get all applications submitted by the authenticated developer

**Query Parameters**:
- `status` (optional): Filter by application status (APPLIED, IN_REVIEW, ACCEPTED, REJECTED)
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)
- `sort` (optional): Sort by appliedDate (asc, desc) - default: desc

**Request Example**:
```javascript
const response = await fetch('http://localhost:4000/api/developer/applications', {
  headers: {
    'Authorization': `Bearer ${token}`,
  }
});
```

**Response Example (200 OK)**:
```json
{
  "success": true,
  "message": "Applications retrieved successfully",
  "data": {
    "data": [
      {
        "id": 123,
        "jobId": 45,
        "status": "IN_REVIEW",
        "coverLetter": "I am very interested...",
        "appliedDate": "2025-10-05T10:30:00.000Z",
        "updatedDate": "2025-10-06T14:45:00.000Z",
        "job": {
          "id": 45,
          "title": "Senior Frontend Developer",
          "companyName": "Tech Corp",
          "location": "San Francisco, CA",
          "jobType": "FULL_TIME",
          "salaryRange": "$120k - $160k"
        }
      }
    ],
    "total": 15,
    "limit": 50,
    "offset": 0
  }
}
```

---

### 3. **Get Recent Applications API**

**Endpoint**: `GET /api/developer/applications/recent`  
**Authentication**: Required (JWT) - Only DEVELOPER role  
**Description**: Get recent applications for dashboard display (last 30 days, max 10 results)

**Query Parameters**:
- `limit` (optional): Number of results (default: 10, max: 20)

**Request Example**:
```javascript
const response = await fetch('http://localhost:4000/api/developer/applications/recent?limit=5', {
  headers: {
    'Authorization': `Bearer ${token}`,
  }
});
```

**Response Example (200 OK)**:
```json
{
  "success": true,
  "message": "Recent applications retrieved successfully",
  "data": [
    {
      "id": 123,
      "jobId": 45,
      "status": "APPLIED",
      "appliedDate": "2025-10-06T10:30:00.000Z",
      "job": {
        "id": 45,
        "title": "Senior Frontend Developer",
        "companyName": "Tech Corp"
      }
    }
  ]
}
```

---

### 4. **Apply to Job API**

**Endpoint**: `POST /api/jobs/:jobId/apply`  
**Authentication**: Required (JWT) - Only DEVELOPER role  
**Description**: Submit an application to a specific job posting

**URL Parameters**:
- `jobId` (number, required): The ID of the job to apply to

**Request Body**:
```json
{
  "coverLetter": "I am excited to apply for this position because..."
}
```

**Request Example**:
```javascript
const response = await fetch('http://localhost:4000/api/jobs/45/apply', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    coverLetter: 'I am excited to apply for this position...'
  })
});
```

**Response Example (201 CREATED)**:
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "id": 123,
    "jobId": 45,
    "applicantId": 67,
    "status": "APPLIED",
    "coverLetter": "I am excited to apply...",
    "appliedDate": "2025-10-07T15:30:00.000Z",
    "job": {
      "id": 45,
      "title": "Senior Frontend Developer",
      "companyName": "Tech Corp"
    }
  }
}
```

**Error Responses**:
- 400: Invalid job ID or missing data
- 404: Job not found
- 409: Already applied to this job
- 401: Not authenticated

---

### 5. **Check Application Status API**

**Endpoint**: `GET /api/jobs/:jobId/application-status`  
**Authentication**: Required (JWT) - Only DEVELOPER role  
**Description**: Check if the developer has already applied to a specific job

**URL Parameters**:
- `jobId` (number, required): The ID of the job

**Request Example**:
```javascript
const response = await fetch('http://localhost:4000/api/jobs/45/application-status', {
  headers: {
    'Authorization': `Bearer ${token}`,
  }
});
```

**Response Example (200 OK) - Already Applied**:
```json
{
  "success": true,
  "message": "Application status retrieved",
  "data": {
    "hasApplied": true,
    "applicationId": 123,
    "status": "IN_REVIEW",
    "appliedDate": "2025-10-05T10:30:00.000Z"
  }
}
```

**Response Example (200 OK) - Not Applied**:
```json
{
  "success": true,
  "message": "Application status retrieved",
  "data": {
    "hasApplied": false
  }
}
```

---

### 6. **Withdraw Application API**

**Endpoint**: `DELETE /api/applications/:applicationId`  
**Authentication**: Required (JWT) - Only application owner (DEVELOPER)  
**Description**: Withdraw/delete a job application

**URL Parameters**:
- `applicationId` (number, required): The ID of the application to withdraw

**Request Example**:
```javascript
const response = await fetch('http://localhost:4000/api/applications/123', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
  }
});
```

**Response Example (200 OK)**:
```json
{
  "success": true,
  "message": "Application withdrawn successfully",
  "data": {
    "message": "Your application has been withdrawn"
  }
}
```

**Error Responses**:
- 404: Application not found
- 403: Not authorized (not application owner)
- 400: Cannot withdraw application (if status is ACCEPTED or REJECTED)

---

### 7. **Upload Resume API**

**Endpoint**: `POST /api/developer/resume/upload`  
**Authentication**: Required (JWT) - Only DEVELOPER role  
**Description**: Upload or update developer's resume file

**Content-Type**: `multipart/form-data`

**Request Body (FormData)**:
- `resume` (file, required): PDF file (max 5MB)

**Request Example**:
```javascript
const formData = new FormData();
formData.append('resume', fileInput.files[0]);

const response = await fetch('http://localhost:4000/api/developer/resume/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  body: formData
});
```

**Response Example (200 OK)**:
```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "data": {
    "resumeUrl": "/uploads/resumes/67_1696680000000.pdf",
    "fileName": "John_Doe_Resume.pdf",
    "fileSize": 245760,
    "uploadedAt": "2025-10-07T15:45:00.000Z"
  }
}
```

**Error Responses**:
- 400: No file uploaded or invalid file type
- 400: File size exceeds 5MB
- 413: Payload too large

**Validation Rules**:
- Accepted formats: PDF only (`.pdf`)
- Max file size: 5MB
- File naming: `{userId}_{timestamp}.pdf`

---

### 8. **Get Resume Details API**

**Endpoint**: `GET /api/developer/resume`  
**Authentication**: Required (JWT) - Only DEVELOPER role  
**Description**: Get developer's resume information

**Request Example**:
```javascript
const response = await fetch('http://localhost:4000/api/developer/resume', {
  headers: {
    'Authorization': `Bearer ${token}`,
  }
});
```

**Response Example (200 OK) - With Resume**:
```json
{
  "success": true,
  "message": "Resume details retrieved successfully",
  "data": {
    "resumeUrl": "/uploads/resumes/67_1696680000000.pdf",
    "fileName": "John_Doe_Resume.pdf",
    "fileSize": 245760,
    "uploadedAt": "2025-10-06T10:30:00.000Z"
  }
}
```

**Response Example (200 OK) - No Resume**:
```json
{
  "success": true,
  "message": "No resume found",
  "data": null
}
```

---

### 9. **Delete Resume API**

**Endpoint**: `DELETE /api/developer/resume`  
**Authentication**: Required (JWT) - Only DEVELOPER role  
**Description**: Delete developer's resume

**Request Example**:
```javascript
const response = await fetch('http://localhost:4000/api/developer/resume', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
  }
});
```

**Response Example (200 OK)**:
```json
{
  "success": true,
  "message": "Resume deleted successfully",
  "data": {
    "message": "Your resume has been deleted"
  }
}
```

---

### 10. **Update Developer Profile API**

**Endpoint**: `PATCH /api/developer/profile`  
**Authentication**: Required (JWT) - Only DEVELOPER role  
**Description**: Update developer profile information (skills, experience, social links)

**Request Body**:
```json
{
  "experience": "3 years",
  "skills": ["React", "Node.js", "TypeScript", "MongoDB"],
  "linkedinUrl": "https://linkedin.com/in/johndoe",
  "githubUrl": "https://github.com/johndoe",
  "phone": "+1234567890"
}
```

**Request Example**:
```javascript
const response = await fetch('http://localhost:4000/api/developer/profile', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    experience: '3 years',
    skills: ['React', 'Node.js', 'TypeScript'],
    linkedinUrl: 'https://linkedin.com/in/johndoe',
    githubUrl: 'https://github.com/johndoe',
    phone: '+1234567890'
  })
});
```

**Response Example (200 OK)**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 67,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "DEVELOPER",
    "experience": "3 years",
    "skills": ["React", "Node.js", "TypeScript", "MongoDB"],
    "linkedinUrl": "https://linkedin.com/in/johndoe",
    "githubUrl": "https://github.com/johndoe",
    "phone": "+1234567890",
    "resumeUrl": "/uploads/resumes/67.pdf"
  }
}
```

---

### 11. **Get Developer Profile API**

**Endpoint**: `GET /api/developer/profile`  
**Authentication**: Required (JWT) - Only DEVELOPER role  
**Description**: Get developer's complete profile information

**Request Example**:
```javascript
const response = await fetch('http://localhost:4000/api/developer/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
  }
});
```

**Response Example (200 OK)**:
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 67,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "DEVELOPER",
    "experience": "3 years",
    "skills": ["React", "Node.js", "TypeScript", "MongoDB"],
    "linkedinUrl": "https://linkedin.com/in/johndoe",
    "githubUrl": "https://github.com/johndoe",
    "phone": "+1234567890",
    "resumeUrl": "/uploads/resumes/67_1696680000000.pdf",
    "createdAt": "2025-09-01T10:00:00.000Z",
    "updatedAt": "2025-10-06T15:30:00.000Z"
  }
}
```

---

## 🔐 Authentication & Authorization

### Authentication
- All endpoints require JWT authentication via `Authorization: Bearer <token>` header
- Extract user ID and role from JWT payload

### Authorization Rules
1. **DEVELOPER role**:
   - Can view all public job listings
   - Can only apply to jobs (cannot create/edit/delete jobs)
   - Can only view/manage their own applications
   - Cannot access recruiter-specific endpoints
   - Cannot view other developers' profiles

2. **Data Access**:
   - Developers can only see their own applications
   - Developers can only withdraw their own applications
   - Developers cannot see who else applied to a job

### Middleware Recommendations
```javascript
// Example middleware structure
- authenticateToken() - Verify JWT
- requireRole(['DEVELOPER']) - Check user role
- isApplicationOwner() - Verify developer owns the application
```

---

## 📊 Database Schema Considerations

### Users Table (Additional Developer Fields)
```sql
ALTER TABLE users ADD COLUMN experience VARCHAR(100);
ALTER TABLE users ADD COLUMN skills TEXT[]; -- PostgreSQL array or JSON
ALTER TABLE users ADD COLUMN resume_url VARCHAR(500);
ALTER TABLE users ADD COLUMN linkedin_url VARCHAR(500);
ALTER TABLE users ADD COLUMN github_url VARCHAR(500);
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
```

### Applications Table (If not already exists)
```sql
CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  job_id INT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'APPLIED',
  cover_letter TEXT,
  applied_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT, -- For recruiter notes
  UNIQUE(job_id, applicant_id) -- Prevent duplicate applications
);

CREATE INDEX idx_applications_applicant_id ON applications(applicant_id);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_status ON applications(status);
```

---

## ⚠️ Important Business Rules

### 1. **Duplicate Application Prevention**
- A developer can only apply once to the same job
- Return 409 Conflict if already applied
- Use UNIQUE constraint on (job_id, applicant_id)

```sql
UNIQUE(job_id, applicant_id)
```

### 2. **Application Status Flow**
Developer sees status from recruiter:
- **APPLIED** → Initial state (just applied)
- **IN_REVIEW** → Recruiter is reviewing
- **ACCEPTED** → Recruiter accepted (interview/offer)
- **REJECTED** → Recruiter rejected

Developer can only withdraw if status is APPLIED or IN_REVIEW (not after ACCEPTED/REJECTED).

### 3. **Resume Requirements**
- **File Type**: PDF only
- **Max Size**: 5MB
- **Storage**: Store in `/uploads/resumes/` directory
- **Naming**: `{userId}_{timestamp}.pdf`
- **Old Resume**: Delete old file when uploading new one

### 4. **Profile Completeness**
Consider adding profile completion percentage:
```javascript
{
  "profileCompletion": 75, // Based on filled fields
  "missingFields": ["phone", "linkedinUrl"]
}
```

### 5. **Job Application Validation**
Before allowing application:
- Check if job still exists (not deleted)
- Check if developer hasn't already applied
- Ensure developer profile has resume uploaded (optional but recommended)

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] Apply to job successfully
- [ ] Prevent duplicate applications (409 error)
- [ ] Withdraw application successfully
- [ ] Cannot withdraw accepted/rejected applications
- [ ] Upload resume (valid PDF)
- [ ] Reject non-PDF files
- [ ] Reject files over 5MB
- [ ] Update profile with valid data
- [ ] Validate skills array format

### Integration Tests
- [ ] Developer applies to job → Recruiter sees application
- [ ] Recruiter changes status → Developer sees updated status
- [ ] Developer withdraws → Application deleted from recruiter view
- [ ] Upload resume → Resume accessible by recruiters viewing application
- [ ] Developer profile → Shows in application details

### Edge Cases
- [ ] Apply to non-existent job (404)
- [ ] Apply to already applied job (409)
- [ ] Upload resume without authentication (401)
- [ ] Access another developer's applications (403)
- [ ] Withdraw another developer's application (403)
- [ ] Upload 10MB file (413 or 400 error)
- [ ] Upload .doc file instead of PDF (400 error)

---

## 📚 API Response Format (Standard)

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "User-friendly error message",
    "code": "ERROR_CODE",
    "details": { /* optional additional info */ }
  }
}
```

### Common Error Codes
- `UNAUTHORIZED`: 401 - Not authenticated
- `FORBIDDEN`: 403 - Not authorized for this resource
- `NOT_FOUND`: 404 - Resource not found
- `CONFLICT`: 409 - Duplicate application
- `VALIDATION_ERROR`: 400 - Invalid input data
- `FILE_TOO_LARGE`: 413 - File exceeds size limit
- `INVALID_FILE_TYPE`: 400 - Wrong file format
- `INTERNAL_ERROR`: 500 - Server error

---

## 🚀 Implementation Priority

### Phase 1 (Critical - Week 1)
1. ✅ Create/update Users table with developer fields
2. ✅ Implement `POST /api/jobs/:jobId/apply` (apply to job)
3. ✅ Implement `GET /api/developer/applications` (view applications)
4. ✅ Implement `GET /api/jobs/:jobId/application-status` (check if applied)
5. ✅ Implement `DELETE /api/applications/:applicationId` (withdraw application)

### Phase 2 (Dashboard - Week 2)
6. ✅ Implement `GET /api/developer/dashboard/stats` (dashboard statistics)
7. ✅ Implement `GET /api/developer/applications/recent` (recent applications)
8. ✅ Implement `GET /api/developer/profile` (get profile)
9. ✅ Implement `PATCH /api/developer/profile` (update profile)

### Phase 3 (Resume - Week 2-3)
10. ✅ Implement `POST /api/developer/resume/upload` (file upload)
11. ✅ Implement `GET /api/developer/resume` (get resume details)
12. ✅ Implement `DELETE /api/developer/resume` (delete resume)
13. ✅ Set up file storage for resumes
14. ✅ Add file validation middleware

---

## 💡 Additional Recommendations

### 1. **Email Notifications** (Optional Enhancement)
Send emails when:
- Developer applies to job → Notify recruiter
- Application status changes → Notify developer
- New matching job posted → Notify relevant developers

### 2. **Application Notes** (Optional)
Allow developers to add private notes to their applications:
```json
{
  "privateNotes": "Follow up next week"
}
```

### 3. **Save Jobs for Later** (Optional)
Implement bookmarking/saving jobs:
```
POST /api/jobs/:jobId/save
GET /api/developer/saved-jobs
DELETE /api/jobs/:jobId/unsave
```

### 4. **Application History** (Optional)
Track all status changes with timestamps:
```json
{
  "statusHistory": [
    { "status": "APPLIED", "date": "2025-10-05T10:00:00Z" },
    { "status": "IN_REVIEW", "date": "2025-10-06T14:30:00Z" }
  ]
}
```

### 5. **Job Recommendations** (Future Enhancement)
ML-based job recommendations based on:
- Developer skills
- Previous applications
- Profile completeness

---

## 📞 File Upload Implementation Details

### Multer Configuration (Node.js/Express)
```javascript
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/resumes/');
  },
  filename: (req, file, cb) => {
    const userId = req.user.id;
    const timestamp = Date.now();
    cb(null, `${userId}_${timestamp}.pdf`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Route
router.post('/developer/resume/upload', authenticateToken, upload.single('resume'), uploadResume);
```

---

## 🎯 Success Metrics

Developer Dashboard is complete when:
- ✅ Developers can browse all jobs
- ✅ Developers can apply to jobs
- ✅ Developers can view their applications
- ✅ Developers can track application status
- ✅ Developers can upload/manage resume
- ✅ Developers can update profile
- ✅ Dashboard shows accurate statistics
- ✅ Duplicate applications prevented
- ✅ Resume files stored securely
- ✅ All error cases handled

---

**Generated for**: DevHire Backend API Development (Developer Dashboard)  
**Frontend Framework**: React 19.1.1 with React Router 7.9.3  
**Backend Expected**: Node.js/Express with PostgreSQL  
**Date**: October 2025  
**Priority**: High - Required for MVP
