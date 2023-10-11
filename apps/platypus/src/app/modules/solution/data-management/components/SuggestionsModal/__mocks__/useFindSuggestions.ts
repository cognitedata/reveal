import { DMSRecord, findSuggestions } from '@platypus-core/domain/suggestions';
import { useQuery } from '@tanstack/react-query';

import { QueryKeys } from '../../../../../../utils/queryKeys';

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
      return await findSuggestions({
        sourceRecords: sourceRecords || [],
        targetRecords: targetRecords || [],
        fillColumn: selectedColumn || '',
        sourceColumns: selectedSourceColumns || [],
        targetColumns: selectedTargetColumns || [],
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
