import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';
import { env } from '@/config/config';

const allowedMimeTypes = new Set(['application/pdf', 'text/plain']);

const getUploadRoot = () => path.resolve(process.cwd(), env.UPLOAD_DIR);

const getUploadPath = (fileId: string) => path.join(getUploadRoot(), fileId);

const sanitizeFileName = (fileName: string) => {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || 'upload';
};

const getExtension = (mimeType: string) => mimeType === 'application/pdf' ? '.pdf' : '.txt';
const getRouteParam = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export const uploadFile = async (req: Request, res: Response): Promise<any> => {
  try {
    const mimeType = String(req.headers['content-type'] || '').split(';')[0].toLowerCase();
    const body = req.body as Buffer;

    if (!allowedMimeTypes.has(mimeType)) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed.',
        errors: {
          file: ['Only application/pdf and text/plain uploads are supported.'],
        },
      });
    }

    if (!Buffer.isBuffer(body) || body.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed.',
        errors: {
          file: ['File body is required.'],
        },
      });
    }

    const originalName = sanitizeFileName(String(req.headers['x-file-name'] || `assignment-file${getExtension(mimeType)}`));
    const fileId = `${randomUUID()}${getExtension(mimeType)}`;
    const uploadRoot = getUploadRoot();

    await fs.mkdir(uploadRoot, { recursive: true });
    await fs.writeFile(getUploadPath(fileId), body);

    return res.status(201).json({
      success: true,
      message: 'File uploaded successfully.',
      data: {
        file: {
          id: fileId,
          originalName,
          mimeType,
          size: body.length,
          url: `/uploads/${fileId}/download`,
        },
      },
    });
  } catch (error) {
    console.error('Upload file error:', error);
    return res.status(500).json({
      success: false,
      error: 'Unable to upload file.',
      errors: {
        file: ['File could not be uploaded. Please try again.'],
      },
    });
  }
};

export const downloadUpload = async (req: Request, res: Response): Promise<any> => {
  try {
    const fileId = getRouteParam(req.params.id);

    if (!fileId || fileId.includes('..') || path.basename(fileId) !== fileId) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed.',
        errors: {
          id: ['Invalid file ID.'],
        },
      });
    }

    const filePath = getUploadPath(fileId);
    const extension = path.extname(fileId).toLowerCase();
    const mimeType = extension === '.pdf' ? 'application/pdf' : 'text/plain';

    await fs.access(filePath);
    return res.download(filePath, fileId, {
      headers: {
        'Content-Type': mimeType,
      },
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      error: 'File not found.',
      errors: {
        id: ['No uploaded file exists with this ID.'],
      },
    });
  }
};
