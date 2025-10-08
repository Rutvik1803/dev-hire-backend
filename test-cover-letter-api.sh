#!/bin/bash

# Cover Letter Generation API - Test Script

echo "🚀 Testing Cover Letter Generation API"
echo "======================================="
echo ""

# Check if Ollama is running
echo "📝 Step 1: Checking if Ollama is running..."
if curl -s http://localhost:11434/api/version > /dev/null 2>&1; then
    echo "✅ Ollama is running"
else
    echo "❌ Ollama is not running!"
    echo "   Please run: ollama run gemma3"
    exit 1
fi
echo ""

# Check if backend is running
echo "📝 Step 2: Checking if backend is running..."
if curl -s http://localhost:4000 > /dev/null 2>&1; then
    echo "✅ Backend is running on port 4000"
else
    echo "❌ Backend is not running!"
    echo "   Please run: npm run dev"
    exit 1
fi
echo ""

# Test 1: Minimal Request (Required Fields Only)
echo "📝 Step 3: Testing with minimal required fields..."
echo "Request: Basic user and job info"
echo ""
curl -X POST http://localhost:4000/api/ai/generate-cover-letter \
  -H "Content-Type: application/json" \
  -d '{
    "userDetails": {
      "name": "John Doe"
    },
    "jobDescription": {
      "title": "Software Developer",
      "companyName": "TechCorp",
      "description": "We are looking for a talented software developer to join our team."
    }
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  2>/dev/null

echo ""
echo "======================================"
echo ""

# Test 2: Complete Request (All Fields)
echo "📝 Step 4: Testing with complete user and job details..."
echo "Request: Full profile with experience and skills"
echo ""
curl -X POST http://localhost:4000/api/ai/generate-cover-letter \
  -H "Content-Type: application/json" \
  -d '{
    "userDetails": {
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "experience": "5 years of full-stack development",
      "skills": ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
      "phone": "+1-555-0123",
      "linkedinUrl": "https://linkedin.com/in/janesmith",
      "githubUrl": "https://github.com/janesmith"
    },
    "jobDescription": {
      "title": "Senior Full Stack Developer",
      "companyName": "InnovateTech Inc.",
      "description": "We are seeking an experienced Full Stack Developer to lead our product development team. The ideal candidate will have strong expertise in React, Node.js, and cloud technologies.",
      "requiredSkills": ["React", "Node.js", "TypeScript", "AWS", "Docker"],
      "location": "San Francisco, CA",
      "jobType": "FULL_TIME"
    }
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  2>/dev/null

echo ""
echo "======================================"
echo ""

# Test 3: Error Handling - Missing Required Fields
echo "📝 Step 5: Testing error handling (missing required fields)..."
echo "Request: Missing company name"
echo ""
curl -X POST http://localhost:4000/api/ai/generate-cover-letter \
  -H "Content-Type: application/json" \
  -d '{
    "userDetails": {
      "name": "Test User"
    },
    "jobDescription": {
      "title": "Developer"
    }
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  2>/dev/null

echo ""
echo "======================================"
echo "✅ Testing complete!"
echo ""
echo "💡 Tips:"
echo "   - First request takes 20-50 seconds (model loads and generates longer text)"
echo "   - Subsequent requests are faster"
echo "   - More details = better, more personalized cover letter"
echo "   - Generated cover letters are 250-400 words"
echo ""
echo "📚 Full documentation: COVER_LETTER_API_DOCUMENTATION.md"
