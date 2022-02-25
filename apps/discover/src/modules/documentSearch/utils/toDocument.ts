import { normalize } from 'dataLayers/documents/adapters/normalize';

import { DocumentsSearchWrapper } from '@cognite/sdk-playground';

import { DocumentType, SearchHighlight } from '../types';

export const getHighlight = (info?: SearchHighlight) => {
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

export const toDocument = ({
  item,
  highlight,
}: DocumentsSearchWrapper): DocumentType => {
  const documentResponse = {
    ...normalize(item),
    highlight: {
      content: getHighlight(highlight),
    },
  };

  return documentResponse;
};
