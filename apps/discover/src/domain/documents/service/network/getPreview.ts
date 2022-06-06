import { getDocumentSDKClient } from '../utils/getDocumentSDKClient';
import { bufferDataToImageUrl } from '../utils/utils';

export const getPreview = (documentId: string, page = 0) => {
  return getDocumentSDKClient()
    .preview.documentAsImage(Number(documentId), page)
    .then((response) => bufferDataToImageUrl(response));
};
