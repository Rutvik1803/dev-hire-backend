# DevHire Backend - PostgreSQL with Prisma Setup

This README provides a comprehensive guide for setting up PostgreSQL database connection using Prisma ORM in this Node.js/TypeScript backend project.

## 🗄️ Database Setup Overview

This project uses:
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Language**: TypeScript
- **Framework**: Express.js

## 📋 Prerequisites

Before setting up the database connection, ensure you have:

1. **Node.js** (v14 or higher)
2. **PostgreSQL** installed locally or access to a PostgreSQL database
3. **npm** or **yarn** package manager

## 🚀 Initial Setup

### 1. Install Dependencies

```bash
npm install
```

Key Prisma-related dependencies:
- `@prisma/client`: Prisma Client for database queries
- `prisma`: Prisma CLI for migrations and schema management

### 2. Environment Variables Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# Server Configuration
PORT=4000

# Additional Database Config (if needed)
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=devhire_db
```

**Important**: Replace the placeholders with your actual PostgreSQL credentials.

## 🔧 Prisma Configuration

### Schema File Location
The Prisma schema is located at: `prisma/schema.prisma`

### Current Schema Structure

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int           @id @default(autoincrement())
  email     String        @unique
  password  String
  name      String
  role      Role          @default(USER)
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
  tokens    RefreshToken[]
}

model RefreshToken {
  id        Int      @id @default(autoincrement())
  token     String
  user      User     @relation(fields: [userId], references: [id])
  userId    Int
  createdAt DateTime @default(now())
  expiresAt DateTime
}

enum Role {
  USER
  ADMIN
}
```

## 🔄 Database Migration Commands

### Generate Prisma Client
```bash
npx prisma generate
```

### Create and Apply Migration
```bash
npx prisma migrate dev --name init
```

### Reset Database (Development only)
```bash
npx prisma migrate reset
```

### Check Migration Status
```bash
npx prisma migrate status
```

### View Database in Prisma Studio
```bash
npx prisma studio
```

## 📊 Using Prisma Client in Code

### 1. Initialize Prisma Client

Create a database client file (e.g., `src/lib/prisma.ts`):

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
```

### 2. Example Usage in Routes

```typescript
import prisma from './lib/prisma';

// Create a user
app.post('/users', async (req, res) => {
  try {
    const user = await prisma.user.create({
      data: {
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
      },
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all users
app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        tokens: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 🔍 Common Prisma Operations

### Create
```typescript
const user = await prisma.user.create({
  data: {
    email: "user@example.com",
    password: "hashedPassword",
    name: "John Doe"
  }
});
```

### Read
```typescript
// Find unique
const user = await prisma.user.findUnique({
  where: { email: "user@example.com" }
});

// Find many with filtering
const users = await prisma.user.findMany({
  where: { role: "USER" },
  include: { tokens: true }
});
```

### Update
```typescript
const updatedUser = await prisma.user.update({
  where: { id: 1 },
  data: { name: "Jane Doe" }
});
```

### Delete
```typescript
const deletedUser = await prisma.user.delete({
  where: { id: 1 }
});
```

## 🛠️ Development Workflow

### 1. Making Schema Changes
1. Modify `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name description_of_change`
3. The Prisma Client will be automatically regenerated

### 2. Database Seeding (Optional)
Create `prisma/seed.ts` for initial data:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: 'hashedPassword',
      name: 'Admin User',
      role: 'ADMIN',
    },
  });
  console.log({ admin });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

## 🚨 Troubleshooting

### Common Issues and Solutions

1. **Connection Error**: Verify DATABASE_URL format and credentials
2. **Migration Issues**: Use `npx prisma migrate reset` in development
3. **Client Generation**: Run `npx prisma generate` after schema changes
4. **Port Conflicts**: Check if PostgreSQL is running on the expected port (default: 5432)

### Database Connection Test
```typescript
// Add this to test database connectivity
prisma.$connect()
  .then(() => console.log('Database connected successfully'))
  .catch((error) => console.error('Database connection failed:', error));
```

## 📚 Useful Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API Reference](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)

## 🏃‍♂️ Quick Start Commands

```bash
# Start development server
npm run dev

# Generate Prisma Client
npx prisma generate

# Apply database migrations
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio

# Reset database (development)
npx prisma migrate reset
```

---

**Note**: Always backup your database before running migrations in production environments.
