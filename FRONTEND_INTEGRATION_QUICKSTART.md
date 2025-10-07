# Frontend Integration Quick Reference

This guide provides quick code examples for integrating the Application & Recruiter Dashboard APIs into your React frontend.

## Table of Contents
1. [Setup](#setup)
2. [Developer APIs](#developer-apis)
3. [Recruiter Dashboard APIs](#recruiter-dashboard-apis)
4. [Application Management APIs](#application-management-apis)
5. [Job Management APIs](#job-management-apis)

---

## Setup

### Base Configuration

```javascript
// src/config/api.js
export const API_BASE_URL = 'http://localhost:3000/api';

export const getAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
});
```

### API Service Base

```javascript
// src/services/apiService.js
import { API_BASE_URL, getAuthHeaders } from '../config/api';

export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(token),
      ...options.headers
    }
  });

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error?.message || 'An error occurred');
  }

  return data;
};
```

---

## Developer APIs

### Apply to a Job

```javascript
// src/services/applicationService.js
import { apiCall } from './apiService';

export const applyToJob = async (jobId, coverLetter) => {
  return await apiCall(`/jobs/${jobId}/apply`, {
    method: 'POST',
    body: JSON.stringify({ coverLetter })
  });
};
```

**Usage in Component**:
```jsx
import { applyToJob } from '../services/applicationService';

function JobDetailsPage() {
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    try {
      setLoading(true);
      const result = await applyToJob(jobId, coverLetter);
      alert('Application submitted successfully!');
      console.log(result.data);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea 
        value={coverLetter}
        onChange={(e) => setCoverLetter(e.target.value)}
        placeholder="Write your cover letter..."
      />
      <button onClick={handleApply} disabled={loading}>
        {loading ? 'Submitting...' : 'Apply Now'}
      </button>
    </div>
  );
}
```

### View My Application

```javascript
export const getApplicationById = async (applicationId) => {
  return await apiCall(`/applications/${applicationId}`);
};
```

---

## Recruiter Dashboard APIs

### Get Dashboard Statistics

```javascript
// src/services/recruiterService.js
import { apiCall } from './apiService';

export const getDashboardStats = async () => {
  return await apiCall('/recruiter/dashboard/stats');
};
```

**Usage in Dashboard Component**:
```jsx
import { useEffect, useState } from 'react';
import { getDashboardStats } from '../services/recruiterService';

function RecruiterDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await getDashboardStats();
        setStats(result.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard">
      <div className="stat-card">
        <h3>Jobs Posted</h3>
        <p>{stats.jobsPosted}</p>
      </div>
      <div className="stat-card">
        <h3>Total Applicants</h3>
        <p>{stats.totalApplicants}</p>
      </div>
      <div className="stat-card">
        <h3>In Review</h3>
        <p>{stats.inReview}</p>
      </div>
      <div className="stat-card">
        <h3>Hired</h3>
        <p>{stats.hired}</p>
      </div>
      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <p>New today: {stats.recentActivity.newApplicationsToday}</p>
        <p>This week: {stats.recentActivity.newApplicationsThisWeek}</p>
      </div>
    </div>
  );
}
```

### Get Recent Applications

```javascript
export const getRecentApplications = async (limit = 10) => {
  return await apiCall(`/recruiter/applications/recent?limit=${limit}`);
};
```

**Usage in Component**:
```jsx
function RecentApplicationsWidget() {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchRecent = async () => {
      const result = await getRecentApplications(5);
      setApplications(result.data);
    };
    fetchRecent();
  }, []);

  return (
    <div className="recent-applications">
      <h3>Recent Applications</h3>
      <ul>
        {applications.map(app => (
          <li key={app.id}>
            <strong>{app.applicant.name}</strong> applied to{' '}
            <em>{app.job.title}</em>
            <span>{new Date(app.appliedDate).toLocaleDateString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## Application Management APIs

### Get All Applications for a Job

```javascript
export const getJobApplications = async (jobId, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.sort) params.append('sort', filters.sort);
  
  const queryString = params.toString();
  const endpoint = `/jobs/${jobId}/applications${queryString ? `?${queryString}` : ''}`;
  
  return await apiCall(endpoint);
};
```

**Usage in Component**:
```jsx
function JobApplicationsList({ jobId }) {
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      const result = await getJobApplications(jobId, { 
        status: statusFilter || undefined 
      });
      setApplications(result.data.data);
    };
    fetchApplications();
  }, [jobId, statusFilter]);

  return (
    <div>
      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
        <option value="">All Status</option>
        <option value="APPLIED">Applied</option>
        <option value="IN_REVIEW">In Review</option>
        <option value="ACCEPTED">Accepted</option>
        <option value="REJECTED">Rejected</option>
      </select>

      <div className="applications-list">
        {applications.map(app => (
          <div key={app.id} className="application-card">
            <h4>{app.applicant.name}</h4>
            <p>Email: {app.applicant.email}</p>
            <p>Experience: {app.applicant.experience}</p>
            <p>Skills: {app.applicant.skills.join(', ')}</p>
            <p>Status: <span className={`status-${app.status}`}>{app.status}</span></p>
            <p>Applied: {new Date(app.appliedDate).toLocaleDateString()}</p>
            <button onClick={() => viewApplication(app.id)}>View Details</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Get All Applications (All Jobs)

```javascript
export const getAllApplications = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.offset) params.append('offset', filters.offset);
  if (filters.recent) params.append('recent', 'true');
  
  const queryString = params.toString();
  return await apiCall(`/recruiter/applications${queryString ? `?${queryString}` : ''}`);
};
```

**Usage with Pagination**:
```jsx
function AllApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const limit = 20;

  useEffect(() => {
    const fetchApplications = async () => {
      const result = await getAllApplications({
        limit,
        offset: page * limit
      });
      setApplications(result.data.data);
      setTotal(result.data.total);
    };
    fetchApplications();
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <h2>All Applications ({total})</h2>
      
      {/* Applications list */}
      <div className="applications-grid">
        {applications.map(app => (
          <ApplicationCard key={app.id} application={app} />
        ))}
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button 
          disabled={page === 0} 
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>
        <span>Page {page + 1} of {totalPages}</span>
        <button 
          disabled={page >= totalPages - 1} 
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

### Update Application Status

```javascript
export const updateApplicationStatus = async (applicationId, status, note) => {
  return await apiCall(`/applications/${applicationId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, note })
  });
};
```

**Usage in Component**:
```jsx
function ApplicationStatusUpdater({ applicationId, currentStatus, onUpdate }) {
  const [status, setStatus] = useState(currentStatus);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await updateApplicationStatus(applicationId, status, note);
      alert('Status updated successfully!');
      onUpdate();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="status-updater">
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option value="APPLIED">Applied</option>
        <option value="IN_REVIEW">In Review</option>
        <option value="ACCEPTED">Accepted</option>
        <option value="REJECTED">Rejected</option>
      </select>

      <textarea
        placeholder="Add a note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <button onClick={handleUpdate} disabled={loading}>
        {loading ? 'Updating...' : 'Update Status'}
      </button>
    </div>
  );
}
```

### View Application Details

```jsx
function ApplicationDetailsPage({ applicationId }) {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const result = await getApplicationById(applicationId);
        setApplication(result.data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [applicationId]);

  if (loading) return <div>Loading...</div>;
  if (!application) return <div>Application not found</div>;

  return (
    <div className="application-details">
      <h2>Application Details</h2>
      
      <section className="applicant-info">
        <h3>Applicant Information</h3>
        <p><strong>Name:</strong> {application.applicant.name}</p>
        <p><strong>Email:</strong> {application.applicant.email}</p>
        <p><strong>Phone:</strong> {application.applicant.phone}</p>
        <p><strong>Experience:</strong> {application.applicant.experience}</p>
        <p><strong>Skills:</strong> {application.applicant.skills.join(', ')}</p>
        
        {application.applicant.resumeUrl && (
          <a href={application.applicant.resumeUrl} target="_blank" rel="noreferrer">
            View Resume
          </a>
        )}
        
        {application.applicant.linkedinUrl && (
          <a href={application.applicant.linkedinUrl} target="_blank" rel="noreferrer">
            LinkedIn Profile
          </a>
        )}
        
        {application.applicant.githubUrl && (
          <a href={application.applicant.githubUrl} target="_blank" rel="noreferrer">
            GitHub Profile
          </a>
        )}
      </section>

      <section className="job-info">
        <h3>Job Information</h3>
        <p><strong>Title:</strong> {application.job.title}</p>
        <p><strong>Company:</strong> {application.job.companyName}</p>
        <p><strong>Location:</strong> {application.job.location}</p>
        <p><strong>Type:</strong> {application.job.jobType}</p>
        <p><strong>Salary:</strong> {application.job.salaryRange}</p>
      </section>

      <section className="application-info">
        <h3>Application Information</h3>
        <p><strong>Status:</strong> {application.status}</p>
        <p><strong>Applied Date:</strong> {new Date(application.appliedDate).toLocaleString()}</p>
        <p><strong>Updated Date:</strong> {new Date(application.updatedDate).toLocaleString()}</p>
        
        {application.coverLetter && (
          <div className="cover-letter">
            <h4>Cover Letter</h4>
            <p>{application.coverLetter}</p>
          </div>
        )}
        
        {application.notes && (
          <div className="notes">
            <h4>Recruiter Notes</h4>
            <p>{application.notes}</p>
          </div>
        )}
      </section>

      <ApplicationStatusUpdater
        applicationId={application.id}
        currentStatus={application.status}
        onUpdate={() => window.location.reload()}
      />
    </div>
  );
}
```

---

## Job Management APIs

### Update Job

```javascript
export const updateJob = async (jobId, jobData) => {
  return await apiCall(`/jobs/${jobId}`, {
    method: 'PUT',
    body: JSON.stringify(jobData)
  });
};
```

**Usage in Component**:
```jsx
function EditJobPage({ jobId }) {
  const [jobData, setJobData] = useState({
    title: '',
    companyName: '',
    location: '',
    jobType: 'FULL_TIME',
    salaryRange: '',
    requiredSkills: [],
    description: ''
  });

  // Load existing job data
  useEffect(() => {
    const fetchJob = async () => {
      const result = await getJobById(jobId);
      setJobData(result.data);
    };
    fetchJob();
  }, [jobId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateJob(jobId, jobData);
      alert('Job updated successfully!');
      // Navigate to job details or job list
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Job Title"
        value={jobData.title}
        onChange={(e) => setJobData({...jobData, title: e.target.value})}
      />
      
      <input
        type="text"
        placeholder="Company Name"
        value={jobData.companyName}
        onChange={(e) => setJobData({...jobData, companyName: e.target.value})}
      />

      <input
        type="text"
        placeholder="Location"
        value={jobData.location}
        onChange={(e) => setJobData({...jobData, location: e.target.value})}
      />

      <select
        value={jobData.jobType}
        onChange={(e) => setJobData({...jobData, jobType: e.target.value})}
      >
        <option value="FULL_TIME">Full Time</option>
        <option value="PART_TIME">Part Time</option>
        <option value="CONTRACT">Contract</option>
        <option value="INTERNSHIP">Internship</option>
      </select>

      <input
        type="text"
        placeholder="Salary Range"
        value={jobData.salaryRange}
        onChange={(e) => setJobData({...jobData, salaryRange: e.target.value})}
      />

      <textarea
        placeholder="Description"
        value={jobData.description}
        onChange={(e) => setJobData({...jobData, description: e.target.value})}
      />

      <button type="submit">Update Job</button>
    </form>
  );
}
```

### Delete Job

```javascript
export const deleteJob = async (jobId) => {
  return await apiCall(`/jobs/${jobId}`, {
    method: 'DELETE'
  });
};
```

**Usage in Component**:
```jsx
function DeleteJobButton({ jobId, onDelete }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this job? This will also delete all applications.')) {
      return;
    }

    try {
      setLoading(true);
      await deleteJob(jobId);
      alert('Job deleted successfully!');
      onDelete();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      disabled={loading}
      className="btn-danger"
    >
      {loading ? 'Deleting...' : 'Delete Job'}
    </button>
  );
}
```

---

## Complete Service File

Here's a complete `applicationService.js` file:

```javascript
// src/services/applicationService.js
import { apiCall } from './apiService';

// Developer APIs
export const applyToJob = async (jobId, coverLetter) => {
  return await apiCall(`/jobs/${jobId}/apply`, {
    method: 'POST',
    body: JSON.stringify({ coverLetter })
  });
};

export const getApplicationById = async (applicationId) => {
  return await apiCall(`/applications/${applicationId}`);
};

// Recruiter APIs
export const getDashboardStats = async () => {
  return await apiCall('/recruiter/dashboard/stats');
};

export const getRecentApplications = async (limit = 10) => {
  return await apiCall(`/recruiter/applications/recent?limit=${limit}`);
};

export const getAllApplications = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.offset) params.append('offset', filters.offset);
  if (filters.recent) params.append('recent', 'true');
  
  const queryString = params.toString();
  return await apiCall(`/recruiter/applications${queryString ? `?${queryString}` : ''}`);
};

export const getJobApplications = async (jobId, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.sort) params.append('sort', filters.sort);
  
  const queryString = params.toString();
  const endpoint = `/jobs/${jobId}/applications${queryString ? `?${queryString}` : ''}`;
  
  return await apiCall(endpoint);
};

export const updateApplicationStatus = async (applicationId, status, note) => {
  return await apiCall(`/applications/${applicationId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, note })
  });
};

// Job Management APIs
export const updateJob = async (jobId, jobData) => {
  return await apiCall(`/jobs/${jobId}`, {
    method: 'PUT',
    body: JSON.stringify(jobData)
  });
};

export const deleteJob = async (jobId) => {
  return await apiCall(`/jobs/${jobId}`, {
    method: 'DELETE'
  });
};
```

---

## Error Handling Best Practices

```javascript
// src/utils/errorHandler.js
export const handleApiError = (error) => {
  if (error.message.includes('401')) {
    // Token expired or invalid
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
    return 'Session expired. Please login again.';
  }
  
  if (error.message.includes('403')) {
    return 'You do not have permission to perform this action.';
  }
  
  if (error.message.includes('404')) {
    return 'The requested resource was not found.';
  }
  
  if (error.message.includes('409')) {
    return 'This action conflicts with existing data.';
  }
  
  return error.message || 'An unexpected error occurred.';
};
```

**Usage**:
```javascript
try {
  await applyToJob(jobId, coverLetter);
} catch (error) {
  const errorMessage = handleApiError(error);
  alert(errorMessage);
}
```

---

## Custom Hooks

### useApplications Hook

```javascript
// src/hooks/useApplications.js
import { useState, useEffect } from 'react';
import { getAllApplications } from '../services/applicationService';

export const useApplications = (filters = {}) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const result = await getAllApplications(filters);
        setApplications(result.data.data);
        setTotal(result.data.total);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [JSON.stringify(filters)]);

  return { applications, loading, error, total };
};
```

**Usage**:
```jsx
function ApplicationsList() {
  const { applications, loading, error, total } = useApplications({
    status: 'APPLIED',
    limit: 20
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Applications ({total})</h2>
      {applications.map(app => (
        <ApplicationCard key={app.id} application={app} />
      ))}
    </div>
  );
}
```

### useDashboardStats Hook

```javascript
// src/hooks/useDashboardStats.js
import { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/applicationService';

export const useDashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = async () => {
    try {
      setLoading(true);
      const result = await getDashboardStats();
      setStats(result.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return { stats, loading, error, refetch };
};
```

---

## TypeScript Types (Bonus)

```typescript
// src/types/application.ts
export enum ApplicationStatus {
  APPLIED = 'APPLIED',
  IN_REVIEW = 'IN_REVIEW',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED'
}

export interface Applicant {
  id: number;
  name: string;
  email: string;
  phone?: string;
  experience?: string;
  skills: string[];
  resumeUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
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
  applicant: Applicant;
  job?: {
    id: number;
    title: string;
    companyName: string;
    location?: string;
  };
}

export interface DashboardStats {
  jobsPosted: number;
  totalApplicants: number;
  inReview: number;
  hired: number;
  recentActivity: {
    newApplicationsToday: number;
    newApplicationsThisWeek: number;
  };
}
```

---

## Summary

This quick reference provides all the code you need to integrate the Application & Recruiter Dashboard APIs into your React frontend. Key points:

1. **Authentication**: Always include JWT token in headers
2. **Error Handling**: Use try-catch blocks and handle errors gracefully
3. **Loading States**: Show loading indicators during API calls
4. **Pagination**: Implement pagination for large datasets
5. **Real-time Updates**: Refetch data after mutations

For complete API documentation, refer to `APPLICATION_API_DOCUMENTATION.md`.

---

**Last Updated**: October 7, 2025
