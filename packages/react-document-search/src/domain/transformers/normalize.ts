import { Document } from '@cognite/sdk';

import { DocumentType } from '../../utils/types';

import { getCreatedDate } from './getCreatedDate';
import { getCreatedDateDisplay } from './getCreatedDateDisplay';
import { getFilepath } from './getFilepath';
import { getFilesize } from './getFilesize';
import { getFullFilepath } from './getFullFilepath';
import { getModifiedDate } from './getModifiedDate';
import { getModifiedDateDisplay } from './getModifiedDateDisplay';
import { getTitle } from './getTitle';

/**
 * Normalize the API Document type to an internal type that is more readable and safe
 * */
export const normalize = (rawAPIDoc: Document): DocumentType => {
  const possiblePath = getFilepath(rawAPIDoc);
  const splitPath = possiblePath ? possiblePath.split('/') : [];

  return {
    _id: rawAPIDoc.id,
    id: String(rawAPIDoc.id), // needed to add this id here, so the selection in the table works.
    /**
     * The externalId should be used to persist the documents to feedback or favorite.
     * This is because the documentId could change on re-ingestion, but externalId stays the same.
     * */
    externalId: rawAPIDoc.externalId ? String(rawAPIDoc.externalId) : undefined,
    created: getCreatedDate(rawAPIDoc),
    modified: getModifiedDate(rawAPIDoc),
    createdDisplay: getCreatedDateDisplay(rawAPIDoc),
    modifiedDisplay: getModifiedDateDisplay(rawAPIDoc),
    fullFilePath: getFullFilepath(rawAPIDoc),

    // NOTE: We want to mimic the response from document api as much as possible,
    // But in this case, I feel like this is more of quality of life, thoughts?
    sourceFile: rawAPIDoc.sourceFile,

    assetIds: rawAPIDoc.sourceFile.assetIds || [],
    filename: rawAPIDoc.sourceFile.name,
    location: rawAPIDoc.sourceFile.source || '',
    url: rawAPIDoc.sourceFile.metadata?.url,
    filesize: rawAPIDoc.sourceFile.size,

    fileCategory: rawAPIDoc.type || '',
    labels: rawAPIDoc.labels || [],
    author: rawAPIDoc.author || '',
    title: getTitle(rawAPIDoc),
    size: getFilesize(rawAPIDoc),
    filepath: possiblePath || '',
    topfolder: splitPath[1] || '',
    truncatedContent: rawAPIDoc.truncatedContent || '',
    pageCount: rawAPIDoc.pageCount,
    highlight: { content: [] },
    geolocation: rawAPIDoc.geoLocation,
  };
};
