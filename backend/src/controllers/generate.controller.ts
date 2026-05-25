import { Request, Response } from 'express';
import { z } from 'zod';
import { GeminiService, GeneratePaperInput } from '@/services/gemini.service';
import Assignment from '@/models/Assignment';
import GeneratedPaper from '@/models/GeneratedPaper';
import { AssessmentStatus, QuestionType } from '@/types/enums';

const requiredNumber = (
  fieldName: string,
  schema: z.ZodNumber,
) =>
  z.preprocess(
    (value) => {
      if (typeof value === 'string') {
        const trimmedValue = value.trim();
        return trimmedValue === '' ? undefined : Number(trimmedValue);
      }

      return value;
    },
    z.number({
      required_error: `${fieldName} is required.`,
      invalid_type_error: `${fieldName} must be a number.`,
    }).pipe(schema),
  );

const generatePaperSchema = z.object({
  subject: z
    .string({
      required_error: 'Subject is required.',
      invalid_type_error: 'Subject must be text.',
    })
    .trim()
    .min(1, 'Subject is required.')
    .max(100, 'Subject must be 100 characters or less.'),
  questionType: z
    .string({
      required_error: 'Question type is required.',
      invalid_type_error: 'Question type must be text.',
    })
    .trim()
    .min(1, 'Question type is required.')
    .transform((value) => value.toLowerCase())
    .pipe(z.nativeEnum(QuestionType, {
      errorMap: () => ({ message: `Question type must be one of: ${Object.values(QuestionType).join(', ')}.` }),
    })),
  numberOfQuestions: requiredNumber(
    'Number of questions',
    z.number()
      .int('Number of questions must be a whole number.')
      .min(1, 'Number of questions must be at least 1.')
      .max(100, 'Number of questions cannot be more than 100.'),
  ),
  totalMarks: requiredNumber(
    'Total marks',
    z.number()
      .int('Total marks must be a whole number.')
      .min(1, 'Total marks must be at least 1.')
      .max(1000, 'Total marks cannot be more than 1000.'),
  ),
  difficulty: z
    .string({
      required_error: 'Difficulty is required.',
      invalid_type_error: 'Difficulty must be text.',
    })
    .trim()
    .min(1, 'Difficulty is required.')
    .transform((value) => value.toLowerCase())
    .pipe(z.enum(['easy', 'medium', 'hard'], {
      errorMap: () => ({ message: 'Difficulty must be one of: Easy, Medium, Hard.' }),
    }))
    .transform((value) => value.charAt(0).toUpperCase() + value.slice(1)),
  instructions: z
    .string({
      invalid_type_error: 'Instructions must be text.',
    })
    .trim()
    .max(500, 'Instructions must be 500 characters or less.')
    .optional()
    .default(''),
  save: z.boolean({
    invalid_type_error: 'Save must be true or false.',
  }).optional().default(false),
  dueDate: z
    .string({
      invalid_type_error: 'Due date must be a valid date string.',
    })
    .trim()
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Due date must be a valid date.')
    .optional(),
}).strict();

const formatValidationErrors = (error: z.ZodError) => {
  const errors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const field = issue.path.join('.') || 'body';
    errors[field] = errors[field] || [];
    errors[field].push(issue.message);
  }

  return errors;
};

/**
 * Controller to handle POST /generate requests
 * Validates input, calls the Gemini service, and returns structured JSON.
 */
export const generatePaper = async (req: Request, res: Response): Promise<any> => {
  try {
    const validation = generatePaperSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed.',
        errors: formatValidationErrors(validation.error),
      });
    }

    const { save, dueDate, ...data } = validation.data;

    // 2. Call the Gemini service to generate the paper
    const generatedPaper = await GeminiService.generateQuestionPaper(data);

    if (save) {
      const assignment = await Assignment.create({
        title: data.subject,
        dueDate: dueDate ? new Date(dueDate) : new Date(),
        questionType: data.questionType,
        numberOfQuestions: data.numberOfQuestions,
        totalMarks: data.totalMarks,
        additionalInstructions: data.instructions,
        status: AssessmentStatus.COMPLETED,
      });

      const paper = await GeneratedPaper.create({
        assignmentId: assignment._id,
        sections: generatedPaper.sections,
        generatedAt: new Date(),
      });

      return res.status(200).json({
        success: true,
        message: 'Question paper generated and saved.',
        data: {
          assignment,
          paper,
        },
      });
    }

    // 3. Return the structured JSON response successfully
    return res.status(200).json({
      success: true,
      message: 'Question paper generated. This preview was not saved.',
      data: generatedPaper,
    });

  } catch (error: any) {
    console.error('Generate paper error:', error);
    return res.status(500).json({
      success: false,
      error: 'Question paper generation failed.',
      errors: {
        ai: ['Generation failed. Please try again.'],
      },
    });
  }
};
