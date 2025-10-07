# Frontend Integration Prompt for Job API

## Context
I have a backend API for job posting functionality. I need to integrate these endpoints into my React/Next.js frontend. Below are all the API specifications with request/response formats.

---

## Base URL
```
http://localhost:4000/api
```

---

## Authentication
Protected routes require JWT token in Authorization header:
```
Authorization: Bearer <accessToken>
```

The `accessToken` is received when user logs in or signs up.

---

## 1. CREATE JOB (POST /api/jobs)

### Access Level
**RECRUITER ONLY** - Requires authentication

### Request

**Method:** `POST`  
**Endpoint:** `/api/jobs`  
**Headers:**
```javascript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <accessToken>'
}
```

**Request Body:**
```javascript
{
  "title": "Senior Full Stack Developer",
  "companyName": "Tech Solutions Inc",
  "location": "San Francisco, CA (Remote)",
  "jobType": "FULL_TIME",  // Options: "FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"
  "salaryRange": "$120,000 - $150,000",
  "requiredSkills": ["JavaScript", "React", "Node.js", "PostgreSQL", "AWS"],
  "description": "We are looking for an experienced Full Stack Developer to join our team..."
}
```

**Field Constraints:**
- `title`: string, required, non-empty
- `companyName`: string, required, non-empty
- `location`: string, required, non-empty
- `jobType`: enum, required, one of: "FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"
- `salaryRange`: string, required, non-empty
- `requiredSkills`: array of strings, required, must have at least one skill
- `description`: string, required, non-empty

### Success Response (201 Created)
```javascript
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

### Error Responses

**401 Unauthorized - No Token:**
```javascript
{
  "status": "error",
  "message": "Access token required"
}
```

**401 Unauthorized - Invalid Token:**
```javascript
{
  "status": "error",
  "message": "Invalid or expired access token"
}
```

**403 Forbidden - Not a Recruiter:**
```javascript
{
  "status": "error",
  "message": "You do not have permission to perform this action"
}
```

**400 Bad Request - Missing Fields:**
```javascript
{
  "status": "error",
  "message": "All job fields are required"
}
```

**400 Bad Request - Invalid Job Type:**
```javascript
{
  "status": "error",
  "message": "Invalid job type. Must be one of: FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP"
}
```

**400 Bad Request - Invalid Skills:**
```javascript
{
  "status": "error",
  "message": "Required skills must be a non-empty array"
}
```

---

## 2. GET ALL JOBS (GET /api/jobs)

### Access Level
**PUBLIC** - No authentication required

### Request

**Method:** `GET`  
**Endpoint:** `/api/jobs`  
**Headers:**
```javascript
{
  'Content-Type': 'application/json'
}
```

**No Request Body**

### Success Response (200 OK)
```javascript
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

**Note:** Returns empty array `[]` if no jobs exist:
```javascript
{
  "status": "success",
  "message": "Jobs retrieved successfully",
  "data": []
}
```

---

## 3. GET SINGLE JOB (GET /api/jobs/:id)

### Access Level
**PUBLIC** - No authentication required

### Request

**Method:** `GET`  
**Endpoint:** `/api/jobs/:id` (replace `:id` with actual job ID)  
**Example:** `/api/jobs/1`  
**Headers:**
```javascript
{
  'Content-Type': 'application/json'
}
```

**No Request Body**

### Success Response (200 OK)
```javascript
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
    "description": "We are looking for an experienced Full Stack Developer to join our team. You will be responsible for building scalable web applications...",
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

### Error Responses

**404 Not Found:**
```javascript
{
  "status": "error",
  "message": "Job not found"
}
```

**400 Bad Request - Invalid ID:**
```javascript
{
  "status": "error",
  "message": "Invalid job ID"
}
```

---

## 4. GET MY JOBS (GET /api/jobs/my/jobs)

### Access Level
**RECRUITER ONLY** - Requires authentication

### Request

**Method:** `GET`  
**Endpoint:** `/api/jobs/my/jobs`  
**Headers:**
```javascript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <accessToken>'
}
```

**No Request Body**

### Success Response (200 OK)
```javascript
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
      "requiredSkills": ["JavaScript", "React", "Node.js", "PostgreSQL"],
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
      "id": 3,
      "title": "Backend Developer",
      "companyName": "Tech Solutions Inc",
      "location": "Remote",
      "jobType": "FULL_TIME",
      "salaryRange": "$100,000 - $130,000",
      "requiredSkills": ["Node.js", "MongoDB", "Express"],
      "description": "Another job posted by same recruiter...",
      "recruiterId": 5,
      "recruiter": {
        "id": 5,
        "name": "John Recruiter",
        "email": "recruiter@example.com",
        "role": "RECRUITER"
      },
      "createdAt": "2025-10-06T10:00:00.000Z",
      "updatedAt": "2025-10-06T10:00:00.000Z"
    }
  ]
}
```

**Note:** Returns empty array if recruiter hasn't posted any jobs:
```javascript
{
  "status": "success",
  "message": "Your jobs retrieved successfully",
  "data": []
}
```

### Error Responses

**401 Unauthorized - No Token:**
```javascript
{
  "status": "error",
  "message": "Access token required"
}
```

**403 Forbidden - Not a Recruiter:**
```javascript
{
  "status": "error",
  "message": "You do not have permission to perform this action"
}
```

---

## TypeScript Types

### Job Type Definition
```typescript
type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';

interface Recruiter {
  id: number;
  name: string;
  email: string;
  role: 'RECRUITER';
}

interface Job {
  id: number;
  title: string;
  companyName: string;
  location: string;
  jobType: JobType;
  salaryRange: string;
  requiredSkills: string[];
  description: string;
  recruiterId: number;
  recruiter: Recruiter;
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
}

interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

interface CreateJobPayload {
  title: string;
  companyName: string;
  location: string;
  jobType: JobType;
  salaryRange: string;
  requiredSkills: string[];
  description: string;
}
```

---

## Example Frontend API Service (React/Next.js)

```typescript
// services/jobApi.ts

const API_BASE_URL = 'http://localhost:4000/api';

// Get access token from localStorage or cookie
const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

// Create a new job (Recruiter only)
export const createJob = async (jobData: CreateJobPayload): Promise<Job> => {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(jobData),
  });

  const result: ApiResponse<Job> = await response.json();

  if (!response.ok || result.status === 'error') {
    throw new Error(result.message || 'Failed to create job');
  }

  return result.data!;
};

// Get all jobs (Public)
export const getAllJobs = async (): Promise<Job[]> => {
  const response = await fetch(`${API_BASE_URL}/jobs`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const result: ApiResponse<Job[]> = await response.json();

  if (!response.ok || result.status === 'error') {
    throw new Error(result.message || 'Failed to fetch jobs');
  }

  return result.data!;
};

// Get single job by ID (Public)
export const getJobById = async (jobId: number): Promise<Job> => {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const result: ApiResponse<Job> = await response.json();

  if (!response.ok || result.status === 'error') {
    throw new Error(result.message || 'Failed to fetch job');
  }

  return result.data!;
};

// Get my jobs (Recruiter only)
export const getMyJobs = async (): Promise<Job[]> => {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}/jobs/my/jobs`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  const result: ApiResponse<Job[]> = await response.json();

  if (!response.ok || result.status === 'error') {
    throw new Error(result.message || 'Failed to fetch your jobs');
  }

  return result.data!;
};
```

---

## Example React Component Usage

```typescript
// Example: Create Job Form
import { useState } from 'react';
import { createJob } from '@/services/jobApi';

const CreateJobForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    location: '',
    jobType: 'FULL_TIME' as JobType,
    salaryRange: '',
    requiredSkills: [] as string[],
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const job = await createJob(formData);
      console.log('Job created:', job);
      // Show success message
      // Redirect to job details or jobs list
    } catch (error) {
      console.error('Error creating job:', error);
      // Show error message
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};

// Example: Jobs List
import { useEffect, useState } from 'react';
import { getAllJobs } from '@/services/jobApi';

const JobsList = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await getAllJobs();
        setJobs(data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {jobs.map(job => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
};
```

---

## Error Handling Best Practices

```typescript
try {
  const job = await createJob(jobData);
  // Success
} catch (error) {
  if (error instanceof Error) {
    switch (error.message) {
      case 'Access token required':
      case 'Invalid or expired access token':
        // Redirect to login
        break;
      case 'You do not have permission to perform this action':
        // Show "Unauthorized" message
        break;
      case 'All job fields are required':
        // Show validation error
        break;
      default:
        // Generic error message
    }
  }
}
```

---

## Job Type Options for Frontend

```typescript
const JOB_TYPE_OPTIONS = [
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
];
```

---

## Summary

- **4 Endpoints Total**
- **2 Public Endpoints** (GET all jobs, GET single job)
- **2 Protected Endpoints** (POST create job, GET my jobs - RECRUITER only)
- All responses follow consistent format: `{ status, message, data }`
- Errors include appropriate HTTP status codes
- JWT token required for protected routes
- Only recruiters can create and view their own jobs
- Anyone can view all jobs

---

## Integration Checklist

- [ ] Create TypeScript types for Job, JobType, etc.
- [ ] Set up API service with base URL
- [ ] Implement `createJob` function
- [ ] Implement `getAllJobs` function
- [ ] Implement `getJobById` function
- [ ] Implement `getMyJobs` function
- [ ] Handle authentication token storage
- [ ] Add token to Authorization header for protected routes
- [ ] Create error handling logic
- [ ] Build job creation form (Recruiter)
- [ ] Build jobs listing page (Public)
- [ ] Build job details page (Public)
- [ ] Build "My Jobs" page (Recruiter)
- [ ] Add loading states
- [ ] Add error states
- [ ] Add success notifications

---

**Ready to integrate! 🚀**
