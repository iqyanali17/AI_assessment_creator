import mongoose, { Schema, Document, Model } from 'mongoose';
import { Difficulty } from '@/types/enums';

export interface IQuestion {
  text: string;
  difficulty: Difficulty;
  marks: number;
  options?: string[];
  correctAnswer?: string;
}

export interface ISection {
  title: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IGeneratedPaper extends Document {
  assignmentId: mongoose.Types.ObjectId;
  sections: ISection[];
  generatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  text: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
  },
  difficulty: {
    type: String,
    enum: Object.values(Difficulty),
    default: Difficulty.MEDIUM,
    required: true,
  },
  marks: {
    type: Number,
    required: [true, 'Marks for question are required'],
    min: [0, 'Marks cannot be negative'],
  },
  options: {
    type: [String],
    default: undefined,
  },
  correctAnswer: {
    type: String,
    trim: true,
    default: undefined,
  },
});

const SectionSchema = new Schema<ISection>({
  title: {
    type: String,
    required: [true, 'Section title is required'],
    trim: true,
  },
  instruction: {
    type: String,
    required: [true, 'Section instruction is required'],
    trim: true,
  },
  questions: [QuestionSchema],
});

const GeneratedPaperSchema: Schema<IGeneratedPaper> = new Schema(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Assignment',
      required: [true, 'Assignment ID is required'],
      index: true,
    },
    sections: {
      type: [SectionSchema],
      validate: {
        validator: function (v: ISection[]) {
          return v && v.length > 0;
        },
        message: 'At least one section is required',
      },
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    // Avoid sending both `_id` and the virtual `id` in API responses.
    toJSON: {
      virtuals: false,
      versionKey: false,
      transform: (_doc, ret) => ret,
    },
    toObject: {
      virtuals: false,
      versionKey: false,
      transform: (_doc, ret) => ret,
    },
  }
);

// Prevent model recompilation in Next.js development
const GeneratedPaper: Model<IGeneratedPaper> =
  mongoose.models.GeneratedPaper || mongoose.model<IGeneratedPaper>('GeneratedPaper', GeneratedPaperSchema);

export default GeneratedPaper;
