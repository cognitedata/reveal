import { FileInfo as File } from '@cognite/sdk';
import { PREVIEWABLE_FILE_TYPES } from '../data/PREVIEWABLE_FILE_TYPES';
import { isFileOfType } from './isFileOfType';

export const isFilePreviewable = (file?: File) =>
  isFileOfType(file, PREVIEWABLE_FILE_TYPES);
