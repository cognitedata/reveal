import { useEffect, useState } from 'react';

import styled from 'styled-components';

import {
  addFromCopilotEventListener,
  sendToCopilotEvent,
  useFromCopilotEventHandler,
} from '@fusion/copilot-core';

import { Icon } from '@cognite/cogs.js';
import { useFlag } from '@cognite/react-feature-flags';

import {
  useSearchFilterParams,
  useSearchQueryParams,
} from '../../../hooks/useParams';
import { useAIDataTypesQuery } from '../../../services/dataTypes/queries/useAIDataTypesQuery';
import { useSelectedDataModels } from '../../../services/useSelectedDataModels';

export const AIResults = () => {
  const [query] = useSearchQueryParams();
  const [filters] = useSearchFilterParams();
  const selectedDataModels = useSelectedDataModels();

  const [gqlQuery, setGQLQuery] = useState('');
  const [variables, setVariables] = useState({});
  const [dataModel, setDataModel] = useState<
    { space: string; externalId: string; version: string } | undefined
  >(undefined);
  const [isAILoading, setIsAILoading] = useState(false);

  const { data, isLoading } = useAIDataTypesQuery(
    dataModel,
    gqlQuery,
    variables
  );

  const { isEnabled: isCopilotEnabled } = useFlag('COGNITE_COPILOT', {
    fallback: false,
  });

  useFromCopilotEventHandler(
    'GQL_QUERY',
    ({
      query: newGqlQuery,
      variables: newVariables,
      dataModel: newDataModel,
    }) => {
      setGQLQuery(newGqlQuery);
      setVariables(newVariables);
      setDataModel(newDataModel);
      setIsAILoading(false);
    }
  );

  useEffect(() => {
    const sendMessage = () => {
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
      setIsAILoading(true);
    };
    if (query && selectedDataModels && isCopilotEnabled) {
      sendMessage();
    }
    const removeHandler = addFromCopilotEventListener('CHAT_READY', () => {
      if (query && selectedDataModels) {
        sendMessage();
      }
      removeHandler();
    });
  }, [query, filters, selectedDataModels, isCopilotEnabled]);

  if (!isCopilotEnabled) {
    return <></>;
  }

  if (isLoading || isAILoading) {
    return (
      <Wrapper>
        <Icon type="Loader" />
      </Wrapper>
    );
  }

  console.log(data);

  return (
    <Wrapper>
      <h2>AI Results:</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  padding: 16px;
  background: mediumpurple;
  margin-bottom: 50px;
`;
