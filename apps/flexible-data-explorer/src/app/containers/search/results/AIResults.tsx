import { useCallback, useEffect, useState } from 'react';

import styled from 'styled-components';

import { CopilotPurpleOverride } from '@fusion/copilot-core';

import {
  CopilotDataModelQueryMessage,
  addFromCopilotEventListener,
  sendToCopilotEvent,
  useToCopilotEventHandler,
  useFromCopilotEventHandler,
} from '@cognite/llm-hub';

import { SearchResults } from '../../../components/search/SearchResults';
import { useIsCogpilotEnabled } from '../../../hooks/useFlag';
import { useAIQueryLocalStorage } from '../../../hooks/useLocalStorage';
import {
  useAISearchParams,
  useSearchQueryParams,
} from '../../../hooks/useParams';
import { useSelectedDataModels } from '../../../services/useSelectedDataModels';
import { AIResultsList } from '../containers/AIResultsList';
import { AIResultSummary } from '../containers/AIResultSummary';
import { useAICacheEdited } from '../hooks/useAICacheEdited';

export const AIResults = () => {
  const [query] = useSearchQueryParams();
  const selectedDataModels = useSelectedDataModels();
  const [aiSearchEnabled] = useAISearchParams();
  const [isSearching, setIsSearching] = useState(false);

  const [copilotMessage, setMessage] = useState<
    (CopilotDataModelQueryMessage & { edited?: boolean }) | undefined
  >(undefined);

  const [cachedQuery, setCachedQuery] = useAIQueryLocalStorage();
  useAICacheEdited(copilotMessage, setMessage);
  useEffect(() => {
    if (cachedQuery && !isSearching) {
      if (query === cachedQuery.search) {
        setMessage((currMessage) => currMessage || cachedQuery.message);
      }
    }
  }, [cachedQuery, isSearching, query]);

  const isCopilotEnabled = useIsCogpilotEnabled();

  useToCopilotEventHandler('NEW_MESSAGES', (messages) => {
    for (const message of messages) {
      if (message.type === 'data-model-query' && message.replyTo === query) {
        setIsSearching(false);
        setMessage(message);
      }
    }
  });

  useFromCopilotEventHandler('SUMMARIZE_QUERY', ({ summary }) => {
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
  });

  const sendMessage = useCallback(() => {
    if (cachedQuery?.search !== query) {
      setMessage(undefined);
      setIsSearching(true);
      sendToCopilotEvent('NEW_CHAT_WITH_MESSAGES', {
        chain: 'GraphQlChain',
        messages: [
          {
            source: 'bot',
            type: 'data-models',
            dataModels: (selectedDataModels || []).map((model) => ({
              dataModel: model.externalId,
              space: model.space,
              version: model.version,
            })),
            content: 'I am looking at data in this data model',
            replyTo: '',
          },
          {
            source: 'user',
            content: query,
            type: 'text',
            context: 'Searched in Explorer',
          },
        ],
      });
    }
  }, [query, selectedDataModels, cachedQuery]);

  useEffect(() => {
    if (aiSearchEnabled && query && selectedDataModels && isCopilotEnabled) {
      sendMessage();
    }
  }, [
    query,
    isCopilotEnabled,
    aiSearchEnabled,
    selectedDataModels,
    sendMessage,
  ]);

  useEffect(() => {
    const removeHandler = addFromCopilotEventListener('CHAT_READY', () => {
      if (query && selectedDataModels) {
        sendMessage();
      }
      removeHandler();
    });
  }, [query, selectedDataModels, sendMessage]);

  if (!aiSearchEnabled || !isCopilotEnabled) {
    return null;
  }

  return (
    <Wrapper>
      <SearchResults key="ai-results">
        <AIResultSummary
          copilotMessage={copilotMessage}
          setCopilotMessage={setMessage}
        />
        <AIResultsList copilotMessage={copilotMessage} />
      </SearchResults>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  ${CopilotPurpleOverride}
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
