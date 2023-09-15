import { Dispatch, SetStateAction, useEffect } from 'react';

import { CopilotDataModelQueryMessage } from '@cognite/llm-hub';

import { useAIQueryLocalStorage } from '../../../hooks/useLocalStorage';
import { useSearchQueryParams } from '../../../hooks/useParams';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAIDataTypesQuery } from '../../../services/dataTypes/queries/useAIDataTypesQuery';
import { useSelectedDataModels } from '../../../services/useSelectedDataModels';

export const useAICacheEdited = (
  copilotMessage:
    | (CopilotDataModelQueryMessage & { edited?: boolean })
    | undefined,
  setMessage: Dispatch<
    SetStateAction<
      (CopilotDataModelQueryMessage & { edited?: boolean }) | undefined
    >
  >
) => {
  const [query] = useSearchQueryParams();
  const selectedDataModels = useSelectedDataModels();
  const { t } = useTranslation();
  const { data: results } = useAIDataTypesQuery(
    query,
    selectedDataModels || [],
    copilotMessage
  );
  const [_, setCachedQuery] = useAIQueryLocalStorage();

  useEffect(() => {
    if (!copilotMessage?.edited || !results) {
      return;
    }

    const response = Object.values(results)[0];
    if (!('pageInfo' in response) || !('items' in response)) {
      return;
    }

    const resultAggregate = `${response.items.length}${
      (response.pageInfo as { hasNextPage: boolean }).hasNextPage ? '+' : ''
    }`;
    setMessage((current) => {
      const newMessage = current
        ? {
            ...current,
            content: t('AI_EDITED_FILTER_RESULTS', {
              resultAggregate,
            }),
          }
        : undefined;
      if (newMessage) {
        setCachedQuery((currCache) =>
          currCache
            ? {
                ...currCache,
                message: newMessage,
              }
            : undefined
        );
      }
      return newMessage;
    });
  }, [setCachedQuery, setMessage, copilotMessage, results, t]);
};
