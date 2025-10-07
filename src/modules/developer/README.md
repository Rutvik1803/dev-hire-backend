# Developer Module

## Overview
This module handles all developer-related functionality including dashboard statistics, application management, profile management, and resume handling.

## Features

### 1. Dashboard Statistics
- Count of applied jobs
- Applications in review
- Interview invitations
- Offers received
- Recent activity tracking (responses in last 7 days)

### 2. Application Management
- View all applications with filters (status, pagination)
- View recent applications (last 30 days)
- Check if already applied to a job
- Withdraw applications (with validation)

### 3. Profile Management
- Get developer profile
- Update profile fields:
  - Years of experience
  - Skills array
  - LinkedIn URL
  - GitHub URL
  - Phone number

### 4. Resume Management
- Upload resume (PDF, DOC, DOCX)
- Get resume details
- Delete resume
- Automatic file cleanup

## Files

- **developer.service.ts** - Business logic for all developer operations
- **developer.controller.ts** - HTTP request handlers
- **developer.route.ts** - Route definitions with middleware
- **README.md** - This file

## API Endpoints

### Dashboard
- `GET /api/developer/dashboard/stats` - Get dashboard statistics

### Applications
- `GET /api/developer/applications` - Get all applications (with filters)
- `GET /api/developer/applications/recent` - Get recent applications
- `GET /api/jobs/:jobId/application-status` - Check application status
- `DELETE /api/applications/:applicationId` - Withdraw application

### Profile
- `GET /api/developer/profile` - Get profile
- `PATCH /api/developer/profile` - Update profile

### Resume
- `POST /api/developer/resume/upload` - Upload resume
- `GET /api/developer/resume` - Get resume details
- `DELETE /api/developer/resume` - Delete resume

## Authentication & Authorization
All endpoints require:
1. Valid JWT access token
2. User role: DEVELOPER

## Dependencies
- Multer - File upload handling
- Prisma - Database operations
- Express - HTTP server

## Usage Example

```typescript
// Get dashboard stats
const stats = await getDeveloperDashboardStats(developerId);

// Get applications with filters
const applications = await getDeveloperApplications(developerId, {
  status: 'APPLIED',
  limit: 20,
  offset: 0,
  sort: 'desc'
});

// Upload resume
const result = await updateResumeUrl(
  developerId,
  '/uploads/resumes/resume.pdf',
  'resume.pdf',
  245678
);
```

## Error Handling
All service functions throw appropriate errors:
- `NotFoundError` - Resource not found
- `BadRequestError` - Invalid input
- `ForbiddenError` - Permission denied
- `ConflictError` - Business rule violation

## Validation Rules

### Profile Update
- Experience: Positive number
- Skills: Array of strings
- URLs: Valid URL format
- Phone: String (no format enforced)

### Resume Upload
- File types: PDF, DOC, DOCX only
- Max size: 5MB
- Previous resume is replaced

### Application Withdrawal
- Must own the application
- Cannot withdraw if status is ACCEPTED or REJECTED

## Database Schema

### User (Developer fields)
```prisma
model User {
  experience  Int?
  skills      String[]
  resumeUrl   String?
  linkedinUrl String?
  githubUrl   String?
  phone       String?
}
```

### Application
```prisma
model Application {
  id          Int
  jobId       Int
  applicantId Int
  status      ApplicationStatus
  coverLetter String?
  appliedDate DateTime
  updatedDate DateTime
}
```

## Testing
See `DEVELOPER_API_IMPLEMENTATION_COMPLETE.md` for API testing guide.

## Related Documentation
- `DEVELOPER_API_IMPLEMENTATION_COMPLETE.md` - Complete API documentation
- `FRONTEND_DEVELOPER_DASHBOARD_PROMPT.md` - Frontend integration guide
