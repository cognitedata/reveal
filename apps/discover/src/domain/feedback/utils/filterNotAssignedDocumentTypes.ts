import { OTHER_DOCUMENT_TYPE } from 'domain/documents/constants';

import { DocumentPayload } from '@cognite/discover-api-types';

export const filterNotAssignedDocumentTypes = (
  documentTypes: DocumentPayload[],
  currentDocumentType: string[]
) => {
  return documentTypes.filter((docType) => {
    if (currentDocumentType?.length > 0) {
      return !currentDocumentType.includes(docType.name);
    }
    return docType.id !== OTHER_DOCUMENT_TYPE.id;
  });
};
