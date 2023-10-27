import { useFDM } from '@fdx/shared/providers/FDMProvider';
import { DataModelV2 } from '@fdx/shared/types/services';
import { CopilotDataModelQueryResponse } from '@fusion/copilot-core';
import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../../queryKeys';

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
