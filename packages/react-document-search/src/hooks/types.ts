import { UseInfiniteQueryResult } from 'react-query';

import { DocumentResult } from '../utils/types';

export type InfiniteQueryResponse = UseInfiniteQueryResult<DocumentResult> & {
  results: DocumentResult;
};
