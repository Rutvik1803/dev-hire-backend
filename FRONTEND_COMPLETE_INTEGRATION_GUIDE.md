# DevHire Backend API - Complete Integration Guide for Frontend

## 🎯 Overview

This document provides **everything** you need to integrate the DevHire backend APIs into your frontend application. The backend supports **two user types**: **Recruiters** and **Developers**, each with their own dashboard and features.

---

## 📋 Table of Contents

1. [Base Configuration](#-base-configuration)
2. [Authentication APIs](#-authentication-apis)
3. [Recruiter Dashboard APIs](#-recruiter-dashboard-apis)
4. [Developer Dashboard APIs](#-developer-dashboard-apis)
5. [Job APIs (Public & Protected)](#-job-apis)
6. [TypeScript Interfaces](#-typescript-interfaces)
7. [React Integration Examples](#-react-integration-examples)
8. [Error Handling](#-error-handling)
9. [Testing Guide](#-testing-guide)

---

## 🔧 Base Configuration

### **Backend Server**
```
Base URL: http://localhost:4000
```

### **CORS Configuration**
The backend accepts requests from:
```
Frontend URL: http://localhost:5173
```

### **Authentication**
All protected routes require JWT token in header:
```http
Authorization: Bearer {accessToken}
```

### **Response Format**
All responses follow this structure:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

---

## 🔐 Authentication APIs

### 1. Register User

**Endpoint:** `POST /api/auth/register`  
**Access:** Public  
**Description:** Create a new user account (Developer or Recruiter)

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "DEVELOPER"  // or "RECRUITER"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "name": "John Doe",
      "role": "DEVELOPER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2. Login

**Endpoint:** `POST /api/auth/login`  
**Access:** Public  
**Description:** Authenticate user and get tokens

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "name": "John Doe",
      "role": "DEVELOPER"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. Refresh Token

**Endpoint:** `POST /api/auth/refresh`  
**Access:** Public  
**Description:** Get new access token using refresh token

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 4. Logout

**Endpoint:** `POST /api/auth/logout`  
**Access:** Protected  
**Description:** Invalidate refresh token

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

---

## 💼 Recruiter Dashboard APIs

### 1. Get Recruiter Dashboard Statistics

**Endpoint:** `GET /api/recruiter/dashboard/stats`  
**Access:** Protected (Recruiter only)  
**Description:** Get overview statistics for recruiter dashboard

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "totalJobs": 15,
    "activeJobs": 12,
    "totalApplications": 156,
    "newApplications": 23,
    "recentActivity": {
      "newApplicationsThisWeek": 23,
      "interviewsScheduled": 8
    }
  }
}
```

---

### 2. Get All Recruiter Applications

**Endpoint:** `GET /api/recruiter/applications`  
**Access:** Protected (Recruiter only)  
**Description:** Get all applications across all jobs with filters

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `status` (optional): Filter by status - `APPLIED`, `IN_REVIEW`, `ACCEPTED`, `REJECTED`
- `limit` (optional): Results per page (default: 50)
- `offset` (optional): Skip records (default: 0)
- `sort` (optional): Sort order - `asc` or `desc` (default: `desc`)

**Example Request:**
```
GET /api/recruiter/applications?status=APPLIED&limit=20&offset=0&sort=desc
```

**Response:**
```json
{
  "success": true,
  "message": "Applications retrieved successfully",
  "data": {
    "data": [
      {
        "id": 1,
        "jobId": 5,
        "status": "APPLIED",
        "coverLetter": "I am interested in...",
        "appliedDate": "2024-01-15T10:30:00Z",
        "updatedDate": "2024-01-15T10:30:00Z",
        "job": {
          "id": 5,
          "title": "Senior Full Stack Developer",
          "companyName": "Tech Corp"
        },
        "applicant": {
          "id": 3,
          "name": "Jane Smith",
          "email": "jane@example.com"
        }
      }
    ],
    "total": 156,
    "limit": 20,
    "offset": 0
  }
}
```

---

### 3. Get Recent Applications

**Endpoint:** `GET /api/recruiter/applications/recent`  
**Access:** Protected (Recruiter only)  
**Description:** Get recent applications (last 30 days)

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `limit` (optional): Number of results (default: 10, max: 20)

**Response:**
```json
{
  "success": true,
  "message": "Recent applications retrieved successfully",
  "data": [
    {
      "id": 1,
      "status": "APPLIED",
      "appliedDate": "2024-01-20T14:00:00Z",
      "job": {
        "title": "Backend Developer",
        "companyName": "StartupXYZ"
      },
      "applicant": {
        "name": "Jane Smith",
        "email": "jane@example.com"
      }
    }
  ]
}
```

---

### 4. Get Applications for Specific Job

**Endpoint:** `GET /api/jobs/:jobId/applications`  
**Access:** Protected (Recruiter only)  
**Description:** Get all applications for a specific job

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "message": "Applications retrieved successfully",
  "data": [
    {
      "id": 1,
      "status": "APPLIED",
      "coverLetter": "...",
      "appliedDate": "2024-01-15T10:30:00Z",
      "applicant": {
        "id": 3,
        "name": "Jane Smith",
        "email": "jane@example.com",
        "resumeUrl": "/uploads/resumes/jane-resume.pdf",
        "experience": 5,
        "skills": ["JavaScript", "React", "Node.js"]
      }
    }
  ]
}
```

---

### 5. Get Application by ID

**Endpoint:** `GET /api/applications/:applicationId`  
**Access:** Protected  
**Description:** Get detailed information about a specific application

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "message": "Application retrieved successfully",
  "data": {
    "id": 1,
    "jobId": 5,
    "status": "APPLIED",
    "coverLetter": "I am very interested...",
    "notes": "Strong candidate",
    "appliedDate": "2024-01-15T10:30:00Z",
    "updatedDate": "2024-01-15T10:30:00Z",
    "job": {
      "id": 5,
      "title": "Senior Full Stack Developer",
      "companyName": "Tech Corp",
      "location": "Remote"
    },
    "applicant": {
      "id": 3,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "resumeUrl": "/uploads/resumes/jane-resume.pdf",
      "experience": 5,
      "skills": ["JavaScript", "React", "Node.js"],
      "linkedinUrl": "https://linkedin.com/in/janesmith",
      "githubUrl": "https://github.com/janesmith"
    }
  }
}
```

---

### 6. Update Application Status

**Endpoint:** `PATCH /api/applications/:applicationId/status`  
**Access:** Protected (Recruiter only)  
**Description:** Update the status of an application

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "status": "IN_REVIEW",  // APPLIED, IN_REVIEW, ACCEPTED, REJECTED
  "notes": "Good candidate, moving to next round"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application status updated successfully",
  "data": {
    "id": 1,
    "status": "IN_REVIEW",
    "notes": "Good candidate, moving to next round",
    "updatedDate": "2024-01-16T09:00:00Z"
  }
}
```

---

### 7. Create Job

**Endpoint:** `POST /api/jobs`  
**Access:** Protected (Recruiter only)  
**Description:** Create a new job posting

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "title": "Senior Full Stack Developer",
  "companyName": "Tech Corp",
  "location": "Remote",
  "jobType": "FULL_TIME",  // FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP
  "salaryRange": "$100k - $150k",
  "requiredSkills": ["JavaScript", "React", "Node.js", "PostgreSQL"],
  "description": "We are looking for an experienced full stack developer..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job created successfully",
  "data": {
    "id": 5,
    "title": "Senior Full Stack Developer",
    "companyName": "Tech Corp",
    "location": "Remote",
    "jobType": "FULL_TIME",
    "salaryRange": "$100k - $150k",
    "requiredSkills": ["JavaScript", "React", "Node.js", "PostgreSQL"],
    "description": "We are looking for...",
    "recruiterId": 1,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z",
    "recruiter": {
      "id": 1,
      "name": "John Recruiter",
      "email": "john@techcorp.com"
    }
  }
}
```

---

### 8. Get My Jobs

**Endpoint:** `GET /api/jobs/my/jobs`  
**Access:** Protected (Recruiter only)  
**Description:** Get all jobs posted by the logged-in recruiter

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "message": "Jobs retrieved successfully",
  "data": [
    {
      "id": 5,
      "title": "Senior Full Stack Developer",
      "companyName": "Tech Corp",
      "location": "Remote",
      "jobType": "FULL_TIME",
      "salaryRange": "$100k - $150k",
      "requiredSkills": ["JavaScript", "React", "Node.js"],
      "description": "...",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

---

### 9. Update Job

**Endpoint:** `PUT /api/jobs/:id`  
**Access:** Protected (Recruiter only - job owner)  
**Description:** Update a job posting

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "title": "Senior Full Stack Developer (Updated)",
  "companyName": "Tech Corp",
  "location": "Remote",
  "jobType": "FULL_TIME",
  "salaryRange": "$120k - $160k",
  "requiredSkills": ["JavaScript", "React", "Node.js", "TypeScript"],
  "description": "Updated description..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job updated successfully",
  "data": {
    "id": 5,
    "title": "Senior Full Stack Developer (Updated)",
    // ... updated fields
  }
}
```

---

### 10. Delete Job

**Endpoint:** `DELETE /api/jobs/:id`  
**Access:** Protected (Recruiter only - job owner)  
**Description:** Delete a job posting (also deletes all applications)

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "message": "Job deleted successfully",
  "data": null
}
```

---

## 👨‍💻 Developer Dashboard APIs

### 1. Get Developer Dashboard Statistics

**Endpoint:** `GET /api/developer/dashboard/stats`  
**Access:** Protected (Developer only)  
**Description:** Get overview statistics for developer dashboard

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "appliedJobs": 15,
    "inReview": 8,
    "interviews": 3,
    "offers": 2,
    "recentActivity": {
      "newResponsesThisWeek": 5,
      "upcomingInterviews": 3
    }
  }
}
```

---

### 2. Get All Developer Applications

**Endpoint:** `GET /api/developer/applications`  
**Access:** Protected (Developer only)  
**Description:** Get all applications submitted by the developer

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `status` (optional): Filter by status - `APPLIED`, `IN_REVIEW`, `ACCEPTED`, `REJECTED`
- `limit` (optional): Results per page (default: 50)
- `offset` (optional): Skip records (default: 0)
- `sort` (optional): Sort order - `asc` or `desc` (default: `desc`)

**Example Request:**
```
GET /api/developer/applications?status=APPLIED&limit=10&offset=0
```

**Response:**
```json
{
  "success": true,
  "message": "Applications retrieved successfully",
  "data": {
    "data": [
      {
        "id": 1,
        "status": "APPLIED",
        "coverLetter": "I am excited to apply...",
        "appliedDate": "2024-01-15T10:30:00Z",
        "updatedDate": "2024-01-15T10:30:00Z",
        "job": {
          "id": 5,
          "title": "Senior Full Stack Developer",
          "companyName": "Tech Corp",
          "location": "Remote",
          "jobType": "FULL_TIME"
        }
      }
    ],
    "total": 15,
    "limit": 10,
    "offset": 0
  }
}
```

---

### 3. Get Recent Applications

**Endpoint:** `GET /api/developer/applications/recent`  
**Access:** Protected (Developer only)  
**Description:** Get recent applications (last 30 days)

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `limit` (optional): Number of results (default: 10, max: 20)

**Response:**
```json
{
  "success": true,
  "message": "Recent applications retrieved successfully",
  "data": [
    {
      "id": 1,
      "status": "IN_REVIEW",
      "appliedDate": "2024-01-20T14:00:00Z",
      "job": {
        "title": "Backend Developer",
        "companyName": "StartupXYZ",
        "location": "San Francisco, CA"
      }
    }
  ]
}
```

---

### 4. Apply to Job

**Endpoint:** `POST /api/jobs/:jobId/apply`  
**Access:** Protected (Requires authentication)  
**Description:** Submit an application for a job

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request:**
```json
{
  "coverLetter": "I am very excited to apply for this position because..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "id": 1,
    "jobId": 5,
    "applicantId": 3,
    "status": "APPLIED",
    "coverLetter": "I am very excited...",
    "appliedDate": "2024-01-15T10:30:00Z",
    "job": {
      "id": 5,
      "title": "Senior Full Stack Developer",
      "companyName": "Tech Corp"
    }
  }
}
```

**Error (Already Applied):**
```json
{
  "success": false,
  "message": "You have already applied to this job",
  "errors": []
}
```

---

### 5. Check Application Status

**Endpoint:** `GET /api/jobs/:jobId/application-status`  
**Access:** Protected (Developer only)  
**Description:** Check if developer has applied to a specific job

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response (Has Applied):**
```json
{
  "success": true,
  "message": "Application status retrieved",
  "data": {
    "hasApplied": true,
    "application": {
      "id": 1,
      "status": "IN_REVIEW",
      "appliedDate": "2024-01-18T09:00:00Z"
    }
  }
}
```

**Response (Not Applied):**
```json
{
  "success": true,
  "message": "Application status retrieved",
  "data": {
    "hasApplied": false,
    "application": null
  }
}
```

---

### 6. Withdraw Application

**Endpoint:** `DELETE /api/applications/:applicationId`  
**Access:** Protected (Developer only)  
**Description:** Withdraw/delete an application

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "message": "Application withdrawn successfully",
  "data": {
    "message": "Application withdrawn successfully"
  }
}
```

**Error (Cannot Withdraw):**
```json
{
  "success": false,
  "message": "Cannot withdraw application with status ACCEPTED",
  "errors": []
}
```

**Note:** Cannot withdraw applications with status `ACCEPTED` or `REJECTED`

---

### 7. Get Developer Profile

**Endpoint:** `GET /api/developer/profile`  
**Access:** Protected (Developer only)  
**Description:** Get developer's profile information

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 3,
    "email": "john@example.com",
    "name": "John Doe",
    "role": "DEVELOPER",
    "experience": 5,
    "skills": ["JavaScript", "React", "Node.js", "TypeScript", "PostgreSQL"],
    "resumeUrl": "/uploads/resumes/john-resume-1234567890.pdf",
    "linkedinUrl": "https://linkedin.com/in/johndoe",
    "githubUrl": "https://github.com/johndoe",
    "phone": "+1234567890",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

---

### 8. Update Developer Profile

**Endpoint:** `PATCH /api/developer/profile`  
**Access:** Protected (Developer only)  
**Description:** Update developer profile information

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

**Request (all fields optional):**
```json
{
  "experience": 6,
  "skills": ["JavaScript", "React", "Node.js", "TypeScript", "Python"],
  "linkedinUrl": "https://linkedin.com/in/johndoe",
  "githubUrl": "https://github.com/johndoe",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 3,
    "email": "john@example.com",
    "name": "John Doe",
    "experience": 6,
    "skills": ["JavaScript", "React", "Node.js", "TypeScript", "Python"],
    "linkedinUrl": "https://linkedin.com/in/johndoe",
    "githubUrl": "https://github.com/johndoe",
    "phone": "+1234567890"
  }
}
```

---

### 9. Upload Resume

**Endpoint:** `POST /api/developer/resume/upload`  
**Access:** Protected (Developer only)  
**Description:** Upload resume file (PDF or DOC/DOCX)

**Headers:**
```
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**Request (Form Data):**
```
resume: <file>
```

**File Constraints:**
- Accepted formats: PDF, DOC, DOCX
- Maximum size: 5MB
- Replaces existing resume if any

**Response:**
```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "data": {
    "resumeUrl": "/uploads/resumes/resume-1234567890-abc123.pdf",
    "fileName": "John_Doe_Resume.pdf",
    "fileSize": 245678,
    "message": "Resume uploaded and saved successfully"
  }
}
```

**Error (Invalid File Type):**
```json
{
  "success": false,
  "message": "Only PDF and DOC/DOCX files are allowed",
  "errors": []
}
```

---

### 10. Get Resume Details

**Endpoint:** `GET /api/developer/resume`  
**Access:** Protected (Developer only)  
**Description:** Get information about uploaded resume

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "message": "Resume details retrieved successfully",
  "data": {
    "resumeUrl": "/uploads/resumes/resume-1234567890-abc123.pdf",
    "fileName": "John_Doe_Resume.pdf",
    "uploadedAt": "2024-01-10T12:00:00Z"
  }
}
```

**Response (No Resume):**
```json
{
  "success": true,
  "message": "No resume found",
  "data": null
}
```

---

### 11. Delete Resume

**Endpoint:** `DELETE /api/developer/resume`  
**Access:** Protected (Developer only)  
**Description:** Delete uploaded resume

**Headers:**
```
Authorization: Bearer {accessToken}
```

**Response:**
```json
{
  "success": true,
  "message": "Resume deleted successfully",
  "data": {
    "message": "Resume deleted successfully"
  }
}
```

**Note:** Deletes file from server and removes URL from database

---

## 💼 Job APIs (Public & Protected)

### 1. Get All Jobs

**Endpoint:** `GET /api/jobs`  
**Access:** Public  
**Description:** Get all available job postings

**Response:**
```json
{
  "success": true,
  "message": "Jobs retrieved successfully",
  "data": [
    {
      "id": 5,
      "title": "Senior Full Stack Developer",
      "companyName": "Tech Corp",
      "location": "Remote",
      "jobType": "FULL_TIME",
      "salaryRange": "$100k - $150k",
      "requiredSkills": ["JavaScript", "React", "Node.js"],
      "description": "We are looking for...",
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z",
      "recruiter": {
        "id": 1,
        "name": "John Recruiter",
        "email": "john@techcorp.com"
      }
    }
  ]
}
```

---

### 2. Get Job by ID

**Endpoint:** `GET /api/jobs/:id`  
**Access:** Public  
**Description:** Get detailed information about a specific job

**Response:**
```json
{
  "success": true,
  "message": "Job retrieved successfully",
  "data": {
    "id": 5,
    "title": "Senior Full Stack Developer",
    "companyName": "Tech Corp",
    "location": "Remote",
    "jobType": "FULL_TIME",
    "salaryRange": "$100k - $150k",
    "requiredSkills": ["JavaScript", "React", "Node.js", "PostgreSQL"],
    "description": "We are looking for an experienced developer...",
    "recruiterId": 1,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z",
    "recruiter": {
      "id": 1,
      "name": "John Recruiter",
      "email": "john@techcorp.com"
    }
  }
}
```

---

## 📘 TypeScript Interfaces

```typescript
// ============ User & Auth Types ============

export enum Role {
  DEVELOPER = 'DEVELOPER',
  RECRUITER = 'RECRUITER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  experience?: number;
  skills?: string[];
  resumeUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: Role;
}

// ============ Job Types ============

export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP'
}

export interface Job {
  id: number;
  title: string;
  companyName: string;
  location: string;
  jobType: JobType;
  salaryRange: string;
  requiredSkills: string[];
  description: string;
  recruiterId: number;
  createdAt: string;
  updatedAt: string;
  recruiter?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateJobData {
  title: string;
  companyName: string;
  location: string;
  jobType: JobType;
  salaryRange: string;
  requiredSkills: string[];
  description: string;
}

// ============ Application Types ============

export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  IN_REVIEW = 'IN_REVIEW',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export interface Application {
  id: number;
  jobId: number;
  applicantId: number;
  status: ApplicationStatus;
  coverLetter?: string;
  notes?: string;
  appliedDate: string;
  updatedDate: string;
  job?: Job;
  applicant?: User;
}

export interface ApplyToJobData {
  coverLetter: string;
}

export interface UpdateApplicationStatusData {
  status: ApplicationStatus;
  notes?: string;
}

// ============ Dashboard Stats Types ============

export interface RecruiterDashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  newApplications: number;
  recentActivity: {
    newApplicationsThisWeek: number;
    interviewsScheduled: number;
  };
}

export interface DeveloperDashboardStats {
  appliedJobs: number;
  inReview: number;
  interviews: number;
  offers: number;
  recentActivity: {
    newResponsesThisWeek: number;
    upcomingInterviews: number;
  };
}

// ============ Profile Types ============

export interface DeveloperProfile {
  id: number;
  email: string;
  name: string;
  role: string;
  experience?: number;
  skills: string[];
  resumeUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  experience?: number;
  skills?: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  phone?: string;
}

// ============ Resume Types ============

export interface ResumeDetails {
  resumeUrl: string;
  fileName: string;
  uploadedAt: string;
}

// ============ Pagination Types ============

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface FilterParams {
  status?: ApplicationStatus;
  limit?: number;
  offset?: number;
  sort?: 'asc' | 'desc';
}

// ============ API Response Types ============

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors: string[];
}
```

---

## ⚛️ React Integration Examples

### 1. Setup API Client

```typescript
// services/apiClient.ts
import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = 'http://localhost:4000';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired, try to refresh
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refreshToken,
          });
          const newToken = response.data.data.accessToken;
          localStorage.setItem('accessToken', newToken);
          
          // Retry original request
          if (error.config) {
            error.config.headers.Authorization = `Bearer ${newToken}`;
            return axios(error.config);
          }
        } catch (refreshError) {
          // Refresh failed, logout user
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);
```

---

### 2. Auth Service

```typescript
// services/auth.service.ts
import { apiClient } from './apiClient';
import { AuthResponse, LoginCredentials, RegisterData, ApiResponse } from '../types';

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/api/auth/register',
      data
    );
    return response.data.data;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/api/auth/login',
      credentials
    );
    const { accessToken, refreshToken, user } = response.data.data;
    
    // Store tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data.data;
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await apiClient.post('/api/auth/logout', { refreshToken });
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await apiClient.post<ApiResponse<{ accessToken: string }>>(
      '/api/auth/refresh',
      { refreshToken }
    );
    const newToken = response.data.data.accessToken;
    localStorage.setItem('accessToken', newToken);
    return newToken;
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  },
};
```

---

### 3. Developer Service

```typescript
// services/developer.service.ts
import { apiClient } from './apiClient';
import {
  DeveloperDashboardStats,
  Application,
  PaginatedResponse,
  FilterParams,
  DeveloperProfile,
  UpdateProfileData,
  ResumeDetails,
  ApiResponse,
} from '../types';

export const developerService = {
  async getDashboardStats(): Promise<DeveloperDashboardStats> {
    const response = await apiClient.get<ApiResponse<DeveloperDashboardStats>>(
      '/api/developer/dashboard/stats'
    );
    return response.data.data;
  },

  async getApplications(
    filters: FilterParams = {}
  ): Promise<PaginatedResponse<Application>> {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());
    if (filters.sort) params.append('sort', filters.sort);

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Application>>>(
      `/api/developer/applications?${params.toString()}`
    );
    return response.data.data;
  },

  async getRecentApplications(limit: number = 10): Promise<Application[]> {
    const response = await apiClient.get<ApiResponse<Application[]>>(
      `/api/developer/applications/recent?limit=${limit}`
    );
    return response.data.data;
  },

  async checkApplicationStatus(jobId: number): Promise<{
    hasApplied: boolean;
    application: Application | null;
  }> {
    const response = await apiClient.get(
      `/api/jobs/${jobId}/application-status`
    );
    return response.data.data;
  },

  async withdrawApplication(applicationId: number): Promise<void> {
    await apiClient.delete(`/api/applications/${applicationId}`);
  },

  async getProfile(): Promise<DeveloperProfile> {
    const response = await apiClient.get<ApiResponse<DeveloperProfile>>(
      '/api/developer/profile'
    );
    return response.data.data;
  },

  async updateProfile(data: UpdateProfileData): Promise<DeveloperProfile> {
    const response = await apiClient.patch<ApiResponse<DeveloperProfile>>(
      '/api/developer/profile',
      data
    );
    return response.data.data;
  },

  async uploadResume(file: File): Promise<ResumeDetails> {
    const formData = new FormData();
    formData.append('resume', file);

    const response = await apiClient.post<ApiResponse<ResumeDetails>>(
      '/api/developer/resume/upload',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  async getResumeDetails(): Promise<ResumeDetails | null> {
    const response = await apiClient.get<ApiResponse<ResumeDetails | null>>(
      '/api/developer/resume'
    );
    return response.data.data;
  },

  async deleteResume(): Promise<void> {
    await apiClient.delete('/api/developer/resume');
  },
};
```

---

### 4. Recruiter Service

```typescript
// services/recruiter.service.ts
import { apiClient } from './apiClient';
import {
  RecruiterDashboardStats,
  Application,
  PaginatedResponse,
  FilterParams,
  UpdateApplicationStatusData,
  ApiResponse,
} from '../types';

export const recruiterService = {
  async getDashboardStats(): Promise<RecruiterDashboardStats> {
    const response = await apiClient.get<ApiResponse<RecruiterDashboardStats>>(
      '/api/recruiter/dashboard/stats'
    );
    return response.data.data;
  },

  async getAllApplications(
    filters: FilterParams = {}
  ): Promise<PaginatedResponse<Application>> {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());
    if (filters.sort) params.append('sort', filters.sort);

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Application>>>(
      `/api/recruiter/applications?${params.toString()}`
    );
    return response.data.data;
  },

  async getRecentApplications(limit: number = 10): Promise<Application[]> {
    const response = await apiClient.get<ApiResponse<Application[]>>(
      `/api/recruiter/applications/recent?limit=${limit}`
    );
    return response.data.data;
  },

  async getJobApplications(jobId: number): Promise<Application[]> {
    const response = await apiClient.get<ApiResponse<Application[]>>(
      `/api/jobs/${jobId}/applications`
    );
    return response.data.data;
  },

  async getApplicationById(applicationId: number): Promise<Application> {
    const response = await apiClient.get<ApiResponse<Application>>(
      `/api/applications/${applicationId}`
    );
    return response.data.data;
  },

  async updateApplicationStatus(
    applicationId: number,
    data: UpdateApplicationStatusData
  ): Promise<Application> {
    const response = await apiClient.patch<ApiResponse<Application>>(
      `/api/applications/${applicationId}/status`,
      data
    );
    return response.data.data;
  },
};
```

---

### 5. Job Service

```typescript
// services/job.service.ts
import { apiClient } from './apiClient';
import { Job, CreateJobData, ApplyToJobData, Application, ApiResponse } from '../types';

export const jobService = {
  async getAllJobs(): Promise<Job[]> {
    const response = await apiClient.get<ApiResponse<Job[]>>('/api/jobs');
    return response.data.data;
  },

  async getJobById(id: number): Promise<Job> {
    const response = await apiClient.get<ApiResponse<Job>>(`/api/jobs/${id}`);
    return response.data.data;
  },

  async getMyJobs(): Promise<Job[]> {
    const response = await apiClient.get<ApiResponse<Job[]>>('/api/jobs/my/jobs');
    return response.data.data;
  },

  async createJob(data: CreateJobData): Promise<Job> {
    const response = await apiClient.post<ApiResponse<Job>>('/api/jobs', data);
    return response.data.data;
  },

  async updateJob(id: number, data: CreateJobData): Promise<Job> {
    const response = await apiClient.put<ApiResponse<Job>>(`/api/jobs/${id}`, data);
    return response.data.data;
  },

  async deleteJob(id: number): Promise<void> {
    await apiClient.delete(`/api/jobs/${id}`);
  },

  async applyToJob(jobId: number, data: ApplyToJobData): Promise<Application> {
    const response = await apiClient.post<ApiResponse<Application>>(
      `/api/jobs/${jobId}/apply`,
      data
    );
    return response.data.data;
  },
};
```

---

### 6. React Hook Examples

```typescript
// hooks/useDeveloperDashboard.ts
import { useState, useEffect } from 'react';
import { developerService } from '../services/developer.service';
import { DeveloperDashboardStats } from '../types';

export const useDeveloperDashboard = () => {
  const [stats, setStats] = useState<DeveloperDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await developerService.getDashboardStats();
      setStats(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error, refetch: fetchStats };
};
```

```typescript
// hooks/useApplications.ts
import { useState, useEffect } from 'react';
import { developerService } from '../services/developer.service';
import { Application, FilterParams } from '../types';

export const useApplications = (filters: FilterParams = {}) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [filters.status, filters.limit, filters.offset]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await developerService.getApplications(filters);
      setApplications(data.data);
      setTotal(data.total);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  return { applications, total, loading, error, refetch: fetchApplications };
};
```

---

### 7. React Component Examples

```tsx
// components/DeveloperDashboard.tsx
import React from 'react';
import { useDeveloperDashboard } from '../hooks/useDeveloperDashboard';

export const DeveloperDashboard: React.FC = () => {
  const { stats, loading, error } = useDeveloperDashboard();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!stats) return <div>No data available</div>;

  return (
    <div className="dashboard">
      <h1>Developer Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Applied Jobs</h3>
          <p className="stat-value">{stats.appliedJobs}</p>
        </div>
        
        <div className="stat-card">
          <h3>In Review</h3>
          <p className="stat-value">{stats.inReview}</p>
        </div>
        
        <div className="stat-card">
          <h3>Interviews</h3>
          <p className="stat-value">{stats.interviews}</p>
        </div>
        
        <div className="stat-card">
          <h3>Offers</h3>
          <p className="stat-value">{stats.offers}</p>
        </div>
      </div>
      
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <p>New responses this week: {stats.recentActivity.newResponsesThisWeek}</p>
        <p>Upcoming interviews: {stats.recentActivity.upcomingInterviews}</p>
      </div>
    </div>
  );
};
```

```tsx
// components/ApplicationsList.tsx
import React, { useState } from 'react';
import { useApplications } from '../hooks/useApplications';
import { ApplicationStatus } from '../types';

export const ApplicationsList: React.FC = () => {
  const [status, setStatus] = useState<ApplicationStatus | undefined>();
  const [page, setPage] = useState(0);
  const limit = 10;

  const { applications, total, loading, refetch } = useApplications({
    status,
    limit,
    offset: page * limit,
    sort: 'desc',
  });

  const handleWithdraw = async (applicationId: number) => {
    if (confirm('Are you sure you want to withdraw this application?')) {
      try {
        await developerService.withdrawApplication(applicationId);
        refetch();
      } catch (error) {
        alert('Failed to withdraw application');
      }
    }
  };

  return (
    <div className="applications-list">
      <h1>My Applications</h1>
      
      {/* Filter buttons */}
      <div className="filters">
        <button onClick={() => setStatus(undefined)}>All</button>
        <button onClick={() => setStatus(ApplicationStatus.APPLIED)}>Applied</button>
        <button onClick={() => setStatus(ApplicationStatus.IN_REVIEW)}>In Review</button>
        <button onClick={() => setStatus(ApplicationStatus.ACCEPTED)}>Accepted</button>
        <button onClick={() => setStatus(ApplicationStatus.REJECTED)}>Rejected</button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {applications.map((app) => (
            <div key={app.id} className="application-card">
              <h3>{app.job?.title}</h3>
              <p>{app.job?.companyName}</p>
              <p>Status: {app.status}</p>
              <p>Applied: {new Date(app.appliedDate).toLocaleDateString()}</p>
              
              {!['ACCEPTED', 'REJECTED'].includes(app.status) && (
                <button onClick={() => handleWithdraw(app.id)}>
                  Withdraw
                </button>
              )}
            </div>
          ))}

          {/* Pagination */}
          <div className="pagination">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </button>
            <span>Page {page + 1} of {Math.ceil(total / limit)}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={(page + 1) * limit >= total}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};
```

```tsx
// components/ResumeUpload.tsx
import React, { useState, useRef } from 'react';
import { developerService } from '../services/developer.service';

export const ResumeUpload: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [resume, setResume] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const allowedTypes = ['application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!allowedTypes.includes(file.type)) {
      alert('Only PDF and DOC/DOCX files are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const data = await developerService.uploadResume(file);
      setResume(data);
      alert('Resume uploaded successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your resume?')) return;

    try {
      await developerService.deleteResume();
      setResume(null);
      alert('Resume deleted successfully');
    } catch (error) {
      alert('Failed to delete resume');
    }
  };

  return (
    <div className="resume-upload">
      <h2>Resume</h2>
      
      {!resume ? (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Resume'}
          </button>
          
          <p>Accepted: PDF, DOC, DOCX (Max 5MB)</p>
        </>
      ) : (
        <div className="resume-info">
          <p>📄 {resume.fileName}</p>
          <p>Size: {(resume.fileSize / 1024).toFixed(2)} KB</p>
          
          <div className="actions">
            <a
              href={`http://localhost:4000${resume.resumeUrl}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View
            </a>
            <button onClick={handleDelete}>Delete</button>
          </div>
        </div>
      )}
    </div>
  );
};
```

---

## ⚠️ Error Handling

### Common HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | Success | Request completed successfully |
| 201 | Created | Resource created (e.g., job, application) |
| 400 | Bad Request | Invalid input, validation errors |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | User doesn't have required role/permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource (e.g., already applied) |
| 500 | Server Error | Internal server error |

### Error Response Format

```typescript
interface ApiError {
  success: false;
  message: string;
  errors: string[];
}
```

### Error Handling Example

```typescript
// utils/errorHandler.ts
import { AxiosError } from 'axios';
import { ApiError } from '../types';

export const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError;
    return apiError?.message || 'An unexpected error occurred';
  }
  return 'Network error. Please check your connection.';
};

// Usage in component
try {
  await jobService.applyToJob(jobId, { coverLetter });
} catch (error) {
  const message = handleApiError(error);
  alert(message);
}
```

---

## 🧪 Testing Guide

### Using cURL

```bash
# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "dev@example.com",
    "password": "password123"
  }'

# Get Dashboard Stats (replace TOKEN)
curl http://localhost:4000/api/developer/dashboard/stats \
  -H "Authorization: Bearer TOKEN"

# Upload Resume
curl -X POST http://localhost:4000/api/developer/resume/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "resume=@/path/to/resume.pdf"
```

### Using Postman

1. **Create Environment Variables:**
   - `baseUrl`: `http://localhost:4000`
   - `accessToken`: (will be set after login)

2. **Login Request:**
   ```
   POST {{baseUrl}}/api/auth/login
   Body: {
     "email": "dev@example.com",
     "password": "password123"
   }
   ```
   
3. **Set Token in Tests Tab:**
   ```javascript
   pm.environment.set("accessToken", pm.response.json().data.accessToken);
   ```

4. **Use Token in Subsequent Requests:**
   ```
   Authorization: Bearer {{accessToken}}
   ```

---

## 🎯 Quick Start Checklist

### For Frontend Developers:

- [ ] Install axios: `npm install axios`
- [ ] Copy TypeScript interfaces from this doc
- [ ] Set up API client with interceptors
- [ ] Create service files (auth, developer, recruiter, job)
- [ ] Create custom hooks for data fetching
- [ ] Implement authentication flow (login, register, logout)
- [ ] Build developer dashboard page
- [ ] Build recruiter dashboard page
- [ ] Implement job listing and application features
- [ ] Add error handling and loading states
- [ ] Test all API endpoints

---

## 📞 Support & Additional Info

### Backend Repository
```
Repository: dev-hire-backend
Branch: main
```

### Documentation Files in Backend Repo:
- `DEVELOPER_API_IMPLEMENTATION_COMPLETE.md` - Detailed developer API docs
- `FRONTEND_DEVELOPER_DASHBOARD_PROMPT.md` - Developer integration guide
- `FRONTEND_RECRUITER_DASHBOARD_PROMPT.md` - Recruiter integration guide
- `DEVELOPER_API_QUICK_REFERENCE.md` - Quick reference card

### Environment Setup
Make sure backend server is running:
```bash
cd devhire-backend
npm run dev
```

Server should be running on: `http://localhost:4000`

---

## 🚀 Ready to Integrate!

You now have everything you need to integrate the DevHire backend into your frontend application. All endpoints are tested, documented, and ready for production use!

**Happy Coding! 🎉**
