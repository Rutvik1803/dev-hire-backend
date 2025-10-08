#!/bin/bash

# AI Interview Questions API - Test Script
# This script tests the /api/ai/generate-questions endpoint

echo "🚀 Testing AI Interview Questions API"
echo "======================================"
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

# Test 1: React & Node.js Stack
echo "📝 Step 3: Testing with React & Node.js..."
echo "Request: {\"techStack\": [\"React\", \"Node.js\", \"TypeScript\"]}"
echo ""
curl -X POST http://localhost:4000/api/ai/generate-questions \
  -H "Content-Type: application/json" \
  -d '{
    "techStack": ["React", "Node.js", "TypeScript"]
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  2>/dev/null

echo ""
echo "======================================"
echo ""

# Test 2: Invalid request (empty array)
echo "📝 Step 4: Testing error handling (empty tech stack)..."
echo "Request: {\"techStack\": []}"
echo ""
curl -X POST http://localhost:4000/api/ai/generate-questions \
  -H "Content-Type: application/json" \
  -d '{
    "techStack": []
  }' \
  -w "\n\nHTTP Status: %{http_code}\n" \
  2>/dev/null

echo ""
echo "======================================"
echo "✅ Testing complete!"
echo ""
echo "💡 Tips:"
echo "   - First request takes 20-40 seconds (model loads into memory)"
echo "   - Subsequent requests are faster (10-20 seconds)"
echo "   - You can test with different tech stacks"
echo ""
echo "📚 More examples in AI_API_TEST_GUIDE.md"
