import { CopilotDataModelQueryMessage } from '@fusion/copilot-core';

import { useAIQueryLocalStorage } from '../../../hooks/useLocalStorage';
import { useSearchQueryParams } from '../../../hooks/useParams';
import { useAIDataTypesQuery } from '../../../services/dataTypes/queries/useAIDataTypesQuery';
import { useSelectedDataModels } from '../../../services/useSelectedDataModels';
import { recursiveConcatItems } from '../utils';

export const useAICachedResults = (
  copilotMessage?: CopilotDataModelQueryMessage
) => {
  const [query] = useSearchQueryParams();
  const selectedDataModels = useSelectedDataModels();
  const { data: results } = useAIDataTypesQuery(
    query,
    selectedDataModels || [],
    copilotMessage
  );
  const [cachedQuery] = useAIQueryLocalStorage();
  // console.log(results, query, cachedQuery);
  if (results) {
    return recursiveConcatItems(results);
  }
  const cachedQueryDataModel = JSON.stringify(
    cachedQuery?.dataModels.map(
      (el) => `${el.externalId}_${el.version}_${el.space}`
    )
  );
  const selectedQueryDataModel = JSON.stringify(
    (selectedDataModels || []).map(
      (el) => `${el.externalId}_${el.version}_${el.space}`
    )
  );
  if (
    cachedQuery?.search === query &&
    cachedQueryDataModel === selectedQueryDataModel &&
    JSON.stringify(cachedQuery.message.graphql.variables['filter']) ===
      JSON.stringify(copilotMessage?.graphql.variables['filter'])
  ) {
    return recursiveConcatItems(cachedQuery.results);
  }
  return undefined;
};
