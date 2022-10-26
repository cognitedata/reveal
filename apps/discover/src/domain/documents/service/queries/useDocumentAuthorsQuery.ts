import { useQuery } from '@tanstack/react-query';
import { fetchAllCursors } from 'utils/fetchAllCursors';

import { DocumentsAggregateAllUniqueValuesItem } from '@cognite/sdk';

import { DOCUMENT_AUTHORS_QUERY_KEY } from 'constants/react-query';

import { getDocumentSDKClient } from '../utils/getDocumentSDKClient';

export const useDocumentAuthorsQuery = () => {
  return useQuery([DOCUMENT_AUTHORS_QUERY_KEY], () => {
    return fetchAllCursors<DocumentsAggregateAllUniqueValuesItem>({
      action: getDocumentSDKClient().aggregate.allUniqueValues,
      actionProps: {
        properties: [{ property: ['author'] }],
        limit: 10000,
      },
    });
  });
};
