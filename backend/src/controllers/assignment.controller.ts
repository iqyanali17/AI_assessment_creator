import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { assessmentQueue } from '@/lib/queue';
import { generateQuestionPaperPdf } from '@/lib/pdf';
import Assignment from '@/models/Assignment';
import GeneratedPaper from '@/models/GeneratedPaper';
import { AssessmentStatus, QuestionType } from '@/types/enums';

const getStartOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

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

const assignmentSchema = z.object({
  title: z
    .string({
      required_error: 'Title is required.',
      invalid_type_error: 'Title must be text.',
    })
    .trim()
    .min(1, 'Title is required.')
    .max(200, 'Title must be 200 characters or less.'),
  subject: z
    .string({
      required_error: 'Subject is required.',
      invalid_type_error: 'Subject must be text.',
    })
    .trim()
    .min(1, 'Subject is required.')
    .max(100, 'Subject must be 100 characters or less.'),
  className: z
    .string({
      required_error: 'Class is required.',
      invalid_type_error: 'Class must be text.',
    })
    .trim()
    .min(1, 'Class is required.')
    .max(50, 'Class must be 50 characters or less.'),
  dueDate: z
    .string({
      required_error: 'Due date is required.',
      invalid_type_error: 'Due date must be a valid date string.',
    })
    .trim()
    .refine((value) => !Number.isNaN(Date.parse(value)), 'Due date must be a valid date.')
    .refine((value) => new Date(value) >= getStartOfToday(), 'Due date cannot be in the past.'),
  questionType: z
    .string({
      required_error: 'Question type is required.',
      invalid_type_error: 'Question type must be text.',
    })
    .trim()
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
  additionalInstructions: z
    .string({
      invalid_type_error: 'Additional instructions must be text.',
    })
    .trim()
    .max(2000, 'Additional instructions must be 2000 characters or less.')
    .optional()
    .default(''),
  fileUrl: z
    .string({
      invalid_type_error: 'File URL must be text.',
    })
    .trim()
    .url('File URL must be a valid URL.')
    .optional(),
}).strict();

const updateAssignmentSchema = assignmentSchema.partial().extend({
  status: z.preprocess(
    (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value),
    z.nativeEnum(AssessmentStatus, {
      errorMap: () => ({ message: `Status must be one of: ${Object.values(AssessmentStatus).join(', ')}.` }),
    }).optional(),
  ),
}).refine(
  (value) => Object.keys(value).length > 0,
  {
    message: 'At least one field is required for update.',
  },
);

const listAssignmentsQuerySchema = z.object({
  page: z.preprocess(
    (value) => value === undefined ? 1 : Number(value),
    z.number().int().min(1).max(1000),
  ),
  limit: z.preprocess(
    (value) => value === undefined ? 10 : Number(value),
    z.number().int().min(1).max(100),
  ),
  status: z.preprocess(
    (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value),
    z.nativeEnum(AssessmentStatus).optional(),
  ),
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

const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);
const getRouteParam = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

const invalidAssignmentIdResponse = (res: Response) => res.status(400).json({
  success: false,
  error: 'Validation failed.',
  errors: {
    id: ['Assignment ID must be a valid MongoDB ObjectId.'],
  },
});

export const createAssignment = async (req: Request, res: Response): Promise<any> => {
  try {
    const validation = assignmentSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed.',
        errors: formatValidationErrors(validation.error),
      });
    }

    const data = validation.data;

    const assignment = await Assignment.create({
      ...data,
      dueDate: new Date(data.dueDate),
      status: AssessmentStatus.PENDING,
    });

    // Add job to BullMQ queue — worker will process it and generate the paper
    const job = await assessmentQueue.add('generate-assessment', {
      assignmentId: assignment._id.toString(),
    });

    assignment.set({
      lastJobId: job.id != null ? String(job.id) : undefined,
      lastJobName: job.name,
    });
    await assignment.save();

    return res.status(201).json({
      success: true,
      message: 'Assignment created and generation job queued.',
      data: {
        assignment,
        jobId: job.id,
        job: {
          id: job.id,
          name: job.name,
        },
      },
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    return res.status(500).json({
      success: false,
      error: 'Unable to create assignment.',
      errors: {
        assignment: ['Assignment could not be saved or queued. Please try again.'],
      },
    });
  }
};

export const listAssignments = async (req: Request, res: Response): Promise<any> => {
  try {
    const validation = listAssignmentsQuerySchema.safeParse(req.query);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed.',
        errors: formatValidationErrors(validation.error),
      });
    }

    const { page, limit, status } = validation.data;
    // Be tolerant if someone manually updated Mongo with different casing (e.g. "Completed").
    const filter = status
      ? { status: new RegExp(`^${status}$`, 'i') as any }
      : {};
    const skip = (page - 1) * limit;

    const [assignments, total] = await Promise.all([
      Assignment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Assignment.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        assignments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('List assignments error:', error);
    return res.status(500).json({
      success: false,
      error: 'Unable to fetch assignments.',
      errors: {
        assignments: ['Assignments could not be fetched. Please try again.'],
      },
    });
  }
};

export const getAssignment = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = getRouteParam(req.params.id);

    if (!id || !isValidObjectId(id)) {
      return invalidAssignmentIdResponse(res);
    }

    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found.',
        errors: {
          id: ['No assignment exists with this ID.'],
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error('Get assignment error:', error);
    return res.status(500).json({
      success: false,
      error: 'Unable to fetch assignment.',
      errors: {
        assignment: ['Assignment could not be fetched. Please try again.'],
      },
    });
  }
};

export const updateAssignment = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = getRouteParam(req.params.id);

    if (!id || !isValidObjectId(id)) {
      return invalidAssignmentIdResponse(res);
    }

    const validation = updateAssignmentSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed.',
        errors: formatValidationErrors(validation.error),
      });
    }

    const data = validation.data;
    const update = {
      ...data,
      ...(data.dueDate ? { dueDate: new Date(data.dueDate) } : {}),
    };

    const assignment = await Assignment.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found.',
        errors: {
          id: ['No assignment exists with this ID.'],
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Assignment updated successfully.',
      data: {
        assignment,
      },
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    return res.status(500).json({
      success: false,
      error: 'Unable to update assignment.',
      errors: {
        assignment: ['Assignment could not be updated. Please try again.'],
      },
    });
  }
};

export const getAssignmentResult = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = getRouteParam(req.params.id);

    if (!id || !isValidObjectId(id)) {
      return invalidAssignmentIdResponse(res);
    }

    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found.',
        errors: {
          id: ['No assignment exists with this ID.'],
        },
      });
    }

    const paper = await GeneratedPaper.findOne({ assignmentId: assignment._id }).sort({ generatedAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        assignment,
        paper,
      },
    });
  } catch (error) {
    console.error('Get assignment result error:', error);
    return res.status(500).json({
      success: false,
      error: 'Unable to fetch assignment result.',
      errors: {
        assignment: ['Assignment result could not be fetched. Please try again.'],
      },
    });
  }
};

export const exportAssignmentPdf = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = getRouteParam(req.params.id);

    if (!id || !isValidObjectId(id)) {
      return invalidAssignmentIdResponse(res);
    }

    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found.',
        errors: {
          id: ['No assignment exists with this ID.'],
        },
      });
    }

    const paper = await GeneratedPaper.findOne({ assignmentId: assignment._id }).sort({ generatedAt: -1 });

    if (!paper) {
      return res.status(404).json({
        success: false,
        error: 'Generated paper not found.',
        errors: {
          paper: ['Generate the assignment before exporting PDF.'],
        },
      });
    }

    const pdf = await generateQuestionPaperPdf(assignment, paper);
    const fileName = `${assignment.title.replace(/[^a-zA-Z0-9._-]/g, '_') || 'question-paper'}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    return res.status(200).send(pdf);
  } catch (error) {
    console.error('Export assignment PDF error:', error);
    return res.status(500).json({
      success: false,
      error: 'Unable to export assignment PDF.',
      errors: {
        pdf: ['PDF could not be generated. Please try again.'],
      },
    });
  }
};

export const getAssignmentStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = getRouteParam(req.params.id);

    if (!id || !isValidObjectId(id)) {
      return invalidAssignmentIdResponse(res);
    }

    const assignment = await Assignment.findById(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found.',
        errors: {
          id: ['No assignment exists with this ID.'],
        },
      });
    }

    const paperExists = await GeneratedPaper.exists({ assignmentId: assignment._id });

    return res.status(200).json({
      success: true,
      data: {
        assignmentId: assignment._id.toString(),
        status: assignment.status,
        paperReady: Boolean(paperExists),
        updatedAt: assignment.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get assignment status error:', error);
    return res.status(500).json({
      success: false,
      error: 'Unable to fetch assignment status.',
      errors: {
        assignment: ['Assignment status could not be fetched. Please try again.'],
      },
    });
  }
};

export const regenerateAssignment = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = getRouteParam(req.params.id);

    if (!id || !isValidObjectId(id)) {
      return invalidAssignmentIdResponse(res);
    }

    const assignment = await Assignment.findByIdAndUpdate(
      id,
      { status: AssessmentStatus.PENDING },
      { new: true },
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found.',
        errors: {
          id: ['No assignment exists with this ID.'],
        },
      });
    }

    // Add job to BullMQ queue — worker will process it and regenerate the paper
    const job = await assessmentQueue.add('regenerate-assessment', {
      assignmentId: assignment._id.toString(),
    });

    assignment.set({
      lastJobId: job.id != null ? String(job.id) : undefined,
      lastJobName: job.name,
    });
    await assignment.save();

    return res.status(202).json({
      success: true,
      message: 'Regeneration job queued.',
      data: {
        assignment,
        jobId: job.id,
        job: {
          id: job.id,
          name: job.name,
        },
      },
    });
  } catch (error) {
    console.error('Regenerate assignment error:', error);
    return res.status(500).json({
      success: false,
      error: 'Unable to queue regeneration.',
      errors: {
        assignment: ['Regeneration job could not be queued. Please try again.'],
      },
    });
  }
};

export const deleteAssignment = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = getRouteParam(req.params.id);

    if (!id || !isValidObjectId(id)) {
      return invalidAssignmentIdResponse(res);
    }

    const assignment = await Assignment.findByIdAndDelete(id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found.',
        errors: {
          id: ['No assignment exists with this ID.'],
        },
      });
    }

    const deletedPapers = await GeneratedPaper.deleteMany({ assignmentId: assignment._id });

    return res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully.',
      data: {
        assignmentId: assignment._id.toString(),
        deletedPapers: deletedPapers.deletedCount,
      },
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    return res.status(500).json({
      success: false,
      error: 'Unable to delete assignment.',
      errors: {
        assignment: ['Assignment could not be deleted. Please try again.'],
      },
    });
  }
};
