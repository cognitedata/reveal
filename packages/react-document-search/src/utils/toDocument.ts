import {
  DocumentHighlight,
  DocumentSearchItem,
  DocumentSearchResponse,
} from '@cognite/sdk';

import { normalize } from '../domain/transformers/normalize';

import { DocumentType } from './types';
import { detectDuplicates } from './detectDuplicates';

export const getHighlight = (info?: DocumentHighlight) => {
  let result: string[] = [];

  if (!info) {
    return result;
  }

  if (info.content) {
    result = result.concat(info.content);
  }

  return result;
};

export const toDocument = ({
  item,
  highlight,
}: DocumentSearchItem): DocumentType => {
  const documentResponse = {
    ...normalize(item),
    highlight: {
      content: getHighlight(highlight),
    },
  };

  return documentResponse;
};

export const toDocuments = (result: DocumentSearchResponse): DocumentType[] => {
  const originalList = result.items.map(toDocument);
  return detectDuplicates(originalList);
};
