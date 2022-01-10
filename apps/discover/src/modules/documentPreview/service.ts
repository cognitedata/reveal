import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';

import { getDocumentSDKClient } from 'modules/documentSearch/sdk';

import { bufferDataToImageUrl } from './utils';

export function getSignedUrl(id: string) {
  // externalId => string, internalId => num (needs conversion using '+)
  return getCogniteSDKClient()
    .files.getDownloadUrls([{ externalId: id }])
    .then((result: any) => result[0].downloadUrl)
    .catch(() => {
      const num: number = +id; // convert from string to num'
      // just incase there is no externalId (thanks testing)
      return getCogniteSDKClient()
        .files.getDownloadUrls([{ id: num }])
        .then((result: any) => result[0].downloadUrl);
    });
}

export function getSignedUrls(valueList: string[]) {
  // externalId => string, internalId => num (needs conversion using '+)
  const externalIdList = valueList.map((val) => {
    return { externalId: val };
  });
  return getCogniteSDKClient()
    .files.getDownloadUrls(externalIdList)
    .catch(() => {
      const internalIdList = valueList.map((val) => {
        const num: number = +val; // convert from string to num'
        return { id: num };
      });
      return getCogniteSDKClient().files.getDownloadUrls(internalIdList);
    });
}

export const getPreview = (documentId: string, page = 0) => {
  return getDocumentSDKClient()
    .documents.preview.documentAsImage(Number(documentId), page)
    .then((response) => bufferDataToImageUrl(response));
};

export const getPdfPreview = (documentId: string) => {
  return getDocumentSDKClient()
    .documents.preview.documentAsPdf(Number(documentId))
    .then((response) => bufferDataToImageUrl(response));
};

export const getTemporaryPreviewLink = (documentId: string) => {
  return getDocumentSDKClient()
    .documents.preview.temporaryLink(Number(documentId))
    .then((response) => response.temporaryLink);
};

export const getFileMetadataByIds = (documentIds: number[]) => {
  return getCogniteSDKClient().files.retrieve(
    documentIds.map((document) => ({ id: document }))
  );
};
