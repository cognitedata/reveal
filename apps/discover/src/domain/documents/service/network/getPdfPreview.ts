import { getDocumentSDKClient } from '../utils/getDocumentSDKClient';
import { bufferDataToImageUrl } from '../utils/utils';

export const getPdfPreview = (documentId: string) => {
  return getDocumentSDKClient()
    .preview.documentAsPdf(Number(documentId))
    .then((response) => bufferDataToImageUrl(response));
};
