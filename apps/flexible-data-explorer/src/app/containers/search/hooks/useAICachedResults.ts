import { CopilotDataModelQueryResponse } from '@fusion/copilot-core';

import { useAIQueryLocalStorage } from '../../../hooks/useLocalStorage';
import { useSearchQueryParams } from '../../../hooks/useParams';
import { useAIDataTypesQuery } from '../../../services/dataTypes/queries/useAIDataTypesQuery';
import { DataModelV2 } from '../../../services/types';
import { useSelectedDataModels } from '../../../services/useSelectedDataModels';
import { extractItems } from '../utils';

export const useAICachedResults = (
  copilotMessage?: CopilotDataModelQueryResponse
) => {
  const [query] = useSearchQueryParams();
  const selectedDataModels = useSelectedDataModels();
  const { data: results } = useAIDataTypesQuery(
    query,
    selectedDataModels || [],
    copilotMessage
  );
  const [cachedQuery, setCachedResults] = useAIQueryLocalStorage();

  const cachedQueryDataModel = dataModelsToString(
    cachedQuery?.dataModels || []
  );
  const selectedQueryDataModel = dataModelsToString(selectedDataModels || []);

  const isCacheCorrect =
    // query correct
    cachedQuery?.search === query &&
    // data model selection correct
    cachedQueryDataModel === selectedQueryDataModel &&
    // filters correct
    JSON.stringify(cachedQuery.message.graphql.variables['filter']) ===
      JSON.stringify(copilotMessage?.graphql.variables['filter']);

  if (results) {
    if (copilotMessage && !isCacheCorrect) {
      setCachedResults({
        search: query,
        results,
        dataModels: selectedDataModels || [],
        message: copilotMessage,
      });
    }
    return extractItems(results);
  }
  if (isCacheCorrect) {
    return extractItems(cachedQuery.results);
  }
  return undefined;
};

const dataModelsToString = (dataModels: DataModelV2[]) => {
  return JSON.stringify(
    (dataModels || []).map((el) => `${el.externalId}_${el.version}_${el.space}`)
  );
};