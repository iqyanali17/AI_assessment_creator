import mongoose, { Schema, Document, Model } from 'mongoose';
import { AssessmentStatus, QuestionType } from '@/types/enums';

export interface IAssignment extends Document {
  title: string;
  subject: string;
  className: string;
  dueDate: Date;
  questionType: QuestionType;
  numberOfQuestions: number;
  totalMarks: number;
  additionalInstructions?: string;
  fileUrl?: string;
  status: AssessmentStatus;
  lastJobId?: string;
  lastJobName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AssignmentSchema: Schema<IAssignment> = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [100, 'Subject cannot exceed 100 characters'],
    },
    className: {
      type: String,
      required: [true, 'Class is required'],
      trim: true,
      maxlength: [50, 'Class cannot exceed 50 characters'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    questionType: {
      type: String,
      enum: Object.values(QuestionType),
      default: QuestionType.MCQ,
      required: true,
    },
    numberOfQuestions: {
      type: Number,
      required: [true, 'Number of questions is required'],
      min: [1, 'At least 1 question is required'],
      max: [100, 'Cannot exceed 100 questions'],
    },
    totalMarks: {
      type: Number,
      required: [true, 'Total marks are required'],
      min: [1, 'Total marks must be at least 1'],
    },
    additionalInstructions: {
      type: String,
      trim: true,
      maxlength: [2000, 'Instructions cannot exceed 2000 characters'],
    },
    fileUrl: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(AssessmentStatus),
      default: AssessmentStatus.PENDING,
      required: true,
    },
    lastJobId: {
      type: String,
      trim: true,
    },
    lastJobName: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    // Avoid sending both `_id` and the virtual `id` in API responses.
    toJSON: {
      virtuals: false,
      versionKey: false,
      transform: (_doc, ret) => {
        // Keep MongoDB _id as the single identifier field in responses.
        return ret;
      },
    },
    toObject: {
      virtuals: false,
      versionKey: false,
      transform: (_doc, ret) => ret,
    },
  }
);

// Prevent model recompilation in Next.js development
const Assignment: Model<IAssignment> =
  mongoose.models.Assignment || mongoose.model<IAssignment>('Assignment', AssignmentSchema);

export default Assignment;
