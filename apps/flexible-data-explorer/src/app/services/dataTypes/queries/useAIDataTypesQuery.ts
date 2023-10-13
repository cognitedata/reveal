import { CopilotDataModelQueryResponse } from '@fusion/copilot-core';
import { useQuery } from '@tanstack/react-query';

import { useFDM } from '../../../providers/FDMProvider';
import { queryKeys } from '../../queryKeys';
import { DataModelV2 } from '../../types';

export const useAIDataTypesQuery = (
  search: string,
  selectedDataModels: DataModelV2[],
  message?: CopilotDataModelQueryResponse
) => {
  const client = useFDM();

  return useQuery(
    queryKeys.aiSearchDataTypes(
      search,
      selectedDataModels,
      message?.graphql.query,
      message?.graphql.variables
    ),
    async () => {
      if (!message) {
        return null;
      }
      const results = await client.aiSearch(
        message.dataModel,
        message.graphql.query,
        message.graphql.variables
      );

      return results;
    },
    {
      enabled: !!message,
      // suspense is a broke atm, I will fix the underlying issue later - deep
      suspense: false,
    }
  );
};
