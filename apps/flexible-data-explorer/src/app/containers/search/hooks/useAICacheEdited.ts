import { Dispatch, SetStateAction, useEffect } from 'react';

import { CopilotDataModelQueryResponse } from '@fusion/copilot-core';

import { useAIQueryLocalStorage } from '../../../hooks/useLocalStorage';
import { useSearchQueryParams } from '../../../hooks/useParams';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAIDataTypesQuery } from '../../../services/dataTypes/queries/useAIDataTypesQuery';
import { useSelectedDataModels } from '../../../services/useSelectedDataModels';

export const useAICacheEdited = (
  copilotMessage:
    | (CopilotDataModelQueryResponse & { edited?: boolean })
    | undefined,
  setMessage: Dispatch<
    SetStateAction<
      (CopilotDataModelQueryResponse & { edited?: boolean }) | undefined
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
    if (!results) {
      return;
    }

    const response = Object.values(results)[0];

    const content = getContent(t, copilotMessage, response);

    setMessage((current) => {
      if (content === current?.content) {
        return current;
      }
      const newMessage = current
        ? {
            ...current,
            content,
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

export const getContent = (
  t: (...props: any[]) => string,
  copilotMessage:
    | (CopilotDataModelQueryResponse & { edited?: boolean })
    | undefined,
  response: any
) => {
  let content = '';
  // if aggregate call summarize result differently
  if (
    !('pageInfo' in response) ||
    copilotMessage?.graphql.query.startsWith('query aggregate')
  ) {
    (response.items as any[]).forEach((item: { [key in string]: any }) => {
      const groupByText = item.group
        ? Object.entries(item.group)
            .map(([key, value]) =>
              t('AI_GQL_AGGREGATE_CHAIN_FOUND_RESULTS', { key, value })
            )
            .join(', ')
        : '';
      const valueText = item
        ? Object.entries(item)
            .filter(([key]) => key !== 'group')
            .map(([aggregate, entries]) => genEntries(t, aggregate, entries))
            .join(', ')
        : '';
      content += `${groupByText} ${valueText}\n\n`;
    });
  } else {
    const resultAggregate = `${response.items.length}${
      (response.pageInfo as { hasNextPage: boolean }).hasNextPage ? '+' : ''
    }`;
    content = t(
      copilotMessage?.edited
        ? 'AI_EDITED_FILTER_RESULTS'
        : 'AI_GQL_CHAIN_FOUND_RESULTS',
      {
        resultAggregate,
      }
    );
  }
  return content;
};

const genEntries = (
  t: (...props: any[]) => string,
  aggregate: string,
  entries: any[]
) => {
  return Object.entries(entries)
    .map(
      ([key, value]) =>
        `\n- ${t('AI_GQL_AGGREGATE_CHAIN_FOUND_RESULTS_DETAILS', {
          aggregate,
          key,
          value,
        })}`
    )
    .join('\n');
};
