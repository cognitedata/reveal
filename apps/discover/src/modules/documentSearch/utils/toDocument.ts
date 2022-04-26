import { normalize } from 'dataLayers/documents/adapters/normalize';

import { DocumentSearchResponse, DocumentHighlight } from '@cognite/sdk';

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
}: DocumentSearchResponse['items'][number]): DocumentType => {
  const documentResponse = {
    ...normalize(item),
    highlight: {
      content: getHighlight(highlight),
    },
  };

  return documentResponse;
};
