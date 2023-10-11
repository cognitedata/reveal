import { DMSRecord, SuggestionsMatch } from '@platypus-core/domain/suggestions';
import { useQuery } from '@tanstack/react-query';

import { QueryKeys } from '../../../../../utils/queryKeys';

import { getSuggestionsWorker } from './suggestionsWorkerLoader';

export const useFindSuggestions = (
  sourceRecords?: DMSRecord[],
  targetRecords?: DMSRecord[],
  selectedColumn?: string,
  selectedSourceColumns?: string[],
  selectedTargetColumns?: string[]
) => {
  return useQuery(
    QueryKeys.SUGGESTIONS_DATA(
      selectedColumn || 'null',
      selectedSourceColumns || [],
      selectedTargetColumns || []
    ),
    async () => {
      return new Promise<SuggestionsMatch[]>((resolve, _reject) => {
        getSuggestionsWorker().then((worker) => {
          worker.onmessage = (e: MessageEvent<SuggestionsMatch[]>) => {
            worker.terminate();
            resolve(e.data);
          };
          worker.postMessage({
            sourceRecords: sourceRecords || [],
            targetRecords: targetRecords || [],
            fillColumn: selectedColumn || '',
            sourceColumns: selectedSourceColumns || [],
            targetColumns: selectedTargetColumns || [],
          });
        });
      });
    },
    {
      enabled:
        !!sourceRecords &&
        !!targetRecords &&
        !!selectedColumn &&
        !!selectedSourceColumns &&
        !!selectedTargetColumns,
    }
  );
};
