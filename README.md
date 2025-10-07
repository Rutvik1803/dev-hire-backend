# DevHire Backend

A complete, production-ready job hiring platform backend built with Express.js, TypeScript, Prisma, and PostgreSQL.

## 🚀 Features

### Authentication & Authorization
- ✅ **User Registration (Sign Up)** - Complete with validation and security
- ✅ **User Login** - Secure authentication with JWT tokens
- ✅ **Role-Based Access Control** - Developer, Recruiter, and Admin roles
- ✅ **Access Token Management** - Short-lived tokens (15 minutes)
- ✅ **Refresh Token Management** - Long-lived tokens (7 days) stored in database
- ✅ **HTTP-Only Cookies** - Secure token storage preventing XSS attacks
- ✅ **Password Hashing** - Bcrypt with 10 salt rounds

### Job Management
- ✅ **Job Posting** - Recruiters can create job listings
- ✅ **Job Browsing** - Public access to view all jobs
- ✅ **Job Updates** - Recruiters can edit their job postings
- ✅ **Job Deletion** - Recruiters can remove job listings
- ✅ **Job Filtering** - Filter by skills, type, location

### Application Management (NEW! 🎉)
- ✅ **Job Applications** - Developers can apply to jobs
- ✅ **Cover Letter Support** - Optional cover letter submission
- ✅ **Application Status Tracking** - Applied, In Review, Accepted, Rejected
- ✅ **Recruiter Dashboard** - Real-time statistics and analytics
- ✅ **Application Management** - View, filter, and update applications
- ✅ **Duplicate Prevention** - One application per job per developer
- ✅ **Cascade Deletion** - Applications deleted when job is removed

### Technical Features
- ✅ **Input Validation** - Comprehensive validation at service layer
- ✅ **Error Handling** - Organization-level error handling with proper status codes
- ✅ **TypeScript** - Full type safety throughout the codebase
- ✅ **Prisma ORM** - Modern database toolkit with migrations
- ✅ **Function-Based Architecture** - Clean, maintainable code structure
- ✅ **Database Optimization** - Indexes and efficient queries

## 📋 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd devhire-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the example file and fill in your values:
   ```bash
   cp .env.example .env
   ```
   
   Required variables:
   ```env
   PORT=4000
   NODE_ENV=development
   DATABASE_URL="postgresql://user:password@localhost:5432/devhire?schema=public"
   ACCESS_TOKEN_SECRET=your-access-token-secret-here
   REFRESH_TOKEN_SECRET=your-refresh-token-secret-here
   ```
   
   Generate secure JWT secrets:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma Client
   npx prisma generate
   
   # Run migrations
   npx prisma migrate dev
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```
   
   Server will start on `http://localhost:4000`

## 📚 API Documentation

### Available API Groups

1. **Authentication APIs** - User registration, login, token management
2. **Job Management APIs** - Create, read, update, delete jobs
3. **Application APIs** - Job applications and recruiter dashboard (NEW! 🎉)

### Base URL
```
http://localhost:4000/api
```

### Quick Reference

#### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login

#### Jobs
- `GET /api/jobs` - Get all jobs (public)
- `GET /api/jobs/:id` - Get single job (public)
- `POST /api/jobs` - Create job (recruiter only)
- `PUT /api/jobs/:id` - Update job (recruiter only)
- `DELETE /api/jobs/:id` - Delete job (recruiter only)
- `GET /api/jobs/my/jobs` - Get my jobs (recruiter only)

#### Applications (NEW!)
- `POST /api/jobs/:jobId/apply` - Apply to job (developer only)
- `GET /api/applications/:id` - Get application details
- `GET /api/jobs/:jobId/applications` - Get job applications (recruiter only)
- `PATCH /api/applications/:id/status` - Update status (recruiter only)
- `GET /api/recruiter/dashboard/stats` - Dashboard statistics (recruiter only)
- `GET /api/recruiter/applications/recent` - Recent applications (recruiter only)
- `GET /api/recruiter/applications` - All applications (recruiter only)

### Complete Documentation

- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - General API reference
- **[JOB_API_DOCUMENTATION.md](./JOB_API_DOCUMENTATION.md)** - Job APIs
- **[APPLICATION_API_DOCUMENTATION.md](./APPLICATION_API_DOCUMENTATION.md)** - Application APIs (NEW!)
- **[FRONTEND_INTEGRATION_QUICKSTART.md](./FRONTEND_INTEGRATION_QUICKSTART.md)** - Frontend integration guide
- **[POSTMAN_APPLICATION_TESTING_GUIDE.md](./POSTMAN_APPLICATION_TESTING_GUIDE.md)** - Testing guide

### Sample Request

#### Apply to a Job (Developer)
```http
POST /api/jobs/1/apply
Authorization: Bearer <developer_token>
Content-Type: application/json

{
  "coverLetter": "I am very interested in this position..."
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "id": 1,
    "jobId": 1,
    "applicantId": 5,
    "status": "APPLIED",
    "coverLetter": "I am very interested...",
    "appliedDate": "2025-10-07T12:30:00.000Z"
  }
}
```

#### Get Dashboard Stats (Recruiter)
```http
GET /api/recruiter/dashboard/stats
Authorization: Bearer <recruiter_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "jobsPosted": 5,
    "totalApplicants": 23,
    "inReview": 8,
    "hired": 3,
    "recentActivity": {
      "newApplicationsToday": 2,
      "newApplicationsThisWeek": 7
    }
  }
}
```

## 🧪 Testing

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing instructions.

Quick test with curl:
```bash
# Sign up
curl -X POST http://localhost:4000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","password":"password123"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 📁 Project Structure

```
devhire-backend/
├── prisma/
│   ├── migrations/          # Database migrations
│   └── schema.prisma        # Database schema
├── src/
│   ├── config/
│   │   ├── index.ts         # Environment configuration
│   │   └── prisma.ts        # Prisma client instance
│   ├── middlewares/
│   │   ├── asyncHandler.ts        # Async error handler
│   │   ├── errorHandler.ts        # Global error handler
│   │   ├── authMiddleware.ts      # JWT authentication
│   │   └── authorizationMiddleware.ts # Role-based authorization
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts  # Auth controllers
│   │   │   ├── auth.route.ts       # Auth routes
│   │   │   └── auth.service.ts     # Auth business logic
│   │   ├── job/
│   │   │   ├── job.controller.ts   # Job controllers
│   │   │   ├── job.route.ts        # Job routes
│   │   │   └── job.service.ts      # Job business logic
│   │   └── application/ (NEW!)
│   │       ├── application.controller.ts  # Application controllers
│   │       ├── application.route.ts       # Application routes
│   │       ├── application.service.ts     # Application business logic
│   │       └── README.md                  # Module documentation
│   ├── utils/
│   │   ├── auth.ts          # Auth utilities (hashing, tokens)
│   │   ├── customErrors.ts  # Custom error classes
│   │   ├── response.ts      # Response formatters
│   │   └── userResponse.ts  # User data sanitization
│   └── index.ts             # Application entry point
├── .env.example                           # Environment variables template
├── API_DOCUMENTATION.md                   # API documentation
├── JOB_API_DOCUMENTATION.md               # Job API documentation
├── APPLICATION_API_DOCUMENTATION.md       # Application API docs (NEW!)
├── FRONTEND_INTEGRATION_QUICKSTART.md     # Integration guide (NEW!)
├── POSTMAN_APPLICATION_TESTING_GUIDE.md   # Testing guide (NEW!)
├── IMPLEMENTATION_COMPLETE_SUMMARY.md     # Implementation summary (NEW!)
├── package.json
└── tsconfig.json
```

## 🔐 Security Features

- **Password Hashing** - Bcrypt with 10 salt rounds
- **JWT Tokens** - Separate access and refresh tokens
- **HTTP-Only Cookies** - Prevents XSS attacks
- **Secure Cookies** - HTTPS only in production
- **SameSite Policy** - Prevents CSRF attacks
- **Input Validation** - Comprehensive validation at service layer
- **Error Messages** - Generic messages for authentication failures
- **Token Storage** - Refresh tokens stored in database for validation

## 🛡️ Error Handling

All errors return consistent format:
```json
{
  "status": "error",
  "message": "Error description"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication failures)
- `403` - Forbidden (authorization failures)
- `404` - Not Found
- `409` - Conflict (duplicate resources)
- `500` - Internal Server Error

## 📦 Tech Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** Bcrypt
- **Validation:** Custom validators
- **Code Quality:** ESLint, Prettier
- **Git Hooks:** Husky, lint-staged

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload

# Linting
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues

# Database
npx prisma migrate dev      # Create and apply migrations
npx prisma generate         # Generate Prisma Client
npx prisma studio          # Open Prisma Studio (database GUI)
npx prisma migrate status  # Check migration status
```

## 📖 Documentation

### Getting Started
- **[README.md](./README.md)** - This file (overview and setup)
- **[IMPLEMENTATION_COMPLETE_SUMMARY.md](./IMPLEMENTATION_COMPLETE_SUMMARY.md)** - Complete implementation status

### API Documentation
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Authentication API reference
- **[JOB_API_DOCUMENTATION.md](./JOB_API_DOCUMENTATION.md)** - Job management APIs
- **[APPLICATION_API_DOCUMENTATION.md](./APPLICATION_API_DOCUMENTATION.md)** - Application & dashboard APIs (NEW!)

### Integration & Testing
- **[FRONTEND_INTEGRATION_QUICKSTART.md](./FRONTEND_INTEGRATION_QUICKSTART.md)** - React integration guide with code examples
- **[POSTMAN_APPLICATION_TESTING_GUIDE.md](./POSTMAN_APPLICATION_TESTING_GUIDE.md)** - Step-by-step testing guide
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - General testing instructions

### Technical Details
- **[src/modules/application/README.md](./src/modules/application/README.md)** - Application module documentation
- **[PRISMAREADME.md](./PRISMAREADME.md)** - Prisma-specific documentation
- **[API_IMPLEMENTATION_SUMMARY.md](./API_IMPLEMENTATION_SUMMARY.md)** - Implementation details

## 🎯 Quick Start Guide

### For Backend Development

1. **Setup**
   ```bash
   npm install
   cp .env.example .env
   # Edit .env with your database credentials
   npx prisma migrate dev
   npm run dev
   ```

2. **Test APIs**
   - Open Postman
   - Follow [POSTMAN_APPLICATION_TESTING_GUIDE.md](./POSTMAN_APPLICATION_TESTING_GUIDE.md)

### For Frontend Integration

1. **Read Documentation**
   - Start with [APPLICATION_API_DOCUMENTATION.md](./APPLICATION_API_DOCUMENTATION.md)
   - Review [FRONTEND_INTEGRATION_QUICKSTART.md](./FRONTEND_INTEGRATION_QUICKSTART.md)

2. **Copy Service Code**
   ```javascript
   // All service functions are provided in the integration guide
   // Copy to your frontend: src/services/applicationService.js
   ```

3. **Implement Features**
   - Recruiter Dashboard (statistics, recent applications)
   - Application Management (list, details, status updates)
   - Job Application Form (for developers)

## 🆕 What's New (October 2025)

### Application Management System
- ✅ Complete job application workflow
- ✅ Recruiter dashboard with real-time statistics
- ✅ Application status management (Applied, In Review, Accepted, Rejected)
- ✅ Filter and sort applications
- ✅ View application details with applicant information
- ✅ Recent applications widget
- ✅ Job update and delete functionality
- ✅ Comprehensive documentation and integration guides

### Documentation Enhancements
- ✅ 5 new comprehensive documentation files
- ✅ Frontend integration guide with React code examples
- ✅ Step-by-step Postman testing guide
- ✅ Complete API reference for all endpoints

## 🚧 Future Enhancements

- [ ] Refresh token endpoint
- [ ] Logout endpoint
- [ ] Password reset functionality
- [ ] Email verification
- [ ] Two-factor authentication
- [ ] Rate limiting
- [ ] Account lockout after failed attempts
- [ ] OAuth integration (Google, GitHub)
- [ ] Session management
- [ ] Audit logging

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Code Style

- Follow TypeScript best practices
- Use function-based approach (no classes)
- Maintain separation of concerns (Controller → Service → Database)
- Write descriptive variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Use proper error handling

## 🐛 Troubleshooting

### Server won't start
- Check if PostgreSQL is running
- Verify `.env` file exists with correct values
- Run `npm install` to ensure dependencies are installed

### Database connection errors
- Verify `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running: `pg_isready`
- Run migrations: `npx prisma migrate dev`

### Token errors
- Verify `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` are set
- Ensure secrets are long random strings
- Check token hasn't expired

For more troubleshooting, see [TESTING_GUIDE.md](./TESTING_GUIDE.md)

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

DevHire Team

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using TypeScript, Express, and Prisma**
