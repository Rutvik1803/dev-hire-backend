# Application & Recruiter Dashboard API Documentation

This document provides comprehensive details about all the application and recruiter dashboard APIs implemented for the DevHire platform.

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## 📋 Table of Contents

1. [Developer Application APIs](#developer-application-apis)
2. [Recruiter Application Management APIs](#recruiter-application-management-apis)
3. [Recruiter Dashboard APIs](#recruiter-dashboard-apis)
4. [Job Management APIs](#job-management-apis)

---

## Developer Application APIs

### 1. Apply to a Job

**Endpoint**: `POST /api/jobs/:jobId/apply`

**Authentication**: Required (JWT) - Only DEVELOPER role

**Description**: Submit an application for a specific job posting

**URL Parameters**:
- `jobId` (number, required): The ID of the job to apply to

**Request Body**:
```json
{
  "coverLetter": "I am very interested in this position because..."
}
```

**Success Response** (201 Created):
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "id": 1,
    "jobId": 45,
    "applicantId": 67,
    "status": "APPLIED",
    "coverLetter": "I am very interested in...",
    "appliedDate": "2025-01-15T10:30:00Z",
    "updatedDate": "2025-01-15T10:30:00Z",
    "job": {
      "id": 45,
      "title": "Senior Frontend Developer",
      "companyName": "Tech Corp",
      "location": "San Francisco, CA",
      "recruiter": {
        "id": 10,
        "name": "Jane Smith",
        "email": "jane@techcorp.com"
      }
    },
    "applicant": {
      "id": 67,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "experience": "3 years",
      "skills": ["React", "Node.js"],
      "resumeUrl": "/uploads/resumes/67.pdf",
      "linkedinUrl": "https://linkedin.com/in/johndoe",
      "githubUrl": "https://github.com/johndoe",
      "phone": "+1234567890"
    }
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid job ID or user not authenticated
- `403 Forbidden`: Only developers can apply to jobs
- `404 Not Found`: Job not found
- `409 Conflict`: Already applied to this job

**Example cURL**:
```bash
curl -X POST http://localhost:3000/api/jobs/45/apply \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"coverLetter": "I am very interested..."}'
```

---

## Recruiter Application Management APIs

### 2. Get All Applications for a Specific Job

**Endpoint**: `GET /api/jobs/:jobId/applications`

**Authentication**: Required (JWT) - Only job owner (RECRUITER)

**Description**: Get all applications submitted for a specific job posting

**URL Parameters**:
- `jobId` (number, required): The ID of the job

**Query Parameters**:
- `status` (optional): Filter by application status (`APPLIED`, `IN_REVIEW`, `ACCEPTED`, `REJECTED`)
- `sort` (optional): Sort by applied date (`asc`, `desc`) - default: `desc`

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Applications retrieved successfully",
  "data": {
    "data": [
      {
        "id": 123,
        "jobId": 45,
        "applicantId": 67,
        "status": "IN_REVIEW",
        "coverLetter": "I am very interested...",
        "appliedDate": "2025-01-15T10:30:00Z",
        "updatedDate": "2025-01-20T14:45:00Z",
        "applicant": {
          "id": 67,
          "name": "John Doe",
          "email": "john.doe@example.com",
          "experience": "3 years",
          "skills": ["React", "Node.js", "MongoDB"],
          "resumeUrl": "/uploads/resumes/67.pdf",
          "linkedinUrl": "https://linkedin.com/in/johndoe",
          "githubUrl": "https://github.com/johndoe",
          "phone": "+1234567890"
        }
      }
    ],
    "count": 15
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid job ID or status
- `403 Forbidden`: Not authorized (not job owner)
- `404 Not Found`: Job not found

**Example cURL**:
```bash
# Get all applications
curl http://localhost:3000/api/jobs/45/applications \
  -H "Authorization: Bearer <token>"

# Filter by status
curl "http://localhost:3000/api/jobs/45/applications?status=IN_REVIEW&sort=asc" \
  -H "Authorization: Bearer <token>"
```

---

### 3. Get All Applications Across All Jobs

**Endpoint**: `GET /api/recruiter/applications`

**Authentication**: Required (JWT) - Only RECRUITER role

**Description**: Get all applications across all jobs posted by the authenticated recruiter

**Query Parameters**:
- `status` (optional): Filter by application status
- `limit` (optional): Limit results (default: 50)
- `offset` (optional): Pagination offset (default: 0)
- `recent` (optional): If `true`, return only applications from last 30 days

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Applications retrieved successfully",
  "data": {
    "data": [
      {
        "id": 123,
        "jobId": 45,
        "applicantId": 67,
        "status": "APPLIED",
        "appliedDate": "2025-01-15T10:30:00Z",
        "updatedDate": "2025-01-15T10:30:00Z",
        "applicant": {
          "id": 67,
          "name": "John Doe",
          "email": "john.doe@example.com",
          "experience": "3 years",
          "skills": ["React", "Node.js"]
        },
        "job": {
          "id": 45,
          "title": "Senior Frontend Developer",
          "companyName": "Tech Corp"
        }
      }
    ],
    "total": 48,
    "limit": 50,
    "offset": 0
  }
}
```

**Example cURL**:
```bash
# Get all applications
curl http://localhost:3000/api/recruiter/applications \
  -H "Authorization: Bearer <token>"

# With filters and pagination
curl "http://localhost:3000/api/recruiter/applications?status=APPLIED&limit=20&offset=0&recent=true" \
  -H "Authorization: Bearer <token>"
```

---

### 4. Get Single Application Details

**Endpoint**: `GET /api/applications/:applicationId`

**Authentication**: Required (JWT) - Only job owner (RECRUITER) or applicant (DEVELOPER)

**Description**: Get detailed information about a specific application

**URL Parameters**:
- `applicationId` (number, required): The ID of the application

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Application retrieved successfully",
  "data": {
    "id": 123,
    "jobId": 45,
    "applicantId": 67,
    "status": "IN_REVIEW",
    "coverLetter": "I am excited to apply...",
    "notes": "Candidate looks promising, scheduling interview",
    "appliedDate": "2025-01-15T10:30:00Z",
    "updatedDate": "2025-01-20T14:45:00Z",
    "applicant": {
      "id": 67,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "experience": "3 years",
      "skills": ["React", "Node.js", "MongoDB", "TypeScript"],
      "resumeUrl": "/uploads/resumes/67.pdf",
      "linkedinUrl": "https://linkedin.com/in/johndoe",
      "githubUrl": "https://github.com/johndoe"
    },
    "job": {
      "id": 45,
      "title": "Senior Frontend Developer",
      "companyName": "Tech Corp",
      "location": "San Francisco, CA",
      "jobType": "FULL_TIME",
      "salaryRange": "$120k - $160k",
      "requiredSkills": ["React", "TypeScript", "Node.js"],
      "description": "We are looking for...",
      "recruiter": {
        "id": 10,
        "name": "Jane Smith",
        "email": "jane@techcorp.com"
      }
    }
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid application ID
- `403 Forbidden`: Not authorized
- `404 Not Found`: Application not found

**Example cURL**:
```bash
curl http://localhost:3000/api/applications/123 \
  -H "Authorization: Bearer <token>"
```

---

### 5. Update Application Status

**Endpoint**: `PATCH /api/applications/:applicationId/status`

**Authentication**: Required (JWT) - Only job owner (RECRUITER)

**Description**: Update the status of an application

**URL Parameters**:
- `applicationId` (number, required): The ID of the application

**Request Body**:
```json
{
  "status": "IN_REVIEW",
  "note": "Candidate looks promising, scheduling interview"
}
```

**Valid Status Values**:
- `APPLIED`
- `IN_REVIEW`
- `ACCEPTED`
- `REJECTED`

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Application status updated successfully",
  "data": {
    "id": 123,
    "status": "IN_REVIEW",
    "updatedDate": "2025-01-20T14:45:00Z"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid status value or missing status
- `403 Forbidden`: Not authorized (not job owner)
- `404 Not Found`: Application not found

**Example cURL**:
```bash
curl -X PATCH http://localhost:3000/api/applications/123/status \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"status": "IN_REVIEW", "note": "Looks promising"}'
```

---

## Recruiter Dashboard APIs

### 6. Get Dashboard Statistics

**Endpoint**: `GET /api/recruiter/dashboard/stats`

**Authentication**: Required (JWT) - Only RECRUITER role

**Description**: Get aggregated statistics for the recruiter's dashboard

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "jobsPosted": 12,
    "totalApplicants": 48,
    "inReview": 15,
    "hired": 8,
    "recentActivity": {
      "newApplicationsToday": 5,
      "newApplicationsThisWeek": 18
    }
  }
}
```

**Data Description**:
- `jobsPosted`: Total number of jobs posted by the recruiter
- `totalApplicants`: Total number of applications across all jobs
- `inReview`: Number of applications with status "IN_REVIEW"
- `hired`: Number of applications with status "ACCEPTED"
- `recentActivity.newApplicationsToday`: Applications received today
- `recentActivity.newApplicationsThisWeek`: Applications received in the last 7 days

**Example cURL**:
```bash
curl http://localhost:3000/api/recruiter/dashboard/stats \
  -H "Authorization: Bearer <token>"
```

---

### 7. Get Recent Applications

**Endpoint**: `GET /api/recruiter/applications/recent`

**Authentication**: Required (JWT) - Only RECRUITER role

**Description**: Get recent applications for dashboard display (last 7 days, max configurable limit)

**Query Parameters**:
- `limit` (optional): Number of results (default: 10, max: 20)

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Recent applications retrieved successfully",
  "data": [
    {
      "id": 123,
      "jobId": 45,
      "applicantId": 67,
      "status": "APPLIED",
      "appliedDate": "2025-01-20T10:30:00Z",
      "updatedDate": "2025-01-20T10:30:00Z",
      "applicant": {
        "id": 67,
        "name": "John Doe",
        "email": "john.doe@example.com"
      },
      "job": {
        "id": 45,
        "title": "Senior Frontend Developer"
      }
    }
  ]
}
```

**Error Responses**:
- `400 Bad Request`: Invalid limit (max 20)

**Example cURL**:
```bash
curl "http://localhost:3000/api/recruiter/applications/recent?limit=10" \
  -H "Authorization: Bearer <token>"
```

---

## Job Management APIs

### 8. Update Job Posting

**Endpoint**: `PUT /api/jobs/:id`

**Authentication**: Required (JWT) - Only job owner (RECRUITER)

**Description**: Update an existing job posting

**URL Parameters**:
- `id` (number, required): The ID of the job to update

**Request Body** (all fields optional):
```json
{
  "title": "Senior Full Stack Developer",
  "companyName": "Tech Corp",
  "location": "San Francisco, CA",
  "jobType": "FULL_TIME",
  "salaryRange": "$120k - $160k",
  "requiredSkills": ["React", "Node.js", "PostgreSQL"],
  "description": "We are looking for an experienced full stack developer..."
}
```

**Valid Job Types**:
- `FULL_TIME`
- `PART_TIME`
- `CONTRACT`
- `INTERNSHIP`

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Job updated successfully",
  "data": {
    "id": 45,
    "title": "Senior Full Stack Developer",
    "companyName": "Tech Corp",
    "location": "San Francisco, CA",
    "jobType": "FULL_TIME",
    "salaryRange": "$120k - $160k",
    "requiredSkills": ["React", "Node.js", "PostgreSQL"],
    "description": "We are looking for...",
    "recruiterId": 10,
    "createdAt": "2025-01-10T09:00:00Z",
    "updatedAt": "2025-01-20T15:00:00Z",
    "recruiter": {
      "id": 10,
      "name": "Jane Smith",
      "email": "jane@techcorp.com",
      "role": "RECRUITER"
    }
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid job ID, invalid job type, or validation error
- `403 Forbidden`: Not authorized (not job owner)
- `404 Not Found`: Job not found

**Example cURL**:
```bash
curl -X PUT http://localhost:3000/api/jobs/45 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Full Stack Developer",
    "salaryRange": "$130k - $170k",
    "requiredSkills": ["React", "Node.js", "PostgreSQL", "AWS"]
  }'
```

---

### 9. Delete Job Posting

**Endpoint**: `DELETE /api/jobs/:id`

**Authentication**: Required (JWT) - Only job owner (RECRUITER)

**Description**: Delete a job posting (will cascade delete all applications)

**URL Parameters**:
- `id` (number, required): The ID of the job to delete

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Job deleted successfully",
  "data": {
    "message": "Job deleted successfully"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Invalid job ID or not authorized
- `404 Not Found`: Job not found

**Example cURL**:
```bash
curl -X DELETE http://localhost:3000/api/jobs/45 \
  -H "Authorization: Bearer <token>"
```

---

## Error Response Format

All API errors follow this standard format:

```json
{
  "success": false,
  "error": {
    "message": "User-friendly error message",
    "status": 400
  }
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Not authorized to access this resource
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict (e.g., duplicate application)
- `500 Internal Server Error`: Server error

---

## Application Status Flow

The application status follows this typical flow:

```
APPLIED → IN_REVIEW → ACCEPTED/REJECTED
```

However, recruiters can change status to any valid value at any time.

---

## Database Schema Reference

### Application Model

```prisma
model Application {
  id           Int               @id @default(autoincrement())
  jobId        Int
  applicantId  Int
  status       ApplicationStatus @default(APPLIED)
  coverLetter  String?           @db.Text
  notes        String?           @db.Text
  appliedDate  DateTime          @default(now())
  updatedDate  DateTime          @updatedAt
  
  job          Job               @relation(fields: [jobId], references: [id], onDelete: Cascade)
  applicant    User              @relation(fields: [applicantId], references: [id], onDelete: Cascade)
  
  @@unique([jobId, applicantId])
  @@index([jobId])
  @@index([applicantId])
  @@index([status])
}

enum ApplicationStatus {
  APPLIED
  IN_REVIEW
  ACCEPTED
  REJECTED
}
```

### User Model (Extended)

```prisma
model User {
  id           Int            @id @default(autoincrement())
  email        String         @unique
  password     String
  name         String
  role         Role           @default(DEVELOPER)
  
  // Developer profile fields
  experience   String?
  skills       String[]       @default([])
  resumeUrl    String?
  linkedinUrl  String?
  githubUrl    String?
  phone        String?
  
  // Relations
  applications Application[]
  jobs         Job[]
}
```

---

## Implementation Notes

### Business Rules

1. **Duplicate Applications**: A developer can only apply once to the same job
   - Returns 409 Conflict if already applied

2. **Authorization**: 
   - Only recruiters can view/manage applications for their jobs
   - Developers can only view their own applications
   - Job owners are verified before any update operation

3. **Cascade Deletion**: 
   - Deleting a job will automatically delete all associated applications
   - This is handled by the database (onDelete: Cascade)

4. **Dashboard Stats**: 
   - Stats are calculated in real-time
   - Consider implementing caching for production (5-10 minute cache)

### Security Considerations

- All endpoints are protected with JWT authentication
- Role-based authorization ensures users can only access their own data
- Ownership verification on all update/delete operations
- Input validation on all request bodies

---

## Frontend Integration Tips

### Authentication
Always include the JWT token in requests:
```javascript
const response = await fetch('http://localhost:3000/api/recruiter/dashboard/stats', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Error Handling
```javascript
const response = await fetch(url, options);
const data = await response.json();

if (!data.success) {
  console.error(data.error.message);
  // Handle error
}
```

### Pagination Example
```javascript
// Get paginated applications
const limit = 20;
const offset = 0;
const response = await fetch(
  `http://localhost:3000/api/recruiter/applications?limit=${limit}&offset=${offset}`,
  { headers: { 'Authorization': `Bearer ${token}` } }
);
```

---

## Testing

### Postman Collection
Import the collection from `POSTMAN_GUIDE.md` for easy testing of all endpoints.

### Test Scenarios

1. **Developer Flow**:
   - Login as developer
   - Browse jobs
   - Apply to job
   - View application status

2. **Recruiter Flow**:
   - Login as recruiter
   - Create job posting
   - View dashboard stats
   - Review applications
   - Update application status
   - Update job posting

---

## Support

For questions or issues, refer to:
- Main API Documentation: `API_DOCUMENTATION.md`
- Job API Documentation: `JOB_API_DOCUMENTATION.md`
- Backend Prompt: `BACKEND_API_PROMPT.md`

---

**Last Updated**: October 7, 2025  
**Version**: 1.0.0
