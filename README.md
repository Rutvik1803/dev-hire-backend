# DevHire Backend

A secure, production-ready authentication system built with Express.js, TypeScript, Prisma, and PostgreSQL.

## 🚀 Features

- ✅ **User Registration (Sign Up)** - Complete with validation and security
- ✅ **User Login** - Secure authentication with JWT tokens
- ✅ **Access Token Management** - Short-lived tokens (15 minutes)
- ✅ **Refresh Token Management** - Long-lived tokens (7 days) stored in database
- ✅ **HTTP-Only Cookies** - Secure token storage preventing XSS attacks
- ✅ **Password Hashing** - Bcrypt with 10 salt rounds
- ✅ **Input Validation** - Comprehensive validation at service layer
- ✅ **Error Handling** - Organization-level error handling with proper status codes
- ✅ **TypeScript** - Full type safety throughout the codebase
- ✅ **Prisma ORM** - Modern database toolkit with migrations
- ✅ **Function-Based Architecture** - Clean, maintainable code structure

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

### Base URL
```
http://localhost:4000/api/auth
```

### Endpoints

#### 1. Sign Up
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "createdAt": "2025-10-06T10:00:00.000Z",
      "updatedAt": "2025-10-06T10:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "createdAt": "2025-10-06T10:00:00.000Z",
      "updatedAt": "2025-10-06T10:00:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

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
│   │   ├── asyncHandler.ts  # Async error handler
│   │   └── errorHandler.ts  # Global error handler
│   ├── modules/
│   │   └── auth/
│   │       ├── auth.controller.ts  # Auth controllers
│   │       ├── auth.route.ts       # Auth routes
│   │       └── auth.service.ts     # Auth business logic
│   ├── utils/
│   │   ├── auth.ts          # Auth utilities (hashing, tokens)
│   │   ├── customErrors.ts  # Custom error classes
│   │   ├── response.ts      # Response formatters
│   │   └── userResponse.ts  # User data sanitization
│   └── index.ts             # Application entry point
├── .env.example             # Environment variables template
├── API_DOCUMENTATION.md     # Complete API documentation
├── IMPLEMENTATION_SUMMARY.md # Implementation details
├── TESTING_GUIDE.md         # Testing instructions
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

- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Technical implementation details
- [Testing Guide](./TESTING_GUIDE.md) - How to test the application
- [Prisma README](./PRISMAREADME.md) - Prisma-specific documentation

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
