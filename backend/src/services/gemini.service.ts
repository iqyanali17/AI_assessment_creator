import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '@/config/config';
import { Difficulty } from '@/types/enums';

// Initialize the Google Generative AI SDK with the API key from environment variables
const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const GEMINI_RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
const GEMINI_RETRY_DELAY_MS = 1000;
const GEMINI_MAX_ATTEMPTS_PER_MODEL = 2;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getGeminiModels = () => {
  const configuredModels = [
    env.GEMINI_MODEL,
    ...env.GEMINI_FALLBACK_MODELS.split(',').map((model) => model.trim()),
  ].filter(Boolean);

  return Array.from(new Set(configuredModels));
};

const getErrorStatus = (error: unknown) => {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    return Number((error as { status?: unknown }).status);
  }

  return undefined;
};

const isRetryableGeminiError = (error: unknown) => {
  const status = getErrorStatus(error);
  return status ? GEMINI_RETRYABLE_STATUS_CODES.has(status) : false;
};

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : 'Unknown Gemini error.';
};

const normalizeDifficulty = (difficulty: unknown) => {
  const normalized = String(difficulty || Difficulty.MEDIUM).toLowerCase();

  if (normalized === 'moderate') {
    return Difficulty.MEDIUM;
  }

  if ([Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD].includes(normalized as Difficulty)) {
    return normalized;
  }

  return Difficulty.MEDIUM;
};

const generateContentWithFallback = async (prompt: string) => {
  let lastError: unknown;

  for (const modelName of getGeminiModels()) {
    const model = genAI.getGenerativeModel({ model: modelName });

    for (let attempt = 1; attempt <= GEMINI_MAX_ATTEMPTS_PER_MODEL; attempt += 1) {
      try {
        return await model.generateContent(prompt);
      } catch (error) {
        lastError = error;
        const retryable = isRetryableGeminiError(error);
        if (process.env.NODE_ENV !== 'production') {
          console.error(`Gemini ${modelName} attempt ${attempt} failed:`, getErrorMessage(error));
        }

        if (!retryable) {
          throw error;
        }

        if (attempt < GEMINI_MAX_ATTEMPTS_PER_MODEL) {
          await sleep(GEMINI_RETRY_DELAY_MS * attempt);
        }
      }
    }
  }

  throw new Error(
    `Gemini is temporarily unavailable after trying ${getGeminiModels().join(', ')}. Please try again in a few minutes.`,
  );
};

// Define the interface for the incoming data to ensure type safety
export interface GeneratePaperInput {
  subject: string;
  questionType: string;
  numberOfQuestions: number;
  totalMarks: number;
  difficulty?: string;
  instructions: string;
}

export class GeminiService {
  /**
   * Generates a structured question paper using Gemini AI.
   * @param data The configuration for the assignment
   * @returns Parsed JSON object of the question paper
   */
  static async generateQuestionPaper(data: GeneratePaperInput) {
    const prompt = `
      You are an expert teacher creating a structured assignment.
      Based on the following configuration, generate a question paper.
      
      Configuration:
      - Subject: ${data.subject}
      - Question Type: ${data.questionType}
      - Number of Questions: ${data.numberOfQuestions}
      - Total Marks: ${data.totalMarks}
      - Difficulty: ${data.difficulty || 'Mixed'}
      - Additional Instructions: ${data.instructions}

      CRITICAL INSTRUCTION: Return ONLY valid JSON. Do NOT include any markdown formatting, do NOT include \`\`\`json, and do NOT include any conversational text.
      
      Required JSON Format:
      {
        "sections": [
          {
            "title": "Section A",
            "instruction": "Attempt all questions",
            "questions": [
              {
                "text": "What is closure in JavaScript?",
                "difficulty": "${Difficulty.MEDIUM}",
                "marks": 4,
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctAnswer": "Option A"
              }
            ]
          }
        ]
      }
      
      Rules:
      - For MCQ and true/false questions, ALWAYS include "options" (array of choices) and "correctAnswer".
      - For short_answer, long_answer, and mixed types, "options" and "correctAnswer" are optional but encouraged where applicable.
      - Ensure the total number of questions equals ${data.numberOfQuestions} and the sum of all marks equals exactly ${data.totalMarks}.
    `;

    try {
      const result = await generateContentWithFallback(prompt);
      const response = await result.response;
      let text = response.text();

      // Clean up markdown code blocks the AI sometimes includes despite instructions
      text = text.replace(/```json/gi, '').replace(/```/g, '').trim();

      try {
        const parsedJSON = JSON.parse(text);
        if (Array.isArray(parsedJSON?.sections)) {
          parsedJSON.sections = parsedJSON.sections.map((section: any) => ({
            ...section,
            questions: Array.isArray(section.questions)
              ? section.questions.map((question: any) => ({
                ...question,
                text: question.text || question.question,
                difficulty: normalizeDifficulty(question.difficulty),
                // Preserve options and correctAnswer if present
                ...(question.options && Array.isArray(question.options) ? { options: question.options } : {}),
                ...(question.correctAnswer ? { correctAnswer: question.correctAnswer } : {}),
              }))
              : [],
          }));
        }

        console.log('✅ JSON parsed successfully.');
        return parsedJSON;
      } catch (parseError) {
        console.error('❌ Failed to parse Gemini response as JSON.');
        throw new Error('AI returned an invalid response format that could not be parsed into JSON.');
      }

    } catch (error) {
      console.error('❌ Gemini Service Error:', error);
      throw error;
    }
  }

  static async checkHealth() {
    try {
      const prompt = "Say hello from Gemini";
      const result = await generateContentWithFallback(prompt);
      const response = await result.response;
      const text = response.text();
      return text ? 'working' : 'failed';
    } catch (error) {
      console.error('Gemini Health Check Error:', error);
      return 'failed';
    }
  }
}
