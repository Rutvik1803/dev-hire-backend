# Postman Testing Guide for Application APIs

This guide helps you test all the newly implemented Application and Recruiter Dashboard APIs using Postman.

---

## 🚀 Quick Start

### Prerequisites
1. Backend server running on `http://localhost:4000`
2. Postman installed
3. At least one Developer and one Recruiter account created

---

## 📋 Environment Setup in Postman

### Create Environment Variables

1. Create a new environment called "DevHire Local"
2. Add the following variables:

| Variable | Initial Value | Current Value |
|----------|---------------|---------------|
| `baseUrl` | `http://localhost:4000/api` | (leave empty) |
| `developerToken` | (leave empty) | (will be set after login) |
| `recruiterToken` | (leave empty) | (will be set after login) |
| `jobId` | (leave empty) | (will be set after job creation) |
| `applicationId` | (leave empty) | (will be set after application) |

---

## 🔐 Authentication Setup

### 1. Register Developer Account

**POST** `{{baseUrl}}/auth/register`

Body (JSON):
```json
{
  "email": "developer@test.com",
  "password": "password123",
  "name": "John Developer",
  "role": "DEVELOPER"
}
```

**Tests Script** (add in Tests tab):
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("developerToken", response.data.accessToken);
    console.log("Developer token set");
}
```

---

### 2. Register Recruiter Account

**POST** `{{baseUrl}}/auth/register`

Body (JSON):
```json
{
  "email": "recruiter@test.com",
  "password": "password123",
  "name": "Jane Recruiter",
  "role": "RECRUITER"
}
```

**Tests Script**:
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("recruiterToken", response.data.accessToken);
    console.log("Recruiter token set");
}
```

---

### 3. Login Developer (if already registered)

**POST** `{{baseUrl}}/auth/login`

Body (JSON):
```json
{
  "email": "developer@test.com",
  "password": "password123"
}
```

**Tests Script**:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("developerToken", response.data.accessToken);
}
```

---

### 4. Login Recruiter (if already registered)

**POST** `{{baseUrl}}/auth/login`

Body (JSON):
```json
{
  "email": "recruiter@test.com",
  "password": "password123"
}
```

**Tests Script**:
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("recruiterToken", response.data.accessToken);
}
```

---

## 💼 Job Creation (Recruiter)

### 5. Create a Job Posting

**POST** `{{baseUrl}}/jobs`

**Headers**:
```
Authorization: Bearer {{recruiterToken}}
Content-Type: application/json
```

**Body (JSON)**:
```json
{
  "title": "Senior Frontend Developer",
  "companyName": "Tech Corp",
  "location": "San Francisco, CA",
  "jobType": "FULL_TIME",
  "salaryRange": "$120k - $160k",
  "requiredSkills": ["React", "TypeScript", "Node.js", "MongoDB"],
  "description": "We are looking for an experienced frontend developer to join our growing team."
}
```

**Tests Script**:
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("jobId", response.data.id);
    console.log("Job ID set to:", response.data.id);
}
```

---

## 👨‍💻 Developer Application APIs

### 6. Apply to a Job

**POST** `{{baseUrl}}/jobs/{{jobId}}/apply`

**Headers**:
```
Authorization: Bearer {{developerToken}}
Content-Type: application/json
```

**Body (JSON)**:
```json
{
  "coverLetter": "I am very excited to apply for this position. I have 5 years of experience with React and TypeScript, and I believe I would be a great fit for your team."
}
```

**Tests Script**:
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("applicationId", response.data.id);
    console.log("Application ID set to:", response.data.id);
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "id": 1,
    "jobId": 1,
    "applicantId": 1,
    "status": "APPLIED",
    "coverLetter": "I am very excited...",
    "appliedDate": "2025-01-15T10:30:00Z"
  }
}
```

---

### 7. Try Applying Again (Should Fail)

**POST** `{{baseUrl}}/jobs/{{jobId}}/apply`

**Headers**:
```
Authorization: Bearer {{developerToken}}
Content-Type: application/json
```

**Body (JSON)**:
```json
{
  "coverLetter": "Another application"
}
```

**Expected Response** (409 Conflict):
```json
{
  "success": false,
  "error": {
    "message": "You have already applied to this job",
    "status": 409
  }
}
```

---

### 8. View My Application (Developer)

**GET** `{{baseUrl}}/applications/{{applicationId}}`

**Headers**:
```
Authorization: Bearer {{developerToken}}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Application retrieved successfully",
  "data": {
    "id": 1,
    "jobId": 1,
    "status": "APPLIED",
    "coverLetter": "I am very excited...",
    "applicant": { /* developer details */ },
    "job": { /* job details */ }
  }
}
```

---

## 👔 Recruiter Dashboard APIs

### 9. Get Dashboard Statistics

**GET** `{{baseUrl}}/recruiter/dashboard/stats`

**Headers**:
```
Authorization: Bearer {{recruiterToken}}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "jobsPosted": 1,
    "totalApplicants": 1,
    "inReview": 0,
    "hired": 0,
    "recentActivity": {
      "newApplicationsToday": 1,
      "newApplicationsThisWeek": 1
    }
  }
}
```

---

### 10. Get Recent Applications

**GET** `{{baseUrl}}/recruiter/applications/recent?limit=10`

**Headers**:
```
Authorization: Bearer {{recruiterToken}}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Recent applications retrieved successfully",
  "data": [
    {
      "id": 1,
      "status": "APPLIED",
      "appliedDate": "2025-01-15T10:30:00Z",
      "applicant": {
        "id": 1,
        "name": "John Developer",
        "email": "developer@test.com"
      },
      "job": {
        "id": 1,
        "title": "Senior Frontend Developer"
      }
    }
  ]
}
```

---

### 11. Get All Applications for a Specific Job

**GET** `{{baseUrl}}/jobs/{{jobId}}/applications`

**Headers**:
```
Authorization: Bearer {{recruiterToken}}
```

**Query Parameters** (optional):
- `status`: APPLIED | IN_REVIEW | ACCEPTED | REJECTED
- `sort`: asc | desc

**Example with filters**:
```
{{baseUrl}}/jobs/{{jobId}}/applications?status=APPLIED&sort=desc
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Applications retrieved successfully",
  "data": {
    "data": [
      {
        "id": 1,
        "status": "APPLIED",
        "coverLetter": "I am very excited...",
        "appliedDate": "2025-01-15T10:30:00Z",
        "applicant": {
          "id": 1,
          "name": "John Developer",
          "email": "developer@test.com",
          "experience": null,
          "skills": [],
          "resumeUrl": null
        }
      }
    ],
    "count": 1
  }
}
```

---

### 12. Get All Applications (All Jobs)

**GET** `{{baseUrl}}/recruiter/applications`

**Headers**:
```
Authorization: Bearer {{recruiterToken}}
```

**Query Parameters** (optional):
- `status`: APPLIED | IN_REVIEW | ACCEPTED | REJECTED
- `limit`: number (default: 50)
- `offset`: number (default: 0)
- `recent`: true | false

**Example**:
```
{{baseUrl}}/recruiter/applications?status=APPLIED&limit=20&offset=0
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Applications retrieved successfully",
  "data": {
    "data": [
      {
        "id": 1,
        "status": "APPLIED",
        "appliedDate": "2025-01-15T10:30:00Z",
        "applicant": { /* developer info */ },
        "job": { /* job info */ }
      }
    ],
    "total": 1,
    "limit": 50,
    "offset": 0
  }
}
```

---

### 13. View Application Details (Recruiter)

**GET** `{{baseUrl}}/applications/{{applicationId}}`

**Headers**:
```
Authorization: Bearer {{recruiterToken}}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Application retrieved successfully",
  "data": {
    "id": 1,
    "jobId": 1,
    "applicantId": 1,
    "status": "APPLIED",
    "coverLetter": "I am very excited...",
    "notes": null,
    "appliedDate": "2025-01-15T10:30:00Z",
    "updatedDate": "2025-01-15T10:30:00Z",
    "applicant": {
      "id": 1,
      "name": "John Developer",
      "email": "developer@test.com",
      "phone": null,
      "experience": null,
      "skills": [],
      "resumeUrl": null,
      "linkedinUrl": null,
      "githubUrl": null
    },
    "job": {
      "id": 1,
      "title": "Senior Frontend Developer",
      "companyName": "Tech Corp",
      "location": "San Francisco, CA",
      "jobType": "FULL_TIME",
      "salaryRange": "$120k - $160k",
      "requiredSkills": ["React", "TypeScript", "Node.js", "MongoDB"],
      "description": "We are looking for...",
      "recruiter": {
        "id": 2,
        "name": "Jane Recruiter",
        "email": "recruiter@test.com"
      }
    }
  }
}
```

---

### 14. Update Application Status

**PATCH** `{{baseUrl}}/applications/{{applicationId}}/status`

**Headers**:
```
Authorization: Bearer {{recruiterToken}}
Content-Type: application/json
```

**Body (JSON)**:
```json
{
  "status": "IN_REVIEW",
  "note": "Candidate looks promising. Scheduling interview for next week."
}
```

**Valid Status Values**:
- `APPLIED`
- `IN_REVIEW`
- `ACCEPTED`
- `REJECTED`

**Expected Response**:
```json
{
  "success": true,
  "message": "Application status updated successfully",
  "data": {
    "id": 1,
    "status": "IN_REVIEW",
    "updatedDate": "2025-01-20T14:45:00Z"
  }
}
```

---

### 15. Update Status to Accepted

**PATCH** `{{baseUrl}}/applications/{{applicationId}}/status`

**Headers**:
```
Authorization: Bearer {{recruiterToken}}
Content-Type: application/json
```

**Body (JSON)**:
```json
{
  "status": "ACCEPTED",
  "note": "Congratulations! We would like to offer you the position."
}
```

---

### 16. Update Status to Rejected

**PATCH** `{{baseUrl}}/applications/{{applicationId}}/status`

**Headers**:
```
Authorization: Bearer {{recruiterToken}}
Content-Type: application/json
```

**Body (JSON)**:
```json
{
  "status": "REJECTED",
  "note": "Thank you for applying. We decided to move forward with other candidates."
}
```

---

## 🔨 Job Management APIs

### 17. Update Job Posting

**PUT** `{{baseUrl}}/jobs/{{jobId}}`

**Headers**:
```
Authorization: Bearer {{recruiterToken}}
Content-Type: application/json
```

**Body (JSON)** (all fields optional):
```json
{
  "title": "Senior Full Stack Developer",
  "salaryRange": "$130k - $180k",
  "requiredSkills": ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS"],
  "description": "Updated job description with more details about the role."
}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Job updated successfully",
  "data": {
    "id": 1,
    "title": "Senior Full Stack Developer",
    "salaryRange": "$130k - $180k",
    "updatedAt": "2025-01-20T15:00:00Z"
    /* ...other job fields */
  }
}
```

---

### 18. Delete Job Posting

**DELETE** `{{baseUrl}}/jobs/{{jobId}}`

**Headers**:
```
Authorization: Bearer {{recruiterToken}}
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Job deleted successfully",
  "data": {
    "message": "Job deleted successfully"
  }
}
```

**Note**: This will also delete all associated applications (cascade delete).

---

## ❌ Authorization Tests

### 19. Developer Tries to Access Recruiter Endpoint (Should Fail)

**GET** `{{baseUrl}}/recruiter/dashboard/stats`

**Headers**:
```
Authorization: Bearer {{developerToken}}
```

**Expected Response** (403 Forbidden):
```json
{
  "success": false,
  "error": {
    "message": "You do not have permission to perform this action",
    "status": 403
  }
}
```

---

### 20. Recruiter Tries to Apply to Job (Should Fail)

**POST** `{{baseUrl}}/jobs/{{jobId}}/apply`

**Headers**:
```
Authorization: Bearer {{recruiterToken}}
Content-Type: application/json
```

**Body**:
```json
{
  "coverLetter": "I want to apply"
}
```

**Expected Response** (403 Forbidden):
```json
{
  "success": false,
  "error": {
    "message": "Only developers can apply to jobs",
    "status": 403
  }
}
```

---

### 21. No Authentication (Should Fail)

**GET** `{{baseUrl}}/recruiter/dashboard/stats`

**Headers**: (No Authorization header)

**Expected Response** (401 Unauthorized):
```json
{
  "success": false,
  "error": {
    "message": "Access token required",
    "status": 401
  }
}
```

---

## 📊 Complete Testing Flow

### Recommended Test Sequence

1. **Setup Phase**:
   - Register Developer
   - Register Recruiter
   - Verify tokens are saved

2. **Job Creation**:
   - Create job as Recruiter
   - Verify job ID is saved

3. **Application Flow**:
   - Apply to job as Developer
   - Verify application ID is saved
   - Try applying again (should fail)

4. **Dashboard Verification**:
   - Check dashboard stats (should show 1 job, 1 applicant)
   - Check recent applications (should show 1 application)

5. **Application Management**:
   - View job applications as Recruiter
   - View application details
   - Update status to IN_REVIEW
   - Update status to ACCEPTED

6. **Job Management**:
   - Update job details
   - Verify changes
   - Delete job
   - Verify applications are also deleted

7. **Authorization Tests**:
   - Test developer accessing recruiter endpoints
   - Test recruiter accessing developer actions
   - Test without authentication

---

## 🔍 Common Response Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Not authorized for resource |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate application |
| 500 | Server Error | Internal error |

---

## 💡 Tips

1. **Save Responses**: Click "Save Response" in Postman to compare later
2. **Use Tests Tab**: Add test scripts to auto-extract IDs and tokens
3. **Create Collections**: Organize requests into folders
4. **Use Pre-request Scripts**: Auto-refresh tokens if needed
5. **Share Collections**: Export and share with team

---

## 🎯 Quick Test Checklist

- [ ] Register Developer account
- [ ] Register Recruiter account
- [ ] Create job as Recruiter
- [ ] Apply to job as Developer
- [ ] View dashboard stats
- [ ] View recent applications
- [ ] View job applications
- [ ] View application details (both roles)
- [ ] Update application status
- [ ] Update job posting
- [ ] Test duplicate application (should fail)
- [ ] Test wrong role access (should fail)
- [ ] Test no auth access (should fail)
- [ ] Delete job

---

## 📚 Additional Resources

- **Full API Documentation**: `APPLICATION_API_DOCUMENTATION.md`
- **Frontend Integration**: `FRONTEND_INTEGRATION_QUICKSTART.md`
- **Implementation Summary**: `API_IMPLEMENTATION_SUMMARY.md`

---

**Last Updated**: October 7, 2025  
**Server URL**: `http://localhost:4000/api`
