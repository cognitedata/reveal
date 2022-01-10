import { DocumentsSearchWrapper } from '@cognite/sdk-playground';

import { getDocumentFormatFromDate } from '../../../utils/date';
import { LAST_CREATED_KEY_VALUE, LAST_UPDATED_KEY_VALUE } from '../constants';
import { DocumentType, SearchHighlight } from '../types';

import { getFilepath } from './getFilepath';

// we get some dates that dont have milli seconds
// so we need to convert
const safeDateFormat = (value?: Date) => {
  return getDocumentFormatFromDate(value);
};

const getHighlight = (info?: SearchHighlight) => {
  let result: string[] = [];

  if (!info) {
    return result;
  }

  // if (info.name) {
  //   result.push(info.name.join(', '));
  // }

  if (info.content) {
    result = result.concat(info.content);
  }

  return result;
};

export const titleFilterList: string[] = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '0',
  'untitled',
  'powerpoint presentation',
  'microsoft powerPoint',
  'new microsoft powerpoint presentation',
  '<name>',
  'slide 1',
  'lysbilde 1',
  '<kunde>',
  'document1',
  'document2',
  'document3',
  'document4',
  'document5',
  'document6',
  'document7',
  'document8',
  'document9',
  'document10',
  'document11',
  'scanned document',
  'new document',
  'microsoft word - page 1',
  'microsoft word - document1',
  'microsoft word - document2',
  'microsoft word - document3',
  'microsoft word - document4',
  'microsoft word - document5',
  'microsoft word - document6',
  'microsoft word - document7',
  'microsoft word - document8',
  'microsoft word - document9',
  'microsoft word - document15',
  'microsoft word - 1',
  'microsoft word',
  'gmt v4',
  '()',
  'pdf title',
  '.pdf',
];

export const filterTitle = (title?: string) => {
  if (!title) return undefined;
  if (titleFilterList.includes(title.toLowerCase())) return '';
  return title;
};

export const toDocument = ({
  item,
  highlight,
}: DocumentsSearchWrapper): DocumentType => {
  const possiblePath = getFilepath(item);
  const splitPath = possiblePath ? possiblePath.split('/') : [];

  const documentResponse = {
    id: String(item.id), // needed to add this id here, so the selection in the table works.
    /**
     * The externalId should be used to persist the documents to feedback or favorite.
     * This is because the documentId could change on re-ingestion, but externalId stays the same.
     * */
    externalId: item.externalId ? String(item.externalId) : undefined,
    doc: {
      id: String(item.id),
      assetIds: item.sourceFile.assetIds || [],
      filename: item.sourceFile.name,
      filetype: item.type || '',
      labels: item.labels || [],
      creationdate: safeDateFormat(
        new Date(item.sourceFile[LAST_CREATED_KEY_VALUE] || '')
      ),
      lastmodified: safeDateFormat(
        new Date(item.sourceFile[LAST_UPDATED_KEY_VALUE] || '')
      ),
      location: item.sourceFile.source || '',
      author: item.author || 'Unknown',
      title: filterTitle(item.title),
      filesize: item.sourceFile.size,
      filepath: possiblePath || '',
      topfolder: splitPath[1] || 'Unknown',
      truncatedContent: item.truncatedContent || '',
      pageCount: item.pageCount,
    },
    highlight: {
      content: getHighlight(highlight),
    },
    geolocation: item.geoLocation as any, // Remove 'any' once type issue fixed in sdk
  };

  return documentResponse;
};
