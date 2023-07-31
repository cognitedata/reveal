import { normalize } from 'domain/documents/internal/transformers/normalize';

import { DocumentHighlight, DocumentSearchItem } from '@cognite/sdk';

import { DocumentType } from '../types';

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
