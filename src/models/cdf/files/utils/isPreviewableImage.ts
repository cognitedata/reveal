import { FileInfo } from '@cognite/sdk';
import { PREVIEWABLE_IMAGE_TYPES } from 'models/cdf/files/data/PREVIEWABLE_IMAGE_TYPES';
import { isFileOfType } from './isFileOfType';

export const isPreviewableImage = (file: FileInfo) =>
  isFileOfType(file, PREVIEWABLE_IMAGE_TYPES);
