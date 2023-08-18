import { useEffect, useState } from 'react';

import styled from 'styled-components';

import {
  CopilotDataModelQueryMessage,
  addFromCopilotEventListener,
  sendToCopilotEvent,
  useToCopilotEventHandler,
  CopilotPurpleOverride,
  useFromCopilotEventHandler,
} from '@fusion/copilot-core';

import { SearchResults } from '../../../components/search/SearchResults';
import { useIsCopilotEnabled } from '../../../hooks/useFlag';
import { useAIQueryLocalStorage } from '../../../hooks/useLocalStorage';
import {
  useAISearchParams,
  useSearchFilterParams,
  useSearchQueryParams,
} from '../../../hooks/useParams';
import { useTranslation } from '../../../hooks/useTranslation';
import { useSelectedDataModels } from '../../../services/useSelectedDataModels';
import { AIResultsList } from '../containers/AIResultsList';
import { AIResultSummary } from '../containers/AIResultSummary';

export const AIResults = () => {
  const { t } = useTranslation();
  const [query] = useSearchQueryParams();
  const [filters] = useSearchFilterParams();
  const selectedDataModels = useSelectedDataModels();
  const [aiSearchEnabled] = useAISearchParams();
  const [isSearching, setIsSearching] = useState(false);

  const [copilotMessage, setMessage] = useState<
    (CopilotDataModelQueryMessage & { edited?: boolean }) | undefined
  >(undefined);

  const [cachedQuery] = useAIQueryLocalStorage();

  useEffect(() => {
    if (cachedQuery && !isSearching) {
      setMessage((currMessage) => currMessage || cachedQuery.message);
    }
  }, [cachedQuery, isSearching]);

  const isCopilotEnabled = useIsCopilotEnabled();

  useToCopilotEventHandler('NEW_MESSAGES', (messages) => {
    for (const message of messages) {
      if (message.type === 'data-model-query') {
        setIsSearching(false);
        setMessage(message);
      }
    }
  });

  useFromCopilotEventHandler('SUMMARIZE_QUERY', ({ summary }) => {
    setMessage((curr) => (curr ? { ...curr, summary } : undefined));
  });

  useEffect(() => {
    const sendMessage = () => {
      if (cachedQuery?.search !== query) {
        setMessage(undefined);
        setIsSearching(true);
        sendToCopilotEvent('NEW_MESSAGES', [
          {
            source: 'bot',
            type: 'data-models',
            dataModels: (selectedDataModels || []).map((model) => ({
              dataModel: model.externalId,
              space: model.space,
              version: model.version,
            })),
            content: 'I am looking at data in this data model',
          },
          {
            source: 'user',
            content: query,
            type: 'text',
            context: 'Searched in Explorer',
          },
        ]);
      }
    };
    if (aiSearchEnabled && query && selectedDataModels && isCopilotEnabled) {
      sendMessage();
    }
    const removeHandler = addFromCopilotEventListener('CHAT_READY', () => {
      if (query && selectedDataModels) {
        sendMessage();
      }
      removeHandler();
    });
  }, [
    query,
    filters,
    selectedDataModels,
    isCopilotEnabled,
    aiSearchEnabled,
    cachedQuery,
    t,
  ]);

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
