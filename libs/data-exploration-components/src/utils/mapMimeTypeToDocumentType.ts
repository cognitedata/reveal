import { DOCUMENT_ICON_FALLBACK_VALUE } from './constants';
import { fileIconMapper } from './files';

export const mapMimeTypeToDocumentType = (mimeType?: string) => {
  return fileIconMapper[mimeType || ''] || DOCUMENT_ICON_FALLBACK_VALUE;
};
