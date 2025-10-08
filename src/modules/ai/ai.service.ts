import axios from 'axios';
import { BadRequestError, InternalServerError } from '../../utils/customErrors';

// Type for MCQ question
export type MCQQuestion = {
    question: string;
    options: string[];
    answer: string;
};

// Type for generate questions request
export type GenerateQuestionsData = {
    techStack: string[];
};

/**
 * Service to generate interview questions using Ollama
 */
export const generateInterviewQuestions = async (techStack: string[]): Promise<MCQQuestion[]> => {
    // Validate input
    if (!techStack || !Array.isArray(techStack) || techStack.length === 0) {
        throw BadRequestError('Tech stack must be a non-empty array');
    }

    // Validate tech stack items
    if (techStack.some(tech => typeof tech !== 'string' || tech.trim() === '')) {
        throw BadRequestError('All tech stack items must be non-empty strings');
    }

    // Create the prompt
    const prompt = `You are an expert technical interviewer. Generate exactly 10 multiple choice questions for the following technologies: ${techStack.join(', ')}.

Rules:
1. Each question must have exactly 4 options
2. The "answer" field must be the EXACT TEXT of one of the options (not A/B/C/D, but the full option text)
3. Questions should be beginner to intermediate level
4. Return ONLY valid JSON (no markdown, no explanations, no code blocks)

Example format:
[
  {
    "question": "What is the primary purpose of React hooks?",
    "options": ["To manage state in functional components", "To create class components", "To style components", "To handle routing"],
    "answer": "To manage state in functional components"
  },
  {
    "question": "Which method is used to update state in React?",
    "options": ["setState()", "updateState()", "changeState()", "modifyState()"],
    "answer": "setState()"
  }
]

Generate exactly 10 questions following this exact format. Return ONLY the JSON array.`;

    try {
        // Call Ollama API
        const response = await axios.post<{ response: string }>(
            'http://localhost:11434/api/generate',
            {
                model: 'gemma3',
                prompt: prompt,
                stream: false,
            },
            {
                timeout: 60000, // 60 second timeout
            }
        );

        const rawOutput = response.data.response;

        if (!rawOutput) {
            throw InternalServerError('Empty response from AI service');
        }

        console.log('📝 Received response from Ollama, parsing...');

        // Try to parse the JSON from the response
        const questions = parseAIResponse(rawOutput);

        console.log(`📊 Parsed ${questions.length} questions, normalizing...`);

        // Normalize and validate the parsed questions
        const normalizedQuestions = normalizeQuestions(questions);
        validateQuestions(normalizedQuestions);

        return normalizedQuestions;
    } catch (error: any) {
        console.error('Error calling Ollama service:', error.message);

        if (error.code === 'ECONNREFUSED') {
            throw InternalServerError('Cannot connect to Ollama service. Make sure Ollama is running on localhost:11434');
        }

        if (error.response?.status === 404) {
            throw InternalServerError('Model "gemma3" not found. Please run: ollama pull gemma3');
        }

        if (error.response) {
            throw InternalServerError(`AI service error: ${error.message}`);
        }

        // Re-throw if it's already our custom error
        if (error.status) {
            throw error;
        }

        throw InternalServerError('Failed to generate questions');
    }
};

/**
 * Parse AI response and extract JSON
 */
const parseAIResponse = (rawOutput: string): MCQQuestion[] => {
    try {
        // Try to find JSON array in the response
        // Remove any markdown code blocks
        let cleanOutput = rawOutput
            .replace(/```json\s*/gi, '')
            .replace(/```\s*/gi, '')
            .trim();

        // Try to find JSON array pattern
        const jsonMatch = cleanOutput.match(/\[\s*{[\s\S]*}\s*\]/);

        if (jsonMatch) {
            cleanOutput = jsonMatch[0];
        }

        // Parse JSON
        const parsed = JSON.parse(cleanOutput);

        // Ensure it's an array
        if (!Array.isArray(parsed)) {
            throw new Error('Response is not an array');
        }

        return parsed;
    } catch (error) {
        console.error('JSON parsing error:', error);
        console.error('Raw output:', rawOutput);
        throw BadRequestError('Failed to parse AI response. The AI did not return valid JSON format.');
    }
};

/**
 * Normalize questions to ensure answer matches one of the options exactly
 */
const normalizeQuestions = (questions: any[]): MCQQuestion[] => {
    return questions.map((q, index) => {
        if (!q.options || !Array.isArray(q.options)) {
            return q;
        }

        // Trim all options
        const trimmedOptions = q.options.map((opt: string) => String(opt).trim());
        const trimmedAnswer = String(q.answer || '').trim();

        // Try to find exact match
        let matchedOption = trimmedOptions.find((opt: string) => opt === trimmedAnswer);

        // If no exact match, try case-insensitive match
        if (!matchedOption) {
            matchedOption = trimmedOptions.find((opt: string) =>
                opt.toLowerCase() === trimmedAnswer.toLowerCase()
            );
        }

        // If still no match, try to find if answer is a prefix (like "A" vs "A) Text")
        if (!matchedOption) {
            matchedOption = trimmedOptions.find((opt: string) => {
                // Remove common prefixes like "A)", "A.", "A -", etc.
                const optWithoutPrefix = opt.replace(/^[A-D][\)\.\-\:\s]+/i, '').trim();
                const answerWithoutPrefix = trimmedAnswer.replace(/^[A-D][\)\.\-\:\s]+/i, '').trim();

                return optWithoutPrefix.toLowerCase() === answerWithoutPrefix.toLowerCase() ||
                    opt.toLowerCase().includes(answerWithoutPrefix.toLowerCase());
            });
        }

        // If we found a match, use it as the answer
        if (matchedOption) {
            return {
                question: String(q.question).trim(),
                options: trimmedOptions,
                answer: matchedOption,
            };
        }

        // If still no match, log warning and return as-is (will be caught by validation)
        console.warn(`Question ${index + 1}: Could not normalize answer "${trimmedAnswer}" to match options:`, trimmedOptions);

        return {
            question: String(q.question).trim(),
            options: trimmedOptions,
            answer: trimmedAnswer,
        };
    });
};

/**
 * Validate the structure of questions
 */
const validateQuestions = (questions: any[]): void => {
    if (questions.length === 0) {
        throw BadRequestError('No questions generated');
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];

        if (!q.question || typeof q.question !== 'string') {
            throw BadRequestError(`Question ${i + 1}: Invalid or missing question text`);
        }

        if (!Array.isArray(q.options) || q.options.length !== 4) {
            throw BadRequestError(`Question ${i + 1}: Must have exactly 4 options`);
        }

        if (!q.options.every((opt: any) => typeof opt === 'string' && opt.trim() !== '')) {
            throw BadRequestError(`Question ${i + 1}: All options must be non-empty strings`);
        }

        if (!q.answer || typeof q.answer !== 'string') {
            throw BadRequestError(`Question ${i + 1}: Invalid or missing answer`);
        }

        // After normalization, answer should be one of the options
        if (!q.options.includes(q.answer)) {
            console.error(`Question ${i + 1} validation failed:`);
            console.error('Question:', q.question);
            console.error('Options:', q.options);
            console.error('Answer:', q.answer);
            throw BadRequestError(
                `Question ${i + 1}: Answer must be one of the options. This might be an AI formatting issue. Please try again.`
            );
        }
    }

    // Ensure we have at least 5 questions (Ollama might generate fewer)
    if (questions.length < 5) {
        throw BadRequestError(`Not enough questions generated. Expected 10, got ${questions.length}. Please try again.`);
    }

    console.log(`✅ Successfully validated ${questions.length} questions`);
};
