import { Document } from '@cognite/sdk-playground';

import { DocumentType } from 'modules/documentSearch/types';

import { getCreatedDate } from '../selectors/getCreatedDate';
import { getCreatedDateDisplay } from '../selectors/getCreatedDateDisplay';
import { getFilepath } from '../selectors/getFilepath';
import { getFilesize } from '../selectors/getFilesize';
import { getFullFilepath } from '../selectors/getFullFilepath';
import { getModifiedDate } from '../selectors/getModifiedDate';
import { getTitle } from '../selectors/getTitle';

/*
 * Normalize document type
 *
 * From a document search API type -> discover internal legacy document type
 *
 * This is also useful to make some fields safe
 *
 */
export const normalize = (rawAPIDoc: Document): DocumentType => {
  const possiblePath = getFilepath(rawAPIDoc);
  const splitPath = possiblePath ? possiblePath.split('/') : [];

  return {
    id: String(rawAPIDoc.id), // needed to add this id here, so the selection in the table works.
    /**
     * The externalId should be used to persist the documents to feedback or favorite.
     * This is because the documentId could change on re-ingestion, but externalId stays the same.
     * */
    externalId: rawAPIDoc.externalId ? String(rawAPIDoc.externalId) : undefined,
    created: getCreatedDate(rawAPIDoc),
    modified: getModifiedDate(rawAPIDoc),
    createdDisplay: getCreatedDateDisplay(rawAPIDoc),
    modifiedDisplay: getCreatedDateDisplay(rawAPIDoc),
    fullFilePath: getFullFilepath(rawAPIDoc),
    doc: {
      id: String(rawAPIDoc.id),
      assetIds: rawAPIDoc.sourceFile.assetIds || [],
      filename: rawAPIDoc.sourceFile.name,
      fileCategory: rawAPIDoc.type || '',
      labels: rawAPIDoc.labels || [],
      location: rawAPIDoc.sourceFile.source || '',
      author: rawAPIDoc.author || 'Unknown',
      title: getTitle(rawAPIDoc),
      filesize: rawAPIDoc.sourceFile.size,
      size: getFilesize(rawAPIDoc),
      filepath: possiblePath || '',
      url: rawAPIDoc.sourceFile.metadata?.url,
      topfolder: splitPath[1] || 'Unknown',
      truncatedContent: rawAPIDoc.truncatedContent || '',
      pageCount: rawAPIDoc.pageCount,
    },
    title: getTitle(rawAPIDoc),
    highlight: { content: [] },
    geolocation: rawAPIDoc.geoLocation as any, // Remove 'any' once type issue fixed in sdk
  };
};
