import { DMSRecord, SuggestionsMatch } from '@platypus-core/domain/suggestions';
import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from '@platypus-app/utils/queryKeys';
import SuggestionsWorker from './suggestionsWorkerLoader';

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
        const worker = new SuggestionsWorker();
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
