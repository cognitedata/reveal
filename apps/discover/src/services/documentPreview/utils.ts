import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { openExternalPage } from 'utils/url';

import { InternalId, ExternalId, IdEither, FileLink } from '@cognite/sdk';

import { DocumentType } from 'modules/documentSearch/types';

import {
  getSignedUrls,
  getSignedUrl,
  getFileMetadataByIds,
  getTemporaryPreviewLink,
} from './service';

export const getDocIdFromSignedUrlResponse = (
  responses: ((FileLink & InternalId) | (FileLink & ExternalId))[],
  id: number | string,
  externalId?: string
) => {
  return responses.find((possibleId: IdEither) => {
    if ('externalId' in possibleId) {
      return possibleId.externalId === externalId; // Cognite ExternalId is a string
    }

    if ('id' in possibleId) {
      return possibleId.id.toString() === id; // Cognite InternalId is a number
    }

    /* istanbul ignore next */
    return false; // This line in unreachable
  });
};

export interface ZippableItem {
  filename: string;
  blob: Promise<any>;
}

export async function zipAndDownload(docs: DocumentType[]) {
  return getDocumentContentForZipping(docs).then(makeZip).then(downloadFile);
}

export async function zipAndDownloadDocumentsByIds(documentIds: number[]) {
  const documentsMetaData = getFileMetadataByIds(documentIds);
  const resultList = getSignedUrls(documentIds.map((d) => d.toString()));

  if (documentIds.length === 0) {
    return Promise.reject(new Error('No files to download'));
  }

  const [documentsMeta, documentDownloadUrls] = await Promise.all([
    documentsMetaData,
    resultList,
  ]);

  const documentsWithFetchingContent = documentsMeta.reduce(
    (results, content) => {
      // get the filename
      const signedUrlInfo = getDocIdFromSignedUrlResponse(
        documentDownloadUrls,
        content.id.toString(),
        content?.externalId
      );

      if (signedUrlInfo?.downloadUrl && content?.name) {
        return [
          ...results,
          {
            blob: fetch(signedUrlInfo?.downloadUrl).then((docContent) =>
              docContent.blob()
            ),
            filename: content.name,
          },
        ];
      }
      return results;
    },
    [] as ZippableItem[]
  );

  return makeZip(documentsWithFetchingContent).then(downloadFile);
}

export async function zipFavoritesAndDownload(documents: DocumentType[]) {
  return getFavoriteContentForZipping(documents)
    .then(makeZip)
    .then(downloadFile);
}

const getIdListForInspect = (docs: DocumentType[]) => {
  return docs.map((doc: DocumentType) => doc.id);
};

export const getFavoriteContentForZipping = async (
  documents: DocumentType[]
) => {
  if (documents.length === 0) {
    return Promise.reject(new Error('No files to download'));
  }

  const resultList = await getSignedUrls(documents.map((d) => d.id.toString()));

  const documentsWithFetchingContent = documents.reduce((results, content) => {
    // get the filename
    const signedUrlInfo = getDocIdFromSignedUrlResponse(
      resultList,
      content.id.toString(),
      content?.externalId
    );

    if (signedUrlInfo?.downloadUrl && content?.doc.filename) {
      return [
        ...results,
        {
          blob: fetch(signedUrlInfo?.downloadUrl).then((docContent) => {
            return docContent.blob();
          }),
          filename: content.doc.filename,
        },
      ];
    }
    return results;
  }, [] as ZippableItem[]);

  return documentsWithFetchingContent;
};

export const getDocumentContentForZipping = async (docs: DocumentType[]) => {
  const idList = getIdListForInspect(docs);
  if (idList.length === 0) {
    return Promise.reject(new Error('No files to download'));
  }
  const resultList = await getSignedUrls(idList);

  // make a list of the document urls to fetch from
  const documentsWithFetchingContent = docs.reduce((results, doc) => {
    // get the filename
    const signedUrlInfo = getDocIdFromSignedUrlResponse(
      resultList,
      doc.id,
      doc?.externalId
    );

    if (signedUrlInfo?.downloadUrl && doc.doc.filename) {
      return [
        ...results,
        {
          blob: fetch(signedUrlInfo?.downloadUrl).then((docContent) =>
            docContent.blob()
          ),
          filename: doc.doc.filename,
        },
      ];
    }
    return results;
  }, [] as ZippableItem[]);

  return documentsWithFetchingContent;
};

export const makeZip = (itemsToZip: ZippableItem[]) => {
  const zip = new JSZip();

  // add the doc fetching promises to the zip
  itemsToZip.forEach((item) => {
    zip.file(item.filename as string, item.blob, { binary: true });
  });

  // package the zip, resolving all document content promises
  return zip.generateAsync({ type: 'blob' });
};

export const downloadFile = (
  content: string | Blob,
  filename = 'DiscoverDownload_',
  noTimestamp = false
) => {
  saveAs(content, `${filename}${noTimestamp ? '' : Date.now()}`);
};

export const downloadFileFromUrl = async (documentId: string) => {
  const url = await getSignedUrl(documentId);
  openExternalPage(url);
};

export const openDocumentPreviewInNewTab = async (documentId: string) => {
  return getTemporaryPreviewLink(documentId).then((value) => {
    openExternalPage(value);
  });
};

export const bufferDataToImageUrl = (data: ArrayBuffer): string => {
  const arrayBufferView: Uint8Array = new Uint8Array(data);
  const blob: Blob = new Blob([arrayBufferView], { type: 'image/jpeg' });
  const urlCreator = window.URL || window.webkitURL;
  return urlCreator.createObjectURL(blob);
};
