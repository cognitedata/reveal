import { getDocumentSDKClient } from 'domain/documents/service/utils/getDocumentSDKClient';

export const getTemporaryPreviewLink = (documentId: string) => {
  return getDocumentSDKClient()
    .preview.pdfTemporaryLink(Number(documentId))
    .then((response) => response.temporaryLink || '');
};
