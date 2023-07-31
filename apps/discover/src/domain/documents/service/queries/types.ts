import { UseInfiniteQueryResult } from '@tanstack/react-query';

import { DocumentResult } from 'modules/documentSearch/types';

export type InifniteQueryResponse = UseInfiniteQueryResult<DocumentResult> & {
  results: DocumentResult;
};
