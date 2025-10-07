# Application Module README

## Overview

The Application module handles all job application functionality in the DevHire platform, including application submission, status management, and recruiter dashboard features.

---

## 📁 Module Structure

```
src/modules/application/
├── application.service.ts      # Business logic layer
├── application.controller.ts   # Request/response handling
└── application.route.ts        # Route definitions
```

---

## 🎯 Features

### For Developers
- ✅ Apply to job postings
- ✅ View own application details
- ✅ Prevent duplicate applications
- ✅ Submit cover letters

### For Recruiters
- ✅ View all applications for specific jobs
- ✅ View all applications across all jobs
- ✅ Dashboard statistics and analytics
- ✅ Update application status
- ✅ Add notes to applications
- ✅ Filter and sort applications
- ✅ View recent applications

---

## 🗄️ Database Schema

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

### Key Constraints
- **Unique Constraint**: `[jobId, applicantId]` - Prevents duplicate applications
- **Indexes**: Optimized queries on `jobId`, `applicantId`, and `status`
- **Cascade Delete**: Deleting a job automatically deletes all applications

---

## 📡 API Endpoints

### Developer Endpoints

#### Apply to Job
```http
POST /api/jobs/:jobId/apply
Authorization: Bearer <developer_token>
Content-Type: application/json

{
  "coverLetter": "Optional cover letter text"
}
```

#### View My Application
```http
GET /api/applications/:applicationId
Authorization: Bearer <developer_token>
```

---

### Recruiter Endpoints

#### Dashboard Statistics
```http
GET /api/recruiter/dashboard/stats
Authorization: Bearer <recruiter_token>
```

Returns:
- Total jobs posted
- Total applicants
- Applications in review
- Hired candidates
- New applications today
- New applications this week

#### Recent Applications
```http
GET /api/recruiter/applications/recent?limit=10
Authorization: Bearer <recruiter_token>
```

#### All Applications (All Jobs)
```http
GET /api/recruiter/applications?status=APPLIED&limit=50&offset=0
Authorization: Bearer <recruiter_token>
```

#### Job-Specific Applications
```http
GET /api/jobs/:jobId/applications?status=IN_REVIEW&sort=desc
Authorization: Bearer <recruiter_token>
```

#### Application Details
```http
GET /api/applications/:applicationId
Authorization: Bearer <recruiter_token>
```

#### Update Application Status
```http
PATCH /api/applications/:applicationId/status
Authorization: Bearer <recruiter_token>
Content-Type: application/json

{
  "status": "IN_REVIEW",
  "note": "Scheduling interview"
}
```

---

## 🔐 Authorization Rules

### Role-Based Access
- **DEVELOPER**: Can apply to jobs, view own applications
- **RECRUITER**: Can view/manage applications for own jobs only
- **ADMIN**: (Future) Full access to all applications

### Ownership Verification
- Recruiters can only view applications for jobs they posted
- Developers can only view their own applications
- Status updates require job ownership

---

## 🔄 Application Status Flow

```
APPLIED → IN_REVIEW → ACCEPTED/REJECTED
```

Valid status transitions:
- Any status can be changed to any other status
- Recruiters have full control over status changes
- All status changes are logged with timestamps

---

## 🛠️ Service Functions

### `applyToJob(jobId, applicantId, coverLetter?)`
Creates a new job application.

**Validations**:
- Job must exist
- User must be a developer
- No duplicate applications
- Valid job ID and applicant ID

**Returns**: Complete application object with job and applicant details

---

### `getApplicationsByJobId(jobId, recruiterId, status?, sort?)`
Gets all applications for a specific job.

**Parameters**:
- `jobId`: Job to get applications for
- `recruiterId`: Recruiter making the request (for authorization)
- `status`: Optional filter by ApplicationStatus
- `sort`: Sort order ('asc' or 'desc')

**Authorization**: Verifies job ownership

**Returns**: Array of applications with applicant details

---

### `getAllRecruiterApplications(recruiterId, filters)`
Gets all applications across all recruiter's jobs.

**Filters**:
- `status`: Filter by ApplicationStatus
- `limit`: Pagination limit (default: 50)
- `offset`: Pagination offset (default: 0)
- `recent`: Last 30 days only (boolean)

**Returns**: Object with `applications` array and `total` count

---

### `getRecentApplications(recruiterId, limit?)`
Gets recent applications for dashboard (last 7 days).

**Parameters**:
- `recruiterId`: Recruiter making the request
- `limit`: Max results (default: 10, max: 20)

**Returns**: Array of recent applications

---

### `getApplicationById(applicationId, userId, userRole)`
Gets detailed application information.

**Authorization**: 
- Recruiter must own the job
- Developer must be the applicant

**Returns**: Complete application with full applicant and job details

---

### `updateApplicationStatus(applicationId, recruiterId, status, note?)`
Updates application status and adds optional note.

**Validations**:
- Valid ApplicationStatus enum value
- Recruiter must own the job
- Application must exist

**Returns**: Updated application

---

### `getDashboardStats(recruiterId)`
Calculates dashboard statistics for recruiter.

**Calculations**:
- Count of all posted jobs
- Total applicants across all jobs
- Applications in review
- Hired candidates (ACCEPTED status)
- New applications today
- New applications this week (last 7 days)

**Returns**: Statistics object

---

## 🎨 Controller Functions

All controllers follow this pattern:
1. Extract and validate parameters
2. Verify authentication
3. Call service function
4. Return standardized response

### Response Format

**Success**:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* result data */ }
}
```

**Error**:
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "status": 400
  }
}
```

---

## 🚨 Error Handling

### Custom Errors Used
- `BadRequestError(message)` - 400: Invalid input
- `UnauthorizedError(message)` - 401: Not authenticated
- `ForbiddenError(message)` - 403: Not authorized
- `NotFoundError(message)` - 404: Resource not found
- `ConflictError(message)` - 409: Duplicate application

### Common Error Scenarios
```javascript
// Duplicate application
throw ConflictError('You have already applied to this job');

// Job not found
throw NotFoundError('Job not found');

// Not job owner
throw ForbiddenError('You are not authorized to view applications for this job');

// Not a developer
throw ForbiddenError('Only developers can apply to jobs');

// Invalid status
throw BadRequestError('Invalid status. Must be one of: APPLIED, IN_REVIEW, ACCEPTED, REJECTED');
```

---

## 📊 Query Optimization

### Implemented Optimizations

1. **Database Indexes**:
   ```prisma
   @@index([jobId])
   @@index([applicantId])
   @@index([status])
   ```

2. **Selective Loading**:
   ```typescript
   // Only load needed fields
   select: {
     id: true,
     name: true,
     email: true
   }
   ```

3. **Efficient Joins**:
   ```typescript
   include: {
     applicant: { select: { /* only needed fields */ } },
     job: { select: { /* only needed fields */ } }
   }
   ```

4. **Date-based Filters**:
   ```typescript
   where: {
     appliedDate: { gte: sevenDaysAgo }
   }
   ```

---

## 🧪 Testing

### Unit Tests (Recommended)
```javascript
describe('Application Service', () => {
  test('should create application successfully', async () => {
    const result = await applyToJob(jobId, applicantId, coverLetter);
    expect(result.status).toBe('APPLIED');
  });

  test('should prevent duplicate applications', async () => {
    await expect(
      applyToJob(jobId, applicantId, coverLetter)
    ).rejects.toThrow('already applied');
  });

  test('should calculate dashboard stats correctly', async () => {
    const stats = await getDashboardStats(recruiterId);
    expect(stats.jobsPosted).toBeGreaterThan(0);
  });
});
```

### Integration Tests
See `POSTMAN_APPLICATION_TESTING_GUIDE.md` for complete testing scenarios.

---

## 🔄 Business Logic

### Duplicate Prevention
```typescript
const existingApplication = await prisma.application.findUnique({
  where: {
    jobId_applicantId: { jobId, applicantId }
  }
});

if (existingApplication) {
  throw ConflictError('You have already applied to this job');
}
```

### Ownership Verification
```typescript
const job = await prisma.job.findUnique({ where: { id: jobId } });

if (job.recruiterId !== recruiterId) {
  throw ForbiddenError('You are not authorized...');
}
```

### Cascade Deletion
When a job is deleted, all applications are automatically deleted:
```prisma
job  Job  @relation(fields: [jobId], references: [id], onDelete: Cascade)
```

---

## 📈 Performance Considerations

### Current Implementation
- ✅ Database indexes on all frequently queried fields
- ✅ Efficient queries with selective loading
- ✅ Pagination support for large datasets
- ✅ Date-based filtering for time ranges

### Production Recommendations
- 🔄 Add caching layer for dashboard stats (Redis, 5-10 min TTL)
- 🔄 Implement rate limiting per user/IP
- 🔄 Add database query monitoring
- 🔄 Consider read replicas for heavy read operations
- 🔄 Implement background jobs for notifications

---

## 🔮 Future Enhancements

### Planned Features
- [ ] Email notifications on status changes
- [ ] Bulk status updates
- [ ] Application search functionality
- [ ] Export applications to CSV/PDF
- [ ] Application timeline/history
- [ ] File upload for resumes
- [ ] Automated screening based on skills
- [ ] Interview scheduling integration
- [ ] Candidate ranking system
- [ ] Application analytics and reports

### Webhook Support
```javascript
// Future: Notify external systems
const notifyWebhook = async (application, event) => {
  await fetch(webhookUrl, {
    method: 'POST',
    body: JSON.stringify({
      event: 'application.status_changed',
      data: application
    })
  });
};
```

---

## 📚 Related Documentation

- **Full API Documentation**: `APPLICATION_API_DOCUMENTATION.md`
- **Frontend Integration Guide**: `FRONTEND_INTEGRATION_QUICKSTART.md`
- **Postman Testing Guide**: `POSTMAN_APPLICATION_TESTING_GUIDE.md`
- **Implementation Summary**: `API_IMPLEMENTATION_SUMMARY.md`
- **Backend Prompt**: `BACKEND_API_PROMPT.md`

---

## 🤝 Contributing

### Code Style
- Use TypeScript strict mode
- Follow existing patterns for services/controllers
- Add JSDoc comments for complex functions
- Handle all error cases
- Validate all inputs

### Adding New Endpoints
1. Add service function in `application.service.ts`
2. Add controller in `application.controller.ts`
3. Register route in `application.route.ts`
4. Add authentication/authorization middleware
5. Update documentation

### Testing New Features
1. Write unit tests for service logic
2. Add integration tests in Postman
3. Test authorization scenarios
4. Verify error handling
5. Check performance with large datasets

---

## 📞 Support

For issues or questions:
1. Check existing documentation
2. Review error messages in console
3. Test with Postman collection
4. Verify authentication tokens
5. Check database constraints

---

**Module Version**: 1.0.0  
**Last Updated**: October 7, 2025  
**Status**: ✅ Production Ready
