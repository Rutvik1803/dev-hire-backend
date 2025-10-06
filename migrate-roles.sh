#!/bin/bash

# Migration Script for Role-Based Authentication
# This script will reset the database and apply new schema

echo "🔄 Starting Role-Based Authentication Migration..."
echo ""

echo "⚠️  WARNING: This will delete all existing data!"
echo "This is recommended for development only."
echo ""

read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Migration cancelled."
    exit 0
fi

echo ""
echo "📦 Step 1: Resetting database..."
npx prisma migrate reset --force --skip-seed

echo ""
echo "🔧 Step 2: Creating new migration..."
npx prisma migrate dev --name add_developer_recruiter_roles

echo ""
echo "✨ Step 3: Generating Prisma Client..."
npx prisma generate

echo ""
echo "✅ Migration completed successfully!"
echo ""
echo "🧪 You can now test with:"
echo "   - Sign up with role: DEVELOPER or RECRUITER"
echo "   - Login with role: DEVELOPER, RECRUITER, or ADMIN"
echo ""
echo "📖 See ROLE_BASED_AUTH_UPDATE.md for API details"
