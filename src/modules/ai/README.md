# AI Module - Interview Questions Generator

This module provides AI-powered interview question generation using Ollama's local LLM.

## Overview

The AI module generates multiple-choice questions (MCQs) for technical interviews based on specified technology stacks. It uses Ollama running locally with the Gemma model.

## Features

- ✅ Generate 10 MCQ questions based on tech stack
- ✅ Each question has 4 options with 1 correct answer
- ✅ Beginner to intermediate difficulty level
- ✅ Validates AI response format
- ✅ Error handling for AI service issues
- ✅ Clean JSON parsing with fallback mechanisms

## Prerequisites

### 1. Install Ollama

**macOS:**
```bash
# Download from https://ollama.ai
# Or use Homebrew
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Pull the Gemma Model

```bash
# Pull the smaller 2B model (faster, lighter)
ollama pull gemma2:2b

# Or use the larger model (better quality)
ollama pull gemma2:9b
```

### 3. Start Ollama Service

```bash
# Start Ollama (runs on http://localhost:11434 by default)
ollama serve

# Or in a separate terminal, just run:
ollama run gemma2:2b
```

### 4. Verify Ollama is Running

```bash
curl http://localhost:11434/api/version
```

## API Endpoint

### Generate Interview Questions

**Endpoint:** `POST /api/ai/generate-questions`

**Access:** Public (can be protected with authentication if needed)

**Request Body:**
```json
{
  "techStack": ["React", "Node.js", "TypeScript"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Interview questions generated successfully",
  "data": {
    "questions": [
      {
        "question": "What is the virtual DOM in React?",
        "options": [
          "A lightweight copy of the actual DOM",
          "A database for React components",
          "A CSS framework",
          "A routing library"
        ],
        "answer": "A lightweight copy of the actual DOM"
      },
      {
        "question": "Which method is used to create a server in Node.js?",
        "options": [
          "http.createServer()",
          "server.create()",
          "node.newServer()",
          "express.start()"
        ],
        "answer": "http.createServer()"
      }
      // ... 8 more questions
    ],
    "count": 10,
    "techStack": ["React", "Node.js", "TypeScript"]
  }
}
```

**Error Responses:**

```json
// 400 Bad Request - Invalid input
{
  "status": "error",
  "message": "Tech stack must be a non-empty array"
}

// 500 Internal Server Error - Ollama not running
{
  "status": "error",
  "message": "Cannot connect to Ollama service. Make sure Ollama is running on localhost:11434"
}

// 500 Internal Server Error - Model not found
{
  "status": "error",
  "message": "Model \"gemma2:2b\" not found. Please run: ollama pull gemma2:2b"
}
```

## Usage Examples

### Using curl

```bash
curl -X POST http://localhost:4000/api/ai/generate-questions \
  -H "Content-Type: application/json" \
  -d '{
    "techStack": ["React", "Node.js", "Express", "MongoDB"]
  }'
```

### Using JavaScript/TypeScript

```typescript
const response = await fetch('http://localhost:4000/api/ai/generate-questions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    techStack: ['Python', 'Django', 'PostgreSQL'],
  }),
});

const data = await response.json();
console.log(data.data.questions);
```

### Using Axios (Frontend)

```typescript
import axios from 'axios';

const generateQuestions = async (techStack: string[]) => {
  try {
    const response = await axios.post(
      'http://localhost:4000/api/ai/generate-questions',
      { techStack }
    );
    
    return response.data.data.questions;
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
};

// Usage
const questions = await generateQuestions(['React', 'TypeScript', 'Node.js']);
```

## Module Structure

```
src/modules/ai/
├── ai.service.ts      # Business logic for AI question generation
├── ai.controller.ts   # HTTP request handling
├── ai.route.ts        # Route definitions
└── README.md          # This file
```

## Implementation Details

### Service Layer (`ai.service.ts`)

**Functions:**
- `generateInterviewQuestions(techStack)` - Main function to generate questions
- `parseAIResponse(rawOutput)` - Parse and clean AI response
- `validateQuestions(questions)` - Validate question structure

**Features:**
- Input validation
- Ollama API integration
- JSON parsing with fallback
- Response validation
- Error handling

### Controller Layer (`ai.controller.ts`)

- Handles HTTP requests
- Calls service layer
- Returns formatted responses

### Route Layer (`ai.route.ts`)

- Defines API endpoints
- Uses asyncHandler for error handling

## Configuration

The module uses these settings:

```typescript
// Ollama API endpoint
const OLLAMA_URL = 'http://localhost:11434/api/generate';

// Model name
const MODEL = 'gemma2:2b';

// Request timeout
const TIMEOUT = 60000; // 60 seconds

// Minimum questions required
const MIN_QUESTIONS = 5;

// Expected questions
const EXPECTED_QUESTIONS = 10;
```

## Error Handling

The module handles these error scenarios:

1. **Invalid Input**: Empty or invalid tech stack
2. **Connection Error**: Ollama service not running
3. **Model Not Found**: Gemma model not pulled
4. **Parsing Error**: AI response not valid JSON
5. **Validation Error**: Questions don't meet requirements
6. **Timeout**: Request takes too long (60s)

## Validation Rules

Questions must meet these criteria:

- Each question has a `question` field (non-empty string)
- Each question has exactly 4 `options` (array of strings)
- Each question has an `answer` (string)
- Answer must be one of the 4 options
- Minimum 5 questions generated (ideally 10)

## Performance

- **Average response time**: 10-30 seconds (depends on model and hardware)
- **gemma2:2b**: Faster, lighter (2GB model)
- **gemma2:9b**: Slower, better quality (9GB model)

## Tips for Best Results

1. **Be specific with tech stack:**
   ```json
   // Good
   { "techStack": ["React Hooks", "Express.js REST APIs", "MongoDB Aggregation"] }
   
   // Less specific
   { "techStack": ["Frontend", "Backend", "Database"] }
   ```

2. **Limit tech stack to 3-5 technologies** for focused questions

3. **Use common technology names** that the AI model knows

4. **Ensure Ollama has enough resources** (RAM/CPU)

## Troubleshooting

### Ollama not connecting

```bash
# Check if Ollama is running
curl http://localhost:11434/api/version

# Start Ollama
ollama serve

# Or run a model directly
ollama run gemma2:2b
```

### Model not found

```bash
# Pull the model
ollama pull gemma2:2b

# List available models
ollama list
```

### Slow responses

- Use smaller model: `gemma2:2b` instead of `gemma2:9b`
- Reduce number of questions in prompt
- Ensure sufficient system resources

### Invalid JSON responses

The service includes fallback parsing:
1. Removes markdown code blocks
2. Extracts JSON array pattern
3. Validates structure
4. Returns helpful error messages

## Future Enhancements

- [ ] Add authentication/authorization
- [ ] Cache generated questions
- [ ] Support difficulty levels (easy, medium, hard)
- [ ] Support different question types (true/false, short answer)
- [ ] Rate limiting to prevent abuse
- [ ] Question history and analytics
- [ ] Custom prompt templates
- [ ] Support multiple AI models
- [ ] Batch question generation

## Security Considerations

- Currently public endpoint (add authentication if needed)
- Validates all input before processing
- Sanitizes AI responses
- Has timeout protection
- No sensitive data in prompts

## Example Frontend Integration (React)

```typescript
// src/services/aiService.ts
export const generateInterviewQuestions = async (techStack: string[]) => {
  const response = await fetch('http://localhost:4000/api/ai/generate-questions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ techStack }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate questions');
  }

  const data = await response.json();
  return data.data.questions;
};

// src/components/InterviewQuiz.tsx
import { useState } from 'react';
import { generateInterviewQuestions } from '../services/aiService';

export const InterviewQuiz = () => {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const techStack = ['React', 'TypeScript', 'Node.js'];
      const generatedQuestions = await generateInterviewQuestions(techStack);
      setQuestions(generatedQuestions);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Questions'}
      </button>
      
      {questions.map((q, idx) => (
        <div key={idx}>
          <h3>{q.question}</h3>
          {q.options.map((opt, optIdx) => (
            <div key={optIdx}>{opt}</div>
          ))}
        </div>
      ))}
    </div>
  );
};
```

## Testing

```bash
# Make sure Ollama is running
ollama run gemma2:2b

# Start the backend
npm run dev

# Test the endpoint
curl -X POST http://localhost:4000/api/ai/generate-questions \
  -H "Content-Type: application/json" \
  -d '{"techStack": ["JavaScript", "React", "Node.js"]}'
```

---

**Note:** The first request might be slower as Ollama loads the model into memory. Subsequent requests will be faster.
