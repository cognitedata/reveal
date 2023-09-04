import { CopilotDataModelQueryMessage } from '@fusion/copilot-core';
import { useQuery } from '@tanstack/react-query';

import { useAIQueryLocalStorage } from '../../../hooks/useLocalStorage';
import { useFDM } from '../../../providers/FDMProvider';
import { queryKeys } from '../../queryKeys';
import { DataModelV2 } from '../../types';

export const useAIDataTypesQuery = (
  search: string,
  selectedDataModels: DataModelV2[],
  message?: CopilotDataModelQueryMessage
) => {
  const client = useFDM();

  const [_, setQueryResults] = useAIQueryLocalStorage();
  return useQuery(
    queryKeys.aiSearchDataTypes(
      search,
      selectedDataModels,
      message?.graphql.query,
      message?.graphql.variables
    ),
    async () => {
      if (!message) {
        setQueryResults(undefined);
        return undefined;
      }
      const results = await client.aiSearch(
        message.dataModel,
        message.graphql.query,
        message.graphql.variables
      );

      setQueryResults({
        search,
        results,
        dataModels: selectedDataModels,
        message,
      });

      return results;
    },
    {
      enabled: !!message,
      // suspense is a broke atm, I will fix the underlying issue later - deep
      suspense: false,
    }
  );
};
