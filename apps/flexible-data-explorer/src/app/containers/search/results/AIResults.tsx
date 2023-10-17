import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import styled from 'styled-components';

import {
  CopilotPurpleOverride,
  useCopilotContext,
  GraphQlQueryFlow,
  CopilotDataModelQueryResponse,
  GraphQlSummaryFlow,
} from '@fusion/copilot-core';

import { useSDK } from '@cognite/sdk-provider';

import { SearchResults } from '../../../components/search/SearchResults';
import { useIsCogpilotEnabled } from '../../../hooks/useFlag';
import { useAIQueryLocalStorage } from '../../../hooks/useLocalStorage';
import {
  useAISearchParams,
  useSearchQueryParams,
} from '../../../hooks/useParams';
import { DataModelV2 } from '../../../services/types';
import { useSelectedDataModels } from '../../../services/useSelectedDataModels';
import { AIResultsList } from '../containers/AIResultsList';
import { AIResultSummary } from '../containers/AIResultSummary';
import { useAICacheEdited } from '../hooks/useAICacheEdited';

export const AIResults = () => {
  const [query] = useSearchQueryParams();
  const selectedDataModels = useSelectedDataModels();
  const [aiSearchEnabled] = useAISearchParams();
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [loadingStatus, setLoadingStatus] = useState<
    { status: string; stage?: number } | undefined
  >();
  const sdk = useSDK();

  const [copilotMessage, setMessage] = useState<
    (CopilotDataModelQueryResponse & { edited?: boolean }) | undefined
  >(undefined);

  const [cachedQuery, setCachedQuery] = useAIQueryLocalStorage();
  const currentQueryRef = useRef<string | null>(cachedQuery?.search || null);
  useAICacheEdited(copilotMessage, setMessage);
  useEffect(() => {
    if (cachedQuery && !isSearching) {
      if (query === cachedQuery.search) {
        setMessage((currMessage) => currMessage || cachedQuery.message);
      }
    }
  }, [cachedQuery, isSearching, query]);

  const isCopilotEnabled = useIsCogpilotEnabled();

  const graphQLFlow = useMemo(() => new GraphQlQueryFlow({ sdk }), [sdk]);
  const summarizeFlow = useMemo(() => new GraphQlSummaryFlow({ sdk }), [sdk]);

  const { runFlow } = useCopilotContext();

  const sendMessage = useCallback(
    (prompt: string, dataModels: DataModelV2[]) => {
      if (currentQueryRef.current === prompt) {
        return;
      }
      currentQueryRef.current = prompt;
      setError(undefined);
      setMessage(undefined);
      setIsSearching(true);

      runFlow(graphQLFlow, {
        prompt,
        sdk: sdk,
        selectedDataModels:
          dataModels?.map((el) => ({
            dataModel: el.externalId,
            version: el.version,
            space: el.space,
          })) || [],
        onStatus(_, progress = 0) {
          if (currentQueryRef.current === prompt) {
            if (progress < 0.3) {
              setLoadingStatus({
                status: 'Identifying correct data...',
                stage: progress,
              });
            } else if (progress < 0.6) {
              setLoadingStatus({
                status: 'Identifying correct filter...',
                stage: progress,
              });
            } else if (progress < 0.9) {
              setLoadingStatus({
                status: 'Summarizing results...',
                stage: progress,
              });
            } else {
              setLoadingStatus({ status: 'Finishing up...', stage: progress });
            }
          }
        },
      })
        .then((message) => {
          if (currentQueryRef.current === prompt) {
            setIsSearching(false);
            setMessage(message);
            setLoadingStatus(undefined);
          }
        })
        .catch((e) => {
          if (currentQueryRef.current === prompt) {
            setError(e.message);
          }
        });
    },
    [graphQLFlow, runFlow, sdk]
  );

  useEffect(() => {
    if (aiSearchEnabled && query && selectedDataModels && isCopilotEnabled) {
      sendMessage(query, selectedDataModels);
    }
  }, [
    query,
    isCopilotEnabled,
    aiSearchEnabled,
    selectedDataModels,
    sendMessage,
  ]);

  const handleEditFilter = (newFilter: any) => {
    runFlow(summarizeFlow, {
      queryType: copilotMessage?.queryType || '',
      relevantTypes: copilotMessage?.relevantTypes || [],
      prompt: '...',
      sdk: sdk,
      query: copilotMessage?.graphql.query || '',
      variables: {
        ...copilotMessage?.graphql.variables,
        filter: newFilter || {},
      },
    })
      .then(({ content: summary }) => {
        setIsSearching(false);
        setMessage((curr) => {
          const newMessage = curr ? { ...curr, summary } : undefined;
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
      })
      .catch(() => {
        setError('');
      });
  };

  if (!aiSearchEnabled || !isCopilotEnabled) {
    return null;
  }

  return (
    <Wrapper>
      <SearchResults key="ai-results">
        <AIResultSummary
          copilotMessage={copilotMessage}
          setCopilotMessage={setMessage}
          error={error}
          loadingStatus={loadingStatus}
          onEditFilter={handleEditFilter}
        />
        <AIResultsList copilotMessage={copilotMessage} />
      </SearchResults>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  ${CopilotPurpleOverride};
  --cogs-border--status-neutral--strong: #6f3be4;

  && > div {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .actions {
    margin-bottom: 12px;
  }
`;
