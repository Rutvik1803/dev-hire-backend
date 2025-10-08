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

// Type for user details
export type UserDetails = {
    name: string;
    email?: string;
    experience?: string;
    skills?: string[];
    phone?: string;
    linkedinUrl?: string;
    githubUrl?: string;
};

// Type for job description
export type JobDescription = {
    title: string;
    companyName: string;
    description: string;
    requiredSkills?: string[];
    location?: string;
    jobType?: string;
};

// Type for generate cover letter request
export type GenerateCoverLetterData = {
    userDetails: UserDetails;
    jobDescription: JobDescription;
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

/**
 * Service to generate cover letter using Ollama
 */
export const generateCoverLetter = async (
    userDetails: UserDetails,
    jobDescription: JobDescription
): Promise<string> => {
    // Validate user details
    if (!userDetails || !userDetails.name) {
        throw BadRequestError('User name is required');
    }

    // Validate job description
    if (!jobDescription || !jobDescription.title || !jobDescription.companyName) {
        throw BadRequestError('Job title and company name are required');
    }

    // Build user information string
    const userInfo = buildUserInfoString(userDetails);
    const jobInfo = buildJobInfoString(jobDescription);

    // Create the prompt for cover letter
    const prompt = `You are a professional career advisor and expert cover letter writer.

Generate a compelling, professional cover letter for the following candidate applying to this job.

CANDIDATE INFORMATION:
${userInfo}

JOB DETAILS:
${jobInfo}

REQUIREMENTS:
1. Write a professional, personalized cover letter (250-400 words)
2. Highlight relevant skills and experience that match the job requirements
3. Show enthusiasm for the role and company
4. Use a professional yet conversational tone
5. Include proper formatting with paragraphs
6. Do NOT include placeholder fields like [Your Name], [Date], or addresses
7. Start directly with the opening paragraph
8. End with a professional closing

Return ONLY the cover letter text, no additional formatting, no markdown, no explanations.`;

    try {
        console.log('📝 Generating cover letter with Ollama...');

        // Call Ollama API
        const response = await axios.post<{ response: string }>(
            'http://localhost:11434/api/generate',
            {
                model: 'gemma3',
                prompt: prompt,
                stream: false,
            },
            {
                timeout: 90000, // 90 second timeout (longer for cover letters)
            }
        );

        const rawOutput = response.data.response;

        if (!rawOutput) {
            throw InternalServerError('Empty response from AI service');
        }

        console.log('📝 Received cover letter from Ollama, processing...');

        // Clean up the cover letter
        const coverLetter = cleanCoverLetter(rawOutput);

        // Validate cover letter
        validateCoverLetter(coverLetter);

        console.log('✅ Successfully generated cover letter');

        return coverLetter;
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

        throw InternalServerError('Failed to generate cover letter');
    }
};

/**
 * Build user information string for prompt
 */
const buildUserInfoString = (userDetails: UserDetails): string => {
    const parts: string[] = [];

    parts.push(`Name: ${userDetails.name}`);

    if (userDetails.email) {
        parts.push(`Email: ${userDetails.email}`);
    }

    if (userDetails.experience) {
        parts.push(`Experience: ${userDetails.experience}`);
    }

    if (userDetails.skills && userDetails.skills.length > 0) {
        parts.push(`Skills: ${userDetails.skills.join(', ')}`);
    }

    if (userDetails.phone) {
        parts.push(`Phone: ${userDetails.phone}`);
    }

    if (userDetails.linkedinUrl) {
        parts.push(`LinkedIn: ${userDetails.linkedinUrl}`);
    }

    if (userDetails.githubUrl) {
        parts.push(`GitHub: ${userDetails.githubUrl}`);
    }

    return parts.join('\n');
};

/**
 * Build job information string for prompt
 */
const buildJobInfoString = (jobDescription: JobDescription): string => {
    const parts: string[] = [];

    parts.push(`Position: ${jobDescription.title}`);
    parts.push(`Company: ${jobDescription.companyName}`);

    if (jobDescription.description) {
        parts.push(`Description: ${jobDescription.description}`);
    }

    if (jobDescription.location) {
        parts.push(`Location: ${jobDescription.location}`);
    }

    if (jobDescription.jobType) {
        parts.push(`Job Type: ${jobDescription.jobType}`);
    }

    if (jobDescription.requiredSkills && jobDescription.requiredSkills.length > 0) {
        parts.push(`Required Skills: ${jobDescription.requiredSkills.join(', ')}`);
    }

    return parts.join('\n');
};

/**
 * Clean up cover letter text
 */
const cleanCoverLetter = (rawOutput: string): string => {
    let cleaned = rawOutput.trim();

    // Remove markdown code blocks
    cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
    cleaned = cleaned.replace(/```/g, '');

    // Remove common placeholder patterns
    cleaned = cleaned.replace(/\[Your Name\]/gi, '');
    cleaned = cleaned.replace(/\[Date\]/gi, '');
    cleaned = cleaned.replace(/\[Your Address\]/gi, '');
    cleaned = cleaned.replace(/\[Company Address\]/gi, '');
    cleaned = cleaned.replace(/\[Hiring Manager\]/gi, 'Hiring Manager');
    cleaned = cleaned.replace(/\[Company Name\]/gi, '');
    cleaned = cleaned.replace(/\[Position Title\]/gi, '');

    // Remove any remaining square brackets with content
    cleaned = cleaned.replace(/\[.*?\]/g, '');

    // Clean up multiple newlines
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    // Remove leading/trailing whitespace
    cleaned = cleaned.trim();

    return cleaned;
};

/**
 * Validate cover letter content
 */
const validateCoverLetter = (coverLetter: string): void => {
    if (!coverLetter || coverLetter.length < 100) {
        throw BadRequestError('Generated cover letter is too short or empty. Please try again.');
    }

    if (coverLetter.length > 5000) {
        throw BadRequestError('Generated cover letter is too long. Please try again.');
    }

    // Check for remaining placeholders
    const placeholderPattern = /\[.*?\]/;
    if (placeholderPattern.test(coverLetter)) {
        console.warn('Cover letter contains placeholders, but proceeding...');
    }
};
