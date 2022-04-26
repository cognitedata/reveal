import { Document } from '@cognite/sdk';

import { NOT_AVAILABLE } from '../../../constants/empty';

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

export const DEFAULT_DOCMENT_TITLE = NOT_AVAILABLE;

export const getTitle = (doc: Document) => {
  if (!doc.title) return DEFAULT_DOCMENT_TITLE;
  if (titleFilterList.includes(doc.title.toLowerCase()))
    return DEFAULT_DOCMENT_TITLE;
  return doc.title || DEFAULT_DOCMENT_TITLE;
};
